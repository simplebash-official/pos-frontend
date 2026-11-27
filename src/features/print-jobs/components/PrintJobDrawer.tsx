import { useState } from 'react';
import { Button, Text } from '@mantine/core';
import { IconArrowRight, IconEdit, IconPlus, IconPrinter } from '@tabler/icons-react';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { DrawerFooter, RichDrawer } from '@/shared/components/drawer';
import { t } from '@/shared/i18n/t';
import { closePanel, editPanel, viewPanel, type JobPanelState } from '@/shared/lib/jobPanelState';
import { usePrintJobEditor } from '../hooks/usePrintJobEditor';
import type { Invoice } from '@/features/billing/types';
import type { PrintJob, PrintJobInput } from '../types';
import { PRINT_JOB_FORM_ID, PrintJobEditForm } from './PrintJobEditForm';
import { PrintJobDetailFooter, PrintJobDetailView } from './PrintJobDetailView';

export interface PrintJobDrawerProps {
  panel: JobPanelState;
  onPanelChange: (panel: JobPanelState) => void;
  /** The job the panel is about; `null` while a new order is being made. */
  job: PrintJob | null;
  /** Saves the form: a new order when `job` is `null`, otherwise a change to `job`. */
  onSubmit: (values: PrintJobInput) => Promise<void>;
  loading: boolean;
  /** Tickets saved since the new-job form was opened. */
  savedTickets: readonly string[];
  /** `null` when this person may not print job slips. */
  onJobSlip: ((job: PrintJob) => void) | null;
  /** Opens the preview of the invoice that billed the job. */
  onPrintInvoice: (invoice: Invoice) => void;
  onBill: (job: PrintJob) => void;
  /** Pass `false` while a window opened over this panel is up, so Escape closes only that window. */
  closeOnEscape: boolean;
}

/**
 * The side panel for print jobs: a job's details, the form to change it, or an empty form for a
 * new order, all in one place so nothing opens over it.
 */
export const PrintJobDrawer = ({
  panel,
  onPanelChange,
  job,
  onSubmit,
  loading,
  savedTickets,
  onJobSlip,
  onPrintInvoice,
  onBill,
  closeOnEscape,
}: PrintJobDrawerProps) => {
  const editing = panel.open && panel.mode !== 'view';
  const [viewNested, setViewNested] = useState(false);
  const [pendingLeave, setPendingLeave] = useState<JobPanelState | null>(null);

  const backToJob =
    panel.mode === 'edit' && panel.key !== null ? viewPanel(panel.key) : closePanel(panel);
  const editor = usePrintJobEditor({
    job: panel.mode === 'edit' ? job : null,
    active: editing,
    onSubmit,
    onSaved: () => onPanelChange(backToJob),
  });

  /** Leave the form for `target`, asking first when something was typed. */
  const leave = (target: JobPanelState) => {
    if (editing && editor.dirty) setPendingLeave(target);
    else onPanelChange(target);
  };

  const title =
    panel.mode === 'view'
      ? {
          icon: <IconPrinter size={20} />,
          text: t('Print Order'),
          subtitle: t('What was ordered and the money'),
        }
      : panel.mode === 'edit'
        ? {
            icon: <IconEdit size={20} />,
            text: job === null ? t('Edit Print Job') : `${t('Edit Print Job')} ${job.ticketNumber}`,
            subtitle: t('Change anything, then save'),
          }
        : {
            icon: <IconPlus size={20} />,
            text: t('Create New Print Order'),
            subtitle: t('Who it is for, what to print and what will be charged'),
          };

  return (
    <>
      <RichDrawer
        data={panel}
        opened={panel.open}
        onClose={() => leave(closePanel(panel))}
        width="wide"
        closeOnEscape={closeOnEscape && !viewNested && !editor.nestedOpen && pendingLeave === null}
        title={title}
        footer={(shown) =>
          shown.mode === 'view' ? (
            job === null ? null : (
              <PrintJobDetailFooter
                job={job}
                onEdit={(target) => onPanelChange(editPanel(target.id))}
                onPrintInvoice={onPrintInvoice}
                onBill={onBill}
              />
            )
          ) : (
            <DrawerFooter
              start={
                shown.mode === 'create' && savedTickets.length > 0 ? (
                  <Text size="xs" c="dimmed" role="status">
                    {`${t('Saved this visit')}: ${savedTickets.join(', ')}`}
                  </Text>
                ) : undefined
              }
            >
              <Button
                variant="default"
                size="sm"
                disabled={loading}
                onClick={() => leave(backToJob)}
              >
                {shown.mode === 'create' && savedTickets.length > 0 && !editor.dirty
                  ? t('Done')
                  : t('Cancel')}
              </Button>
              {shown.mode === 'create' && (
                <Button
                  variant="light"
                  color="blue"
                  size="sm"
                  loading={loading}
                  onClick={() =>
                    editor.form.onSubmit(editor.addAnother, (errors) =>
                      editor.focusFirstError(Object.keys(errors))
                    )()
                  }
                >
                  {t('Save & add another')}
                </Button>
              )}
              <Button
                type="submit"
                form={PRINT_JOB_FORM_ID}
                color="blue"
                size="sm"
                loading={loading}
              >
                {shown.mode === 'edit' ? t('Update Print Job') : t('Create Print Job')}
              </Button>
              {editor.billJobId !== null && (
                <Button
                  variant="light"
                  color="blue"
                  size="sm"
                  loading={loading}
                  onClick={() =>
                    editor.form.onSubmit((values) =>
                      editor.billAfterSave(values, editor.billJobId ?? '')
                    )()
                  }
                  rightSection={<IconArrowRight size={16} />}
                >
                  {t('Update & bill')}
                </Button>
              )}
            </DrawerFooter>
          )
        }
      >
        {(shown) =>
          shown.mode === 'view' ? (
            job === null ? null : (
              <PrintJobDetailView
                key={job.id}
                job={job}
                onJobSlip={onJobSlip}
                onNestedWindowChange={setViewNested}
              />
            )
          ) : (
            <PrintJobEditForm editor={editor} job={shown.mode === 'edit' ? job : null} />
          )
        }
      </RichDrawer>

      <ConfirmDialog
        opened={pendingLeave !== null}
        onClose={() => setPendingLeave(null)}
        onConfirm={() => {
          if (pendingLeave !== null) onPanelChange(pendingLeave);
          setPendingLeave(null);
        }}
        title={t('Discard unsaved changes?')}
        confirmLabel={t('Discard')}
        cancelLabel={t('Keep editing')}
        zIndex={400}
      >
        {t('What you typed on this order has not been saved.')}
      </ConfirmDialog>
    </>
  );
};
