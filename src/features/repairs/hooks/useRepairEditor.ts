import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { JOB_STATUS, JOB_STATUS_LABELS, ROUTES, type JobStatus } from '@/constants';
import { toSplit, useJobEarnings } from '@/shared/hooks/useJobEarnings';
import { t } from '@/shared/i18n/t';
import { getErrorMessage } from '@/shared/lib/error';
import { snapshot } from '@/shared/lib/jobPanelState';
import { RepairFormValues, fromRepairJob, toRepairInput } from '@/shared/lib/moneyFormUtils';
import { notify } from '@/shared/notify';
import { billBlocker } from '../lib/billable';
import {
  isRework,
  itemsFromSaved,
  itemsProblem,
  toItemInputs,
  useRepairTotals,
  type ItemDraft,
} from '../lib/repairItems';
import type { RepairJob, RepairJobInput } from '../types';

export interface RepairEditorOptions {
  /** The job being changed; `null` for a new ticket. */
  job: RepairJob | null;
  /** The form is on screen. It loads the job when this turns on and clears itself when it turns off. */
  active: boolean;
  onSubmit: (values: RepairJobInput) => Promise<void>;
  /** Called once a save went through (before the browser moves on to billing, if it does). */
  onSaved: () => void;
}

/** The empty form for the same customer's next device. */
const nextForSameCustomer = (saved: RepairFormValues): RepairFormValues => ({
  ...fromRepairJob(null),
  customerKey: saved.customerKey,
  customerName: saved.customerName,
  customerPhone: saved.customerPhone,
});

/**
 * Everything the repair form works out: the typed values, the work items, what they come to, the
 * profit and the technician's share, and saving. The side panel calls this once and hands the
 * result to both the form and its pinned footer.
 */
export const useRepairEditor = ({ job, active, onSubmit, onSaved }: RepairEditorOptions) => {
  const navigate = useNavigate();
  const form = useForm<RepairFormValues>({
    initialValues: fromRepairJob(null),
    validate: {
      customerKey: (val) => (val === '' ? t('Choose the customer for this repair.') : null),
      deviceModel: (val) => (val.trim() ? null : t('Enter the device model.')),
      issueDescription: (val) => (val.trim() ? null : t('Describe the problem.')),
    },
  });

  const [drafts, setDrafts] = useState<ItemDraft[]>([]);
  const [tried, setTried] = useState(false);
  const [nestedOpen, setNestedOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [baseline, setBaseline] = useState('');

  // Reload when the form is shown or another job is chosen. Keyed on the job's key, not the
  // object: a background refresh of the list must not wipe what is being typed.
  const jobKey = job === null ? null : job.id;
  useEffect(() => {
    if (active) {
      const values = fromRepairJob(job);
      const items = job === null ? [] : itemsFromSaved(job.items);
      form.setValues(values);
      // Loading the job being edited into local state when the form opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDrafts(items);
      setBaseline(snapshot([values, items]));
    } else {
      form.reset();
      setDrafts([]);
      setBaseline('');
    }
    setTried(false);
    setNestedOpen(false);
    setPickerOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, jobKey]);

  const dirty = active && snapshot([form.values, drafts]) !== baseline;

  const kind = job === null ? ({ kind: 'standard' } as const) : job.kind;
  const rework = isRework(kind);
  // A billed or handed-back job's work no longer changes (the server refuses it too).
  const workLocked =
    job !== null && (job.status === 'delivered' || job.billedInvoiceNumber !== undefined);
  const totals = useRepairTotals(drafts, rework);
  const workProblem = workLocked ? null : itemsProblem(drafts, kind, form.values.status, totals);
  const hasStockPart = drafts.some(
    (draft) => draft.kind === 'part' && draft.part.source === 'stock'
  );

  // Profit and commission are the server's figures for what is typed so far.
  const split = toSplit(form.values);
  const priced = drafts.length > 0 && totals !== null && totals.costKnown;
  const earnings = useJobEarnings({
    ...split,
    priceCents: priced ? totals.totals.priceCents : null,
    materialCostCents: priced ? totals.totals.costCents : 0,
  });
  const figures = earnings.data;
  const profitCents = figures === undefined ? 0 : figures.profitCents;
  const payoutCents = figures === undefined ? 0 : figures.commissionCents;
  const capped = figures !== undefined && figures.capped;
  const priceHint = !priced
    ? drafts.length === 0
      ? t('Add the work to see profit')
      : t('Profit shows once saved')
    : null;

  // "Update & bill": what is typed is saved first, so the bill carries the saved price.
  const billJobId =
    job !== null &&
    billBlocker({
      kind: job.kind,
      status: form.values.status,
      billedInvoiceNumber: job.billedInvoiceNumber,
      items: drafts,
    }) === null
      ? job.id
      : null;

  /** Saves what is typed; `false` when something on the form stops it. */
  const save = async (values: RepairFormValues) => {
    setTried(true);
    if (workProblem !== null) {
      notify.error({ title: t('Cannot save repair'), message: workProblem });
      return false;
    }
    await onSubmit(toRepairInput(values, workLocked ? undefined : toItemInputs(drafts, rework)));
    return true;
  };

  const handleSubmit = async (values: RepairFormValues, billAfterSave: string | null) => {
    if (!(await save(values))) return;
    onSaved();
    if (billAfterSave !== null) navigate(`${ROUTES.BILLING}?billRepair=${billAfterSave}`);
  };

  // The Update Ticket button leaves a failed save to the page; this one must say it stayed here.
  const billAfterSave = (values: RepairFormValues, jobId: string) =>
    handleSubmit(values, jobId).catch((error: unknown) =>
      notify.error({ title: t('Could not save the repair'), message: getErrorMessage(error) })
    );

  /** Saves this ticket and leaves the form open, empty, for the same customer's next one. */
  const addAnother = async (values: RepairFormValues) => {
    try {
      if (!(await save(values))) return;
    } catch (error) {
      notify.error({ title: t('Could not save the repair'), message: getErrorMessage(error) });
      return;
    }
    const next = nextForSameCustomer(values);
    form.setValues(next);
    form.clearErrors();
    setDrafts([]);
    setBaseline(snapshot([next, []]));
    setTried(false);
    form.getInputNode('deviceModel')?.focus();
  };

  // The customer card sits at the top of the form, already in view; the other fields may not be.
  const focusFirstError = (keys: string[]) => {
    const key = keys.find(
      (k) => form.getInputNode(k) !== null && form.getInputNode(k) !== undefined
    );
    if (key !== undefined) form.getInputNode(key)?.focus();
  };

  const statusOptions = Object.values(JOB_STATUS).map((status: JobStatus) => ({
    value: status,
    label: JOB_STATUS_LABELS[status],
    // A job with parts from stock is handed back once it is billed, so its parts leave stock.
    disabled:
      status === 'delivered' &&
      !rework &&
      hasStockPart &&
      (job === null || (job.status !== 'delivered' && job.billedInvoiceKey === undefined)),
  }));

  return {
    form,
    drafts,
    setDrafts,
    tried,
    nestedOpen,
    setNestedOpen,
    pickerOpen,
    setPickerOpen,
    dirty,
    focusFirstError,
    rework,
    workLocked,
    totals,
    workProblem,
    hasStockPart,
    priced,
    profitCents,
    payoutCents,
    capped,
    priceHint,
    billJobId,
    statusOptions,
    handleSubmit,
    addAnother,
    billAfterSave,
  };
};

export type RepairEditor = ReturnType<typeof useRepairEditor>;
