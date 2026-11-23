import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { toEarningsRequest, useJobEarnings } from '@/shared/hooks/useJobEarnings';
import { t } from '@/shared/i18n/t';
import { snapshot } from '@/shared/lib/jobPanelState';
import { PrintJobFormValues, fromPrintJob, toPrintJobInput } from '@/shared/lib/moneyFormUtils';
import type { PrintJob, PrintJobInput } from '../types';

export interface PrintJobEditorOptions {
  /** The job being changed; `null` for a new order. */
  job: PrintJob | null;
  /** The form is on screen. It loads the job when this turns on and clears itself when it turns off. */
  active: boolean;
  onSubmit: (values: PrintJobInput) => Promise<void>;
  /** Called once a save went through. */
  onSaved: () => void;
}

/**
 * Everything the print job form works out: the typed values, the profit and the operator's share,
 * and saving. The side panel calls this once and hands the result to both the form and its footer.
 */
export const usePrintJobEditor = ({ job, active, onSubmit, onSaved }: PrintJobEditorOptions) => {
  const [nestedOpen, setNestedOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [baseline, setBaseline] = useState('');

  const form = useForm<PrintJobFormValues>({
    initialValues: fromPrintJob(null),
    validate: {
      customerKey: (val) => (val === '' ? t('Choose the customer for this print order.') : null),
      quantity: (val) => (Number(val) >= 1 ? null : 'Quantity must be at least 1'),
      estimatedPriceRupees: (val) => {
        if (val === '' || val === undefined || val === null) {
          return 'Total price is required';
        }
        return Number(val) >= 0 ? null : 'Total price must be 0 or greater';
      },
      materialCostRupees: (val) =>
        val === '' || val === undefined || val === null || Number(val) >= 0
          ? null
          : 'Cost must be 0 or greater',
    },
  });

  // Reload when the form is shown or another job is chosen. Keyed on the job's key, not the
  // object: a background refresh of the list must not wipe what is being typed.
  const jobKey = job === null ? null : job.id;
  useEffect(() => {
    if (active) {
      const values = fromPrintJob(job);
      form.setValues(values);
      // Loading the job being edited when the form opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBaseline(snapshot(values));
    } else {
      form.reset();
      setBaseline('');
    }
    setNestedOpen(false);
    setPickerOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, jobKey]);

  const dirty = active && snapshot(form.values) !== baseline;

  // Profit and commission are the server's figures for what is typed so far.
  const earnings = useJobEarnings(toEarningsRequest(form.values));
  const figures = earnings.data;
  const profitCents = figures === undefined ? 0 : figures.profitCents;
  const payoutCents = figures === undefined ? 0 : figures.commissionCents;
  const capped = figures !== undefined && figures.capped;

  const handleSubmit = async (values: PrintJobFormValues) => {
    await onSubmit(toPrintJobInput(values));
    onSaved();
  };

  return {
    form,
    nestedOpen,
    setNestedOpen,
    pickerOpen,
    setPickerOpen,
    dirty,
    profitCents,
    payoutCents,
    capped,
    handleSubmit,
  };
};

export type PrintJobEditor = ReturnType<typeof usePrintJobEditor>;
