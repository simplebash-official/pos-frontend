import { t } from '@/shared/i18n/t';
import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Code,
  Divider,
  Group,
  Paper,
  PasswordInput,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { formatDateTime } from '@/shared/lib/date';
import { logger } from '@/shared/logging';
import type { SectionProps } from '@/features/settings/components/sections/ShopProfileSection';
import { cloudLinkPoll, cloudRegister } from '../api/accountApi';
import {
  useCloudLinkStart,
  useCloudLogin,
  useCloudState,
  useCloudTelemetry,
  useCloudUnlink,
} from '../hooks/useCloudState';
import { accountMode, toCloudError, validateAccountForm } from '../lib/accountView';

type FormMode = 'signin' | 'register';

/**
 * Settings → Account. Optional: the POS works fully offline without it. Shown
 * only when the desktop shell reports a configured cloud (see settingsSections).
 */
export const AccountSection = (_props: SectionProps) => {
  const queryClient = useQueryClient();
  const { state } = useCloudState();
  const login = useCloudLogin();
  const linkStart = useCloudLinkStart();
  const unlink = useCloudUnlink();
  const telemetry = useCloudTelemetry();

  const [formMode, setFormMode] = useState<FormMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  const mode = accountMode(state);
  const pending = state.pendingLink;

  // Browser-approval path: poll until the owner approves the code on the website.
  useEffect(() => {
    if (mode !== 'pending' || !pending) return;
    const timer = window.setInterval(
      () => {
        void cloudLinkPoll()
          .then((result) => {
            if (result.status === 'linked') {
              queryClient.setQueryData(queryKeys.cloud.state(), result.state);
              logger.info('app', 'account.linked', { via: 'code' }, 'Device linked');
            }
          })
          .catch(() => undefined);
      },
      Math.max(2, pending.interval) * 1000
    );
    return () => window.clearInterval(timer);
  }, [mode, pending, queryClient]);

  const submit = async () => {
    setError(null);
    const invalid = validateAccountForm(
      { email, password, ownerName, storeName },
      formMode === 'register' ? 'register' : 'signin'
    );
    if (invalid) {
      setError(t(invalid));
      return;
    }
    setBusy(true);
    try {
      if (formMode === 'register') {
        const result = await cloudRegister({
          email: email.trim(),
          password,
          ownerName: ownerName.trim(),
          storeName: storeName.trim(),
        });
        logger.info('app', 'account.registered', { verification: result.verificationRequired });
        if (result.verificationRequired) {
          notifications.show({
            color: 'blue',
            message: t('Account created. Check your email to verify it, then sign in here.'),
          });
          setFormMode('signin');
          return;
        }
      }
      await login.mutateAsync({ email: email.trim(), password });
      logger.info('app', 'account.linked', { via: 'password' }, 'Device linked');
      setPassword('');
    } catch (err) {
      setError(toCloudError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const startCodeLink = () => {
    setError(null);
    linkStart.mutate(undefined, { onError: (err) => setError(toCloudError(err).message) });
  };

  const doUnlink = () => {
    unlink.mutate(undefined, {
      onSuccess: () => {
        logger.info('app', 'account.unlinked');
        setConfirmUnlink(false);
      },
      onError: (err) => setError(toCloudError(err).message),
    });
  };

  return (
    <Paper p="lg" withBorder style={{ backgroundColor: 'var(--bg-card)', flex: 1 }}>
      <Stack gap="md">
        <div>
          <Text fw={700} size="lg">
            {t('Cloud Account')}
          </Text>
          <Text size="sm" c="dimmed" mt={2}>
            {t(
              'Optional. Link this computer to your free account for cloud backup and web access. The POS keeps working offline either way.'
            )}
          </Text>
        </div>

        {mode === 'disabled' && (
          <Alert color="gray" variant="light">
            {t('Cloud features are not available in this build.')}
          </Alert>
        )}

        {mode === 'signed-out' && (
          <Stack gap="sm" maw={420}>
            <SegmentedControl
              value={formMode}
              onChange={(v) => setFormMode(v as FormMode)}
              data={[
                { label: t('Sign in'), value: 'signin' },
                { label: t('Register'), value: 'register' },
              ]}
            />
            {formMode === 'register' && (
              <>
                <TextInput
                  label={t('Owner name')}
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.currentTarget.value)}
                />
                <TextInput
                  label={t('Store name')}
                  value={storeName}
                  onChange={(e) => setStoreName(e.currentTarget.value)}
                />
              </>
            )}
            <TextInput
              label={t('Email')}
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <PasswordInput
              label={t('Password')}
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              data-log-redact
            />
            {error && (
              <Alert color="red" variant="light">
                {error}
              </Alert>
            )}
            <Button
              onClick={() => void submit()}
              loading={busy}
              data-log-id="account.submit"
            >
              {formMode === 'register'
                ? t('Register and link this device')
                : t('Sign in and link this device')}
            </Button>
            <Divider label={t('or')} labelPosition="center" />
            <Button
              variant="default"
              onClick={startCodeLink}
              loading={linkStart.isPending}
              data-log-id="account.link-with-code"
            >
              {t('Link using a code from the website')}
            </Button>
          </Stack>
        )}

        {mode === 'pending' && pending && (
          <Stack gap="sm" maw={460}>
            <Text size="sm">
              {t('Open this page on any device, sign in, and enter the code:')}
            </Text>
            <Code block>{pending.verificationUrl}</Code>
            <Text fw={800} size="xl" ff="monospace" style={{ letterSpacing: '0.15em' }}>
              {pending.userCode}
            </Text>
            <Text size="xs" c="dimmed">
              {t('Waiting for approval…')}
            </Text>
            <Group>
              <Button
                variant="default"
                onClick={doUnlink}
                loading={unlink.isPending}
                data-log-id="account.cancel-link"
              >
                {t('Cancel')}
              </Button>
            </Group>
          </Stack>
        )}

        {mode === 'linked' && (
          <Stack gap="xs">
            <Group gap="xs">
              <Badge color="teal" variant="light">
                {t('Linked')}
              </Badge>
              {state.shopCode && <Badge variant="light">{state.shopCode}</Badge>}
            </Group>
            <Text size="sm">
              {t('Account')}: <b>{state.accountEmail ?? '—'}</b>
            </Text>
            {state.linkedAt && (
              <Text size="xs" c="dimmed">
                {t('Linked on')}: {formatDateTime(state.linkedAt)}
              </Text>
            )}
            <Group mt="xs">
              <Button
                color="red"
                variant="light"
                onClick={() => setConfirmUnlink(true)}
                data-log-id="account.unlink"
              >
                {t('Unlink this device')}
              </Button>
            </Group>
          </Stack>
        )}

        {mode !== 'disabled' && (
          <>
            <Divider />
            <Switch
              checked={state.telemetryEnabled}
              disabled={telemetry.isPending}
              onChange={(e) => telemetry.mutate(e.currentTarget.checked)}
              label={t('Share anonymous usage statistics')}
              description={t(
                'App version, operating system and installation ID only. Never sales, customers or shop data.'
              )}
              data-log-id="account.telemetry"
            />
          </>
        )}
      </Stack>

      <ConfirmDialog
        opened={confirmUnlink}
        onClose={() => setConfirmUnlink(false)}
        onConfirm={doUnlink}
        title={t('Unlink this device?')}
        confirmLabel={t('Unlink')}
        loading={unlink.isPending}
      >
        {t('Your data stays on this computer. You can link it again at any time.')}
      </ConfirmDialog>
    </Paper>
  );
};
