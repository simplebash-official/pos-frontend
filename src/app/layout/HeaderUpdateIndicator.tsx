import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { ActionIcon, Button, Group, Loader, RingProgress, Text, Tooltip } from '@mantine/core';
import { IconCircleCheck, IconDownload } from '@tabler/icons-react';

import { usePwaUpdate } from '@/app/pwa/PwaUpdateContext';
import { shouldOfferUpdate } from '@/app/pwa/updatePolicy';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { isTauri } from '@/shared/lib/runtime';

interface HeaderUpdateIndicatorProps {
  cartItemsCount: number;
}

/**
 * Shows a new web version arriving: download progress in the header, then an
 * "Update now" button. The desktop app updates from Settings → About, so this
 * renders nothing there.
 *
 * Applying an update reloads the page and the cart is not persisted, so the
 * button stays disabled while a sale is on the till and asks for confirmation.
 */
export const HeaderUpdateIndicator = ({ cartItemsCount }: HeaderUpdateIndicatorProps) => {
  const pwa = usePwaUpdate();
  const isMobile = useIsMobile();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  if (isTauri() || !pwa || pwa.update.phase === 'idle') return null;

  const { phase, percent } = pwa.update;
  const canUpdate = shouldOfferUpdate(phase === 'ready', cartItemsCount);

  const handleConfirm = async () => {
    setApplying(true);
    try {
      await pwa.applyUpdate();
    } catch {
      // Reload is expected on success; catch only resets if update application failed.
      setApplying(false);
      setConfirmOpen(false);
    }
  };

  if (phase === 'downloading') {
    const label = t('Downloading the update…');
    return (
      <>
        <Tooltip label={label}>
          <Group
            gap={8}
            wrap="nowrap"
            className="update-pill"
            role="status"
            aria-label={label}
            data-log-id="update.downloading"
          >
            {isMobile ? (
              <RingProgress
                size={28}
                thickness={3}
                sections={[{ value: percent ?? 12, color: 'blue' }]}
                className={percent === null ? 'update-ring-indeterminate' : undefined}
              />
            ) : (
              <>
                <Loader size={14} />
                <Text
                  size="xs"
                  fw={600}
                  style={{
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{label}</span>
                  <span
                    className="update-pill-percent"
                    style={{ visibility: percent === null ? 'hidden' : 'visible' }}
                    aria-hidden={percent === null ? true : undefined}
                  >
                    {percent === null ? '' : `${percent}%`}
                  </span>
                </Text>
              </>
            )}
          </Group>
        </Tooltip>
        <div className="update-progress-track" aria-hidden="true">
          <div
            className={
              percent === null
                ? 'update-progress-bar update-progress-indeterminate'
                : 'update-progress-bar'
            }
            style={percent === null ? undefined : { transform: `scaleX(${percent / 100})` }}
          />
        </div>
      </>
    );
  }

  const readyHint = canUpdate
    ? t('A newer version of the POS is ready.')
    : t('Finish the current sale to update.');

  return (
    <>
      <Tooltip label={readyHint}>
        <Group
          gap={8}
          wrap="nowrap"
          className="update-pill update-pill-ready"
          data-log-id="update.ready"
        >
          {isMobile ? (
            <ActionIcon
              variant="filled"
              color="blue"
              size={44}
              disabled={!canUpdate}
              aria-label={t('Update now')}
              onClick={() => setConfirmOpen(true)}
            >
              <IconDownload size={20} />
            </ActionIcon>
          ) : (
            <>
              <IconCircleCheck size={16} color="var(--mantine-color-blue-light-color)" />
              <Text size="xs" fw={600} style={{ whiteSpace: 'nowrap' }}>
                {t('Update ready')}
              </Text>
              {/* data-disabled keeps the tooltip working: a natively disabled button swallows hover. */}
              <Button
                size="compact-sm"
                variant="filled"
                color="blue"
                leftSection={<IconDownload size={14} />}
                data-disabled={canUpdate ? undefined : true}
                onClick={canUpdate ? () => setConfirmOpen(true) : undefined}
              >
                {t('Update now')}
              </Button>
            </>
          )}
        </Group>
      </Tooltip>

      <ConfirmDialog
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title={t('Update now?')}
        confirmLabel={t('Update now')}
        cancelLabel={t('Not yet')}
        confirmColor="blue"
        loading={applying}
      >
        {t(
          'This restarts the app to finish updating. Any sale you have started but not completed will be cleared.'
        )}
      </ConfirmDialog>
    </>
  );
};
