import { t } from '@/shared/i18n/t';
import { Button, Group, Stack, Text } from '@mantine/core';
import { logger } from '@/shared/logging';
import { SignInPanel } from './SignInPanel';

interface RegisterStepProps {
  onNext: () => void;
  onPrev: () => void;
}

/**
 * Optional first-run step: sign in (or create a free account) in the browser to
 * link this computer. Skipping is always possible and changes nothing about the
 * local setup that follows.
 */
export const RegisterStep = ({ onNext, onPrev }: RegisterStepProps) => {
  const skip = () => {
    logger.info('onboarding', 'register.skipped');
    onNext();
  };

  return (
    <Stack gap="xl">
      <Text c="dimmed" ta="center">
        {t('Optional — you can skip this and use the POS fully offline.')}
      </Text>
      <SignInPanel onLinked={onNext} onSkip={skip} />
      <Group justify="flex-start">
        <Button variant="default" onClick={onPrev}>
          {t('Back')}
        </Button>
      </Group>
    </Stack>
  );
};
