import { useState, useCallback } from 'react';
import type { Invoice } from '../types';

// Which invoice/receipt preview is open on the billing counter.
export const usePrint = () => {
  const [preview, setPreview] = useState<{ invoice: Invoice; kind: 'invoice' | 'receipt' } | null>(
    null
  );

  const openDocumentPreview = useCallback((invoice: Invoice, kind: 'invoice' | 'receipt') => {
    setPreview({ invoice, kind });
  }, []);

  const closeDocumentPreview = useCallback(() => {
    setPreview(null);
  }, []);

  return {
    preview,
    openDocumentPreview,
    closeDocumentPreview,
  };
};
