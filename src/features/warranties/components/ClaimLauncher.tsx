import { useState } from 'react';
import { Anchor, Button, Group } from '@mantine/core';
import { IconClipboardCheck, IconReplace } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { PERMISSIONS } from '@/constants/permissions';
import { useCanSelfApprove, useHasPermission } from '@/shared/hooks/usePermissions';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { canQuickReplace, canStartClaim } from '../lib/warrantyView';
import type { Warranty, WarrantyClaim } from '../types';
import { QuickReplaceModal } from './QuickReplaceModal';
import { StartClaimModal } from './StartClaimModal';

type OpenWindow = 'start' | 'replace' | null;

export interface ClaimLauncherProps {
  warranty: Warranty;
  /** A row (small, light buttons) or a window footer (regular buttons with an icon). */
  compact: boolean;
  /** Called with the claim once it was started, e.g. to open it where the person already is. */
  onStarted?: (claim: WarrantyClaim) => void;
  /** Told when a claim window opens or closes, so a window around it can ignore Escape. */
  onNestedWindowChange?: (open: boolean) => void;
}

/**
 * The one way to claim on a warranty from anywhere in the app: the buttons that fit what can be
 * done with it, the windows they open, and, once a claim was started, a link to it. Give it a
 * `key` of the warranty so the link never outlives the warranty it belongs to.
 */
export const ClaimLauncher = ({
  warranty,
  compact,
  onStarted,
  onNestedWindowChange,
}: ClaimLauncherProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const canRecord = useHasPermission(PERMISSIONS.WARRANTY_CLAIMS_RECORD);
  const selfApproves = useCanSelfApprove();
  const [openWindow, setOpenWindow] = useState<OpenWindow>(null);
  const [started, setStarted] = useState<WarrantyClaim | null>(null);

  if (!canRecord) return null;

  const show = (next: OpenWindow) => {
    setOpenWindow(next);
    if (onNestedWindowChange !== undefined) onNestedWindowChange(next !== null);
  };
  const done = (claim: WarrantyClaim) => {
    show(null);
    setStarted(claim);
    if (onStarted !== undefined) onStarted(claim);
  };

  const size = compact ? (isMobile ? 'md' : 'xs') : 'sm';
  const variant = compact ? 'light' : 'filled';
  // A phone needs a 44px target; Mantine's `md` button is 42px.
  const height = compact && isMobile ? 44 : undefined;

  return (
    <>
      <Group gap="xs" wrap="wrap" justify="flex-end">
        {started !== null && (
          <Anchor
            component="button"
            type="button"
            size="sm"
            onClick={() => navigate(`${ROUTES.WARRANTIES}?view=claims&claim=${started.key}`)}
          >
            {`${t('Open claim')} ${started.claimNumber}`}
          </Anchor>
        )}
        {canQuickReplace(warranty) && (
          <Button
            size={size}
            h={height}
            variant={compact ? 'light' : 'default'}
            leftSection={compact ? undefined : <IconReplace size={16} />}
            onClick={() => show('replace')}
            data-log-id="warranties.open-quick-replace"
          >
            {t('Replace now')}
          </Button>
        )}
        {canStartClaim(warranty) && (
          <Button
            size={size}
            h={height}
            variant={variant}
            leftSection={compact ? undefined : <IconClipboardCheck size={16} />}
            onClick={() => show('start')}
            data-log-id="warranties.open-start-claim"
          >
            {warranty.state === 'expired' && !selfApproves
              ? t('Claim with manager approval')
              : t('Start claim')}
          </Button>
        )}
      </Group>
      {openWindow === 'start' && (
        <StartClaimModal warranty={warranty} onClose={() => show(null)} onStarted={done} />
      )}
      {openWindow === 'replace' && (
        <QuickReplaceModal warranty={warranty} onClose={() => show(null)} onReplaced={done} />
      )}
    </>
  );
};
