// Renders the repair side panel on its own in edit or create mode, for tests (not a test file).
import { RepairDrawer } from '../components/RepairDrawer';
import type { RepairJob, RepairJobInput } from '../types';

export interface RepairFormHostProps {
  opened: boolean;
  /** Called when the panel leaves the form: closed, or back to the job after a save. */
  onClose: () => void;
  onSubmit: (values: RepairJobInput) => Promise<void>;
  jobToEdit?: RepairJob | null;
  loading?: boolean;
}

export const RepairFormHost = ({
  opened,
  onClose,
  onSubmit,
  jobToEdit,
  loading = false,
}: RepairFormHostProps) => {
  const job = jobToEdit === undefined ? null : jobToEdit;
  return (
    <RepairDrawer
      panel={{
        open: opened,
        mode: job === null ? 'create' : 'edit',
        key: job === null ? null : job.id,
      }}
      onPanelChange={(next) => {
        if (!next.open || next.mode === 'view') onClose();
      }}
      job={job}
      onSubmit={onSubmit}
      loading={loading}
      savedTickets={[]}
      onJobSlip={null}
      onPrintInvoice={() => undefined}
      onBill={() => undefined}
      closeOnEscape
    />
  );
};
