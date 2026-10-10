import { useState } from 'react';
import { t } from '@/shared/i18n/t';
import {
  Alert,
  Button,
  Divider,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useBrowserSignIn } from '../hooks/useBrowserSignIn';
import { useCloudState } from '../hooks/useCloudState';
import { shopLabel } from '../lib/shopLabel';
import { SwitchingNotice } from './SwitchingNotice';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GoogleMark = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"
    />
    <path
      fill="#FBBC05"
      d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
    />
  </svg>
);

const errorText = (code: string): string => {
  switch (code) {
    case 'expired':
      return t('That sign-in ran out of time. Please try again.');
    case 'browser':
      return t('We could not open your browser. Use the address below instead.');
    case 'network':
      return t("We couldn't reach SimpleBash. Check your internet connection and try again.");
    default:
      return t('We could not start signing in. Please try again.');
  }
};

export interface SignInPanelProps {
  /** Called once this computer is linked. */
  onLinked?: () => void;
  /** When given, shows a "Skip" link (the POS works fully offline). */
  onSkip?: () => void;
  /** Inside a dialog that already has a title and a frame: no heading and no card of its own. */
  embedded?: boolean;
}

/**
 * Sign in to the cloud account from this computer: Google or email, both
 * finished in the browser (the real SimpleBash web app), never typed into the POS.
 */
export const SignInPanel = ({ onLinked, onSkip, embedded }: SignInPanelProps) => {
  const flow = useBrowserSignIn({ onLinked });
  const { state } = useCloudState();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  const submitEmail = () => {
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setEmailError(t('Enter your email address.'));
      return;
    }
    setEmailError(null);
    void flow.start({ email: value });
  };

  if (flow.switching) {
    return <SwitchingNotice shop={shopLabel(state)} />;
  }

  if (flow.pending) {
    return (
      <Stack gap="md" align="center" ta="center" role="status" data-testid="waiting-for-browser">
        <Loader size="sm" />
        <Title order={3}>{t('Finish signing in in your browser')}</Title>
        <Text size="sm" c="dimmed">
          {t('Sign in there and choose “Link this computer”. This window continues by itself.')}
        </Text>
        <Paper px="xl" py="sm" bg="var(--bg-hover)">
          <Text size="xs" c="dimmed">
            {t('Code')}
          </Text>
          <Text fw={800} size="xl" ff="monospace" style={{ letterSpacing: '0.15em' }}>
            {flow.pending.userCode}
          </Text>
        </Paper>
        {flow.error && (
          <Alert color="red" variant="light" w="100%">
            {errorText(flow.error)}
          </Alert>
        )}
        {flow.error === 'browser' && (
          <Text size="xs" ff="monospace" style={{ overflowWrap: 'anywhere' }}>
            {flow.pending.verificationUrl}
          </Text>
        )}
        <Group>
          <Button variant="default" onClick={() => void flow.reopen()} data-log-id="signin.reopen">
            {t('Open the browser again')}
          </Button>
          <Button
            variant="subtle"
            color="gray"
            onClick={flow.cancel}
            loading={flow.cancelling}
            data-log-id="signin.cancel"
          >
            {t('Cancel')}
          </Button>
        </Group>
      </Stack>
    );
  }

  const methods = (
    <Stack gap="md">
      <Button
        variant="default"
        size="md"
        fullWidth
        leftSection={<GoogleMark />}
        loading={flow.starting}
        style={{ minHeight: 44 }}
        onClick={() => void flow.start({ provider: 'google' })}
        data-log-id="signin.google"
      >
        {t('Continue with Google')}
      </Button>
      <Divider label={t('OR')} labelPosition="center" />
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submitEmail();
        }}
      >
        <Stack gap="md">
          <TextInput
            aria-label={t('Email address')}
            placeholder={t('Enter your email')}
            type="email"
            size="md"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            error={emailError}
          />
          <Button
            type="submit"
            size="md"
            fullWidth
            loading={flow.starting}
            style={{ minHeight: 44 }}
            data-log-id="signin.email"
          >
            {t('Continue with email')}
          </Button>
        </Stack>
      </form>
      {flow.error && (
        <Alert color="red" variant="light" role="alert">
          {errorText(flow.error)}
        </Alert>
      )}
      <Text size="xs" c="dimmed" ta="center">
        {t('You finish signing in on the SimpleBash website, in your browser.')}
      </Text>
    </Stack>
  );

  return (
    <Stack gap="lg" maw={420} mx="auto" w="100%">
      {embedded ? (
        methods
      ) : (
        <>
          <Title order={1} ta="center" fw={500} style={{ fontFamily: 'Georgia, serif' }}>
            {t('Sign In')}
          </Title>
          <Paper p="lg">{methods}</Paper>
        </>
      )}
      {onSkip && (
        <Button variant="subtle" color="gray" onClick={onSkip} data-log-id="signin.skip">
          {t('Skip for now')}
        </Button>
      )}
    </Stack>
  );
};
