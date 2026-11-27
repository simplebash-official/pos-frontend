import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import {
  PRINT_JOB_STATUS,
  PRINT_JOB_STATUS_LABELS,
  ROUTES,
  type PrintJobStatus,
} from '@/constants';
import { toSplit, useJobEarnings } from '@/shared/hooks/useJobEarnings';
import { billBlocker } from '@/shared/lib/billBlocker';
import { t } from '@/shared/i18n/t';
import { getErrorMessage } from '@/shared/lib/error';
import { snapshot } from '@/shared/lib/jobPanelState';
import { PrintJobFormValues, fromPrintJob, toPrintJobInput } from '@/shared/lib/moneyFormUtils';
import { notify } from '@/shared/notify';
import {
  draftsFromSaved,
  isRework,
  itemsProblem,
  lineQuantity,
  toItemInputs,
  usePrintTotals,
  type PrintDraft,
} from '../lib/printItems';
import type { PrintJob, PrintJobInput } from '../types';

/** The most characters a note can have; the server enforces the same. */
export const NOTE_MAX = 1000;

export interface PrintJobEditorOptions {
  /** The job being changed; `null` for a new order. */
  job: PrintJob | null;
  /** The form is on screen. It loads the job when this turns on and clears itself when it turns off. */
  active: boolean;
  onSubmit: (values: PrintJobInput) => Promise<void>;
  /** Called once a save went through (before the browser moves on to billing, if it does). */
  onSaved: () => void;
}

/** The empty form for the same customer's next order. */
const nextForSameCustomer = (saved: PrintJobFormValues): PrintJobFormValues => ({
  ...fromPrintJob(null),
  customerKey: saved.customerKey,
  customerName: saved.customerName,
  customerPhone: saved.customerPhone,
});

/** The rows without their on-screen ids, to tell whether anything was changed. */
const rowsSignature = (drafts: PrintDraft[]): string =>
  snapshot(drafts.map(({ uid: _uid, ...rest }) => rest));

/**
 * Everything the print job form works out: the typed values, the lines, what they come to, the
 * profit and the operator's share, and saving. The side panel calls this once and hands the
 * result to both the form and its pinned footer.
 */
export const usePrintJobEditor = ({ job, active, onSubmit, onSaved }: PrintJobEditorOptions) => {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<PrintDraft[]>([]);
  const [tried, setTried] = useState(false);
  const [nestedOpen, setNestedOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  /** The values and rows as the form opened with them. */
  const [loaded, setLoaded] = useState({ values: '', rows: '', note: '' });

  const form = useForm<PrintJobFormValues>({
    initialValues: fromPrintJob(null),
    validate: {
      customerKey: (val) => (val === '' ? t('Choose the customer for this print order.') : null),
      quantity: (val) =>
        Number.isInteger(Number(val)) && Number(val) >= 1 ? null : t('Quantity must be at least 1'),
      // An untouched note is not sent, so a longer one saved by the server is left as it is.
      note: (val) =>
        val !== loaded.note && val.trim().length > NOTE_MAX
          ? t('A note can be at most 1000 characters.')
          : null,
    },
  });

  // Reload when the form is shown or another job is chosen. Keyed on the job's key, not the
  // object: a background refresh of the list must not wipe what is being typed.
  const jobKey = job === null ? null : job.id;
  useEffect(() => {
    if (active) {
      const values = fromPrintJob(job);
      const rows = job === null ? [] : draftsFromSaved(job.items);
      form.setValues(values);
      // Loading the job being edited into local state when the form opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDrafts(rows);
      setLoaded({ values: snapshot(values), rows: rowsSignature(rows), note: values.note });
    } else {
      form.reset();
      setDrafts([]);
      setLoaded({ values: '', rows: '', note: '' });
    }
    setTried(false);
    setNestedOpen(false);
    setPickerOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, jobKey]);

  const rowsChanged = rowsSignature(drafts) !== loaded.rows;
  const dirty = active && (snapshot(form.values) !== loaded.values || rowsChanged);

  const kind = job === null ? ({ kind: 'standard' } as const) : job.kind;
  const rework = isRework(kind);
  // A billed or handed-back job's lines no longer change (the server refuses it too).
  const workLocked =
    job !== null && (job.status === 'delivered' || job.billedInvoiceNumber !== undefined);
  const totals = usePrintTotals(drafts, rework);
  const workProblem = workLocked ? null : itemsProblem(drafts, kind, form.values.status, totals);
  const hasStockPart = drafts.some((draft) => draft.kind === 'stock');
  const orderQuantity = lineQuantity(
    form.values.quantity === '' ? '' : Number(form.values.quantity)
  );

  // Profit and commission are the server's figures for what is typed so far.
  const priced = drafts.length > 0 && totals !== null && totals.costKnown;
  const earnings = useJobEarnings({
    ...toSplit(form.values),
    priceCents: priced ? totals.totals.priceCents : null,
    materialCostCents: priced ? totals.totals.costCents : 0,
  });
  const figures = earnings.data;
  const profitCents = figures === undefined ? 0 : figures.profitCents;
  const payoutCents = figures === undefined ? 0 : figures.commissionCents;
  const capped = figures !== undefined && figures.capped;
  const priceHint = !priced
    ? drafts.length === 0
      ? t('Add the items to see profit')
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
  const save = async (values: PrintJobFormValues) => {
    setTried(true);
    if (workProblem !== null) {
      notify.error({ title: t('Cannot save the print job'), message: workProblem });
      return false;
    }
    // Lines are sent only when they changed, so saving a note never fails because stock moved.
    const sendItems = !workLocked && (job === null || rowsChanged);
    const payload = toPrintJobInput(values, {
      items: sendItems ? toItemInputs(drafts, rework) : undefined,
      note: job === null || values.note !== loaded.note,
    });
    await onSubmit(payload);
    return true;
  };

  const handleSubmit = async (values: PrintJobFormValues, billAfterSave: string | null) => {
    if (!(await save(values))) return;
    onSaved();
    if (billAfterSave !== null) navigate(`${ROUTES.BILLING}?billPrint=${billAfterSave}`);
  };

  // The Update button leaves a failed save to the page; this one must say it stayed here.
  const billAfterSave = (values: PrintJobFormValues, jobId: string) =>
    handleSubmit(values, jobId).catch((error: unknown) =>
      notify.error({ title: t('Could not save the print job'), message: getErrorMessage(error) })
    );

  /** Saves this order and leaves the form open, empty, for the same customer's next one. */
  const addAnother = async (values: PrintJobFormValues) => {
    try {
      if (!(await save(values))) return;
    } catch (error) {
      notify.error({ title: t('Could not save the print job'), message: getErrorMessage(error) });
      return;
    }
    const next = nextForSameCustomer(values);
    form.setValues(next);
    form.clearErrors();
    setDrafts([]);
    setLoaded({ values: snapshot(next), rows: rowsSignature([]), note: next.note });
    setTried(false);
    form.getInputNode('quantity')?.focus();
  };

  // The customer card sits at the top of the form, already in view; the other fields may not be.
  const focusFirstError = (keys: string[]) => {
    const key = keys.find(
      (k) => form.getInputNode(k) !== null && form.getInputNode(k) !== undefined
    );
    if (key !== undefined) form.getInputNode(key)?.focus();
  };

  const statusOptions = Object.values(PRINT_JOB_STATUS).map((status: PrintJobStatus) => ({
    value: status,
    label: t(PRINT_JOB_STATUS_LABELS[status]),
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
    orderQuantity,
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

export type PrintJobEditor = ReturnType<typeof usePrintJobEditor>;
