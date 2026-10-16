import { t } from '@/shared/i18n/t';
import { useEffect, useState } from 'react';
import { PERMISSIONS } from '@/constants/permissions';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { logger } from '@/shared/logging';
import { fetchLabelCoverage } from '../api/labelsApi';
import { listenForLabelPrintOffers } from '../lib/labelPrintOffer';
import { rowFromOffer, type LabelRow } from '../lib/printJob';
import { labelCount } from '../lib/jobView';
import { LabelPrintModal } from './LabelPrintModal';

/**
 * Mounted once in the app shell: when new stock comes in, asks whether to print
 * its labels and opens the print window. Only for people who may print labels.
 */
export const LabelPrintOfferHost = () => {
  const canPrint = useHasPermission(PERMISSIONS.INVENTORY_WRITE);
  const [offered, setOffered] = useState<LabelRow | null>(null);
  const [printing, setPrinting] = useState<LabelRow | null>(null);

  useEffect(() => {
    if (!canPrint) return undefined;
    return listenForLabelPrintOffers((offer) => {
      // Read the product again: the stock that just arrived changed its prices and units.
      fetchLabelCoverage({ page: 1, limit: 1, productKeys: [offer.productKey] })
        .then((coverage) => {
          const found = coverage.items[0];
          if (found !== undefined) setOffered(rowFromOffer(found.product, offer));
        })
        .catch((error: unknown) => {
          // An offer is a convenience: failing to make one must not interrupt the stock screen.
          logger.warn('print', 'labels.offer_failed', { error: String(error) });
        });
    });
  }, [canPrint]);

  if (!canPrint) return null;

  const units =
    offered === null ? 0 : (offered.serialNumbers?.length ?? offered.product.stockQuantity);
  const labels =
    offered === null ? 0 : offered.product.isSerialized ? units * offered.copies : offered.copies;

  return (
    <>
      <ConfirmDialog
        opened={offered !== null}
        onClose={() => setOffered(null)}
        onConfirm={() => {
          setPrinting(offered);
          setOffered(null);
        }}
        title={t('Print labels for the new stock?')}
        confirmLabel={t('Print labels')}
        cancelLabel={t('Not now')}
        confirmColor="blue"
      >
        {offered !== null && (
          <>
            {labelCount(labels)} {t('for')} <b>{offered.product.name}</b>.{' '}
            {t('You can change how many before printing.')}
          </>
        )}
      </ConfirmDialog>
      {printing !== null && (
        <LabelPrintModal opened onClose={() => setPrinting(null)} rows={[printing]} />
      )}
    </>
  );
};
