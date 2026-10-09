import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { t } from '@/shared/i18n/t';
import { ROUTES } from '@/constants/routes';
import { queryKeys } from '@/api/queryKeys';
import { logger } from '@/shared/logging';
import { syncNow } from '@/features/sync-status/api/syncStatusApi';
import { useSyncStatus } from '@/features/sync-status/hooks/useSyncStatus';
import { useSetupStatus } from '../hooks/useSetupStatus';
import { completeInstallationSetupNative } from '../api/onboardingApi';
import { isFirstSyncDone, joinOutcome, JOIN_TIMEOUT_MS } from '../lib/joinCloudShop';

export interface JoinCloudShopStepProps {
  shopName?: string | null;
  /** The shop could not be downloaded: show the "set up here" form instead. */
  onUseForm: () => void;
  /** The shop came down with its admin but still needs the demo-vs-clean choice. */
  onCloudAdmin: () => void;
  onPrev: () => void;
}

/**
 * Shown instead of the admin form when this computer is linked to a cloud shop.
 * The shop (and its admin) is downloaded in the background; once the local
 * backend reports setup complete the person just signs in.
 */
export const JoinCloudShopStep = ({
  shopName,
  onUseForm,
  onCloudAdmin,
  onPrev,
}: JoinCloudShopStepProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sync = useSyncStatus();
  const { data: setup, refetch } = useSetupStatus();
  const [timedOut, setTimedOut] = useState(false);
  const [checkedAfterSync, setCheckedAfterSync] = useState(false);
  const finished = useRef(false);

  // Make sure a cycle runs now, and read the setup status while we wait.
  useEffect(() => {
    void syncNow().catch(() => {});
    const poll = window.setInterval(() => void refetch(), 2_000);
    const timeout = window.setTimeout(() => setTimedOut(true), JOIN_TIMEOUT_MS);
    return () => {
      window.clearInterval(poll);
      window.clearTimeout(timeout);
    };
  }, [refetch]);

  // After the first sync finishes, read the setup status once more so "nothing
  // was downloaded" is a fact and not a stale answer.
  const syncDone = isFirstSyncDone(sync);
  useEffect(() => {
    if (!syncDone) return;
    void refetch().then(() => setCheckedAfterSync(true));
  }, [syncDone, refetch]);

  const outcome = joinOutcome({
    setupCompleted: Boolean(setup?.setup_completed),
    isFirstRun: setup?.is_first_run ?? true,
    sync,
    setupCheckedAfterSync: checkedAfterSync,
    timedOut,
  });

  useEffect(() => {
    if (finished.current) return;
    if (outcome === 'form') {
      finished.current = true;
      logger.info('onboarding', 'join.fallback', { timedOut, syncState: sync.state });
      onUseForm();
    } else if (outcome === 'cloud-admin') {
      finished.current = true;
      logger.info('onboarding', 'join.cloud_admin');
      onCloudAdmin();
    } else if (outcome === 'joined') {
      finished.current = true;
      logger.info('onboarding', 'join.done');
      void (async () => {
        await completeInstallationSetupNative(false);
        await queryClient.invalidateQueries({ queryKey: queryKeys.system.all });
        notifications.show({
          color: 'teal',
          message: t('Your shop is ready. Sign in as "admin" with the password you chose.'),
        });
        navigate(`${ROUTES.LOGIN}?username=admin`, { replace: true });
      })();
    }
  }, [outcome, onUseForm, onCloudAdmin, navigate, queryClient, timedOut, sync.state]);

  return (
    <Stack gap="lg" align="center" ta="center" role="status" data-testid="join-cloud-shop">
      <Loader />
      <Title order={2}>{t('Getting your shop from the cloud…')}</Title>
      <Text c="dimmed" maw={480}>
        {shopName
          ? t(
              'We are downloading {shop} to this computer. This usually takes a few seconds.'
            ).replace('{shop}', shopName)
          : t('We are downloading your shop to this computer. This usually takes a few seconds.')}
      </Text>
      <Group>
        <Button variant="default" onClick={onPrev} style={{ minHeight: 44 }}>
          {t('Back')}
        </Button>
        <Button
          variant="subtle"
          color="gray"
          onClick={onUseForm}
          data-log-id="join.use-form"
          style={{ minHeight: 44 }}
        >
          {t('Set up a new shop here instead')}
        </Button>
      </Group>
    </Stack>
  );
};
