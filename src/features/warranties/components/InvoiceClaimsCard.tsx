import { useEffect } from 'react';
import { Button, Group, Text } from '@mantine/core';
import { IconClipboardCheck } from '@tabler/icons-react';
import { PERMISSIONS } from '@/constants/permissions';
import { DrawerCard, ListRow } from '@/shared/components/drawer';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { t } from '@/shared/i18n/t';
import { useClaims } from '../hooks/useClaims';
import { useWarranties } from '../hooks/useWarranties';
import { ageLabel, claimActions, decisionLabel } from '../lib/claimView';
import type { ClaimRefund, WarrantyClaim } from '../types';
import { ClaimStatusDot } from './WarrantyStateDot';

export interface InvoiceClaimsCardProps {
  invoiceKey: string;
  /** Opens the credit-note window for a claim decided as a refund. */
  onRefund: (refund: ClaimRefund) => void;
  /** Shows a claim on the Warranties page. */
  onOpen: (claimKey: string) => void;
  /** A claim to refund as soon as it has loaded (deep link from the claim). */
  refundOnLoad?: string;
}

/**
 * Warranty claims on this invoice, kept in view above the tabs like its credit notes. Hidden when
 * there are none. A claim decided as a refund is refunded from here, with a credit note.
 */
export const InvoiceClaimsCard = ({
  invoiceKey,
  onRefund,
  onOpen,
  refundOnLoad,
}: InvoiceClaimsCardProps) => {
  const canView = useHasPermission(PERMISSIONS.WARRANTIES_VIEW);
  const canRecord = useHasPermission(PERMISSIONS.WARRANTY_CLAIMS_RECORD);
  const claims = useClaims(canView ? { status: 'all', invoiceKey } : null);
  const warranties = useWarranties(canView ? { invoiceKey } : null);

  const refundOf = (claim: WarrantyClaim): ClaimRefund | null => {
    if (warranties.data === undefined) return null;
    const warranty = warranties.data.items.find((w) => w.key === claim.warrantyKey);
    if (warranty === undefined) return null;
    return {
      key: claim.key,
      claimNumber: claim.claimNumber,
      serialNumber: claim.serialNumber,
      lineIndex: warranty.lineIndex,
    };
  };

  const pending =
    refundOnLoad === undefined || claims.data === undefined
      ? undefined
      : claims.data.items.find(
          (claim) => claim.key === refundOnLoad && claimActions(claim, false).includes('refund')
        );
  const pendingRefund = pending === undefined ? null : refundOf(pending);
  useEffect(() => {
    if (pendingRefund !== null) onRefund(pendingRefund);
    // Once per deep link: the claim key is what changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingRefund?.key]);

  if (claims.data === undefined || claims.data.items.length === 0) return null;
  return (
    <DrawerCard label={t('Warranty claims')} icon={<IconClipboardCheck size={14} />}>
      {claims.data.items.map((claim, index) => {
        const refund =
          canRecord && claimActions(claim, false).includes('refund') ? refundOf(claim) : null;
        return (
          <ListRow
            key={claim.key}
            index={index}
            first={index === 0}
            icon={<IconClipboardCheck size={18} />}
            title={`${claim.claimNumber} · ${claim.itemName}`}
            meta={
              claim.decision === undefined ? ageLabel(claim.ageDays) : decisionLabel(claim.decision)
            }
            trailing={
              <Group gap="xs" wrap="nowrap">
                <ClaimStatusDot status={claim.status} size="xs" />
                {refund !== null ? (
                  <Button size="xs" onClick={() => onRefund(refund)}>
                    {t('Give the refund')}
                  </Button>
                ) : (
                  <Button size="xs" variant="subtle" onClick={() => onOpen(claim.key)}>
                    {t('Open')}
                  </Button>
                )}
              </Group>
            }
          />
        );
      })}
      <Text size="xs" c="dimmed" mt="xs">
        {t('Claims are worked on from the Warranties page.')}
      </Text>
    </DrawerCard>
  );
};
