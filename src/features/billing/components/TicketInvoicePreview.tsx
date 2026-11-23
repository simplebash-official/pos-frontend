import { lazy, Suspense, useState } from 'react';
import type { Invoice } from '../types';

const SaleDocumentPreviewModal = lazy(() =>
  import('./SaleDocumentPreviewModal').then((m) => ({ default: m.SaleDocumentPreviewModal }))
);

/**
 * The preview of the invoice that billed a repair or print job, opened as an invoice, with a
 * switch to the receipt. The pages hold the invoice to show; `null` keeps it closed.
 */
export const TicketInvoicePreview = ({
  invoice,
  onClose,
}: {
  invoice: Invoice | null;
  onClose: () => void;
}) => {
  const [kind, setKind] = useState<'invoice' | 'receipt'>('invoice');
  if (invoice === null) return null;
  return (
    <Suspense fallback={null}>
      <SaleDocumentPreviewModal
        opened
        onClose={() => {
          setKind('invoice');
          onClose();
        }}
        subject={{ kind: 'invoice', invoice }}
        documentKind={kind}
        onDocumentKindChange={setKind}
      />
    </Suspense>
  );
};
