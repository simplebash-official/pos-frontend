import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import {
  Alert,
  Button,
  Group,
  List,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { logger } from '@/shared/logging';
import { cloudLoginAndLink, cloudRegister } from '../api/accountApi';
import { toCloudError, validateAccountForm } from '../lib/accountView';

interface RegisterStepProps {
  onNext: () => void;
  onPrev: () => void;
}

/**
 * Optional first-run step: register a free cloud account. Skipping is always
 * possible and changes nothing about the local setup that follows.
 */
export const RegisterStep = ({ onNext, onPrev }: RegisterStepProps) => {
  const [ownerName, setOwnerName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const skip = () => {
    logger.info('onboarding', 'register.skipped');
    onNext();
  };

  const register = async () => {
    setError(null);
    const invalid = validateAccountForm({ email, password, ownerName, storeName }, 'register');
    if (invalid) {
      setError(t(invalid));
      return;
    }
    setBusy(true);
    try {
      const result = await cloudRegister({
        email: email.trim(),
        password,
        ownerName: ownerName.trim(),
        storeName: storeName.trim(),
      });
      logger.info('onboarding', 'register.done', { verification: result.verificationRequired });
      if (result.verificationRequired) {
        // Cannot sign in before verifying: the owner links later in Settings → Account.
        setNotice(
          t('Account created. Verify your email, then link this computer in Settings → Account.')
        );
        window.setTimeout(onNext, 2500);
        return;
      }
      await cloudLoginAndLink({ email: email.trim(), password }).catch((err) => {
        logger.warn('onboarding', 'register.link_failed', { code: toCloudError(err).code });
      });
      onNext();
    } catch (err) {
      setError(toCloudError(err).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack gap="xl">
      <div>
        <Title order={1} style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          {t('Register your free account')}
        </Title>
        <Text c="dimmed" mt="xs">
          {t('Optional — you can skip this and use the POS fully offline.')}
        </Text>
      </div>

      <Paper p="lg" withBorder radius="md" style={{ backgroundColor: 'var(--bg-card)' }}>
        <List spacing="xs" size="sm" mb="md">
          <List.Item>
            {t(
              'Register your free account to enable automated local recovery keys and receive security notices.'
            )}
          </List.Item>
          <List.Item>{t('Register to get 500MB of free cloud backup.')}</List.Item>
        </List>
        <Stack gap="sm" maw={480}>
          <TextInput
            label={t('Owner name')}
            value={ownerName}
            onChange={(e) => setOwnerName(e.currentTarget.value)}
            required
          />
          <TextInput
            label={t('Store name')}
            value={storeName}
            onChange={(e) => setStoreName(e.currentTarget.value)}
            required
          />
          <TextInput
            label={t('Email')}
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
          />
          <PasswordInput
            label={t('Password')}
            description={t('This is your cloud account password, separate from the POS login.')}
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            data-log-redact
            required
          />
          {error && (
            <Alert color="red" variant="light">
              {error}
            </Alert>
          )}
          {notice && (
            <Alert color="teal" variant="light">
              {notice}
            </Alert>
          )}
        </Stack>
      </Paper>

      <Group justify="space-between">
        <Button variant="default" onClick={onPrev} disabled={busy}>
          {t('Back')}
        </Button>
        <Group>
          <Button
            variant="light"
            size="md"
            onClick={skip}
            disabled={busy}
            data-log-id="onboarding.register.skip"
          >
            {t('Skip for now')}
          </Button>
          <Button
            size="md"
            onClick={() => void register()}
            loading={busy}
            data-log-id="onboarding.register.submit"
          >
            {t('Register free account')}
          </Button>
        </Group>
      </Group>
    </Stack>
  );
};
