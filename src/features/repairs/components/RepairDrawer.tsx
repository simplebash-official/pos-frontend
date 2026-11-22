import { useState } from 'react';
import { Button } from '@mantine/core';
import { IconArrowRight, IconEdit, IconPlus, IconTool } from '@tabler/icons-react';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { DrawerFooter, RichDrawer } from '@/shared/components/drawer';
import { t } from '@/shared/i18n/t';
import { closePanel, editPanel, viewPanel, type JobPanelState } from '@/shared/lib/jobPanelState';
import { useRepairEditor } from '../hooks/useRepairEditor';
import type { RepairJob, RepairJobInput } from '../types';
import { REPAIR_FORM_ID, RepairEditForm } from './RepairEditForm';
import { RepairDetailFooter, RepairDetailView } from './RepairDetailView';

export interface RepairDrawerProps {
  panel: JobPanelState;
  onPanelChange: (panel: JobPanelState) => void;
  /** The job the panel is about; `null` while a new ticket is being made. */
  job: RepairJob | null;
  /** Saves the form: a new ticket when `job` is `null`, otherwise a change to `job`. */
  onSubmit: (values: RepairJobInput) => Promise<void>;
  loading: boolean;
  /** `null` when this person may not print receipts. */
  onPrintReceipt: ((job: RepairJob) => void) | null;
  onBill: (job: RepairJob) => void;
  /** Pass `false` while a window opened over this panel is up, so Escape closes only that window. */
  closeOnEscape: boolean;
}

/**
 * The side panel for repair jobs: a job's details, the form to change it, or an empty form for a
 * new ticket, all in one place so nothing opens over it.
 */
export const RepairDrawer = ({
  panel,
  onPanelChange,
  job,
  onSubmit,
  loading,
  onPrintReceipt,
  onBill,
  closeOnEscape,
}: RepairDrawerProps) => {
  const editing = panel.open && panel.mode !== 'view';
  const [viewNested, setViewNested] = useState(false);
  const [pendingLeave, setPendingLeave] = useState<JobPanelState | null>(null);

  const backToJob =
    panel.mode === 'edit' && panel.key !== null ? viewPanel(panel.key) : closePanel(panel);
  const editor = useRepairEditor({
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

  const isEditing = panel.mode === 'edit';
  const title =
    panel.mode === 'view'
      ? {
          icon: <IconTool size={20} />,
          text: t('Repair Ticket'),
          subtitle: t('What came in, the work and the money'),
        }
      : panel.mode === 'edit'
        ? {
            icon: <IconEdit size={20} />,
            text: job === null ? t('Edit Ticket') : `${t('Edit Ticket')} ${job.ticketNumber}`,
            subtitle: t('Change anything, then save'),
          }
        : {
            icon: <IconPlus size={20} />,
            text: t('Create New Repair Ticket'),
            subtitle: t('Who it is for, what is wrong and what will be done'),
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
              <RepairDetailFooter
                job={job}
                onEdit={(target) => onPanelChange(editPanel(target.id))}
                onPrintReceipt={onPrintReceipt}
                onBill={onBill}
              />
            )
          ) : (
            <DrawerFooter>
              <Button
                variant="default"
                size="sm"
                disabled={loading}
                onClick={() => leave(backToJob)}
              >
                {t('Cancel')}
              </Button>
              <Button type="submit" form={REPAIR_FORM_ID} color="blue" size="sm" loading={loading}>
                {isEditing ? t('Update Ticket') : t('Create Repair Ticket')}
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
              <RepairDetailView key={job.id} job={job} onNestedWindowChange={setViewNested} />
            )
          ) : (
            <RepairEditForm editor={editor} job={shown.mode === 'edit' ? job : null} />
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
        {t('What you typed on this ticket has not been saved.')}
      </ConfirmDialog>
    </>
  );
};
