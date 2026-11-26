// Renders the print job side panel on its own in edit or create mode, for tests (not a test file).
import { PrintJobDrawer } from '../components/PrintJobDrawer';
import type { PrintJob, PrintJobInput } from '../types';

export interface PrintJobFormHostProps {
  opened: boolean;
  /** Called when the panel leaves the form: closed, or back to the job after a save. */
  onClose: () => void;
  onSubmit: (values: PrintJobInput) => Promise<void>;
  jobToEdit?: PrintJob | null;
  loading?: boolean;
}

export const PrintJobFormHost = ({
  opened,
  onClose,
  onSubmit,
  jobToEdit,
  loading = false,
}: PrintJobFormHostProps) => {
  const job = jobToEdit === undefined ? null : jobToEdit;
  return (
    <PrintJobDrawer
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
      onJobSlip={null}
      onPrintInvoice={() => undefined}
      onBill={() => undefined}
      closeOnEscape
    />
  );
};
