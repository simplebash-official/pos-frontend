import { t } from '@/shared/i18n/t';
import { useEffect, useState } from 'react';
import { Alert, Anchor, Button, Group, PinInput, Stack, Text, TextInput } from '@mantine/core';
import { logger } from '@/shared/logging';
import { cloudOtpSend, cloudOtpVerify } from '../api/accountApi';
import { otpErrorMessage } from '../lib/accountView';
import {
  PHONE_COUNTRY,
  formatNationalPhone,
  maskPhone,
  normalizeLkPhone,
  validatePhone,
} from '../lib/phone';
import type { VerifiedPhone } from '../types';

interface PhoneVerificationProps {
  verified: VerifiedPhone | null;
  onVerified: (value: VerifiedPhone) => void;
  /** Forget the verified number (the owner wants to use a different one). */
  onClear: () => void;
  disabled?: boolean;
}

interface Challenge {
  otpId: string;
  /** Normalised `94XXXXXXXXX`. */
  phone: string;
  uncertain: boolean;
}

const CODE_LENGTH = 6;

/**
 * Number → code → verified, for cloud registration. Identity texts a 6-digit code; the right code is
 * traded for a one-time proof that `cloudRegister` spends. Only Sri Lankan mobile numbers are
 * accepted: the country prefix is fixed in the field. Nothing here is stored beyond React state.
 */
export const PhoneVerification = ({
  verified,
  onVerified,
  onClear,
  disabled = false,
}: PhoneVerificationProps) => {
  const [number, setNumber] = useState('');
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'send' | 'verify' | null>(null);

  // Count down one second at a time, only while the resend wait is running.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  const send = async (phone: string) => {
    setError(null);
    setBusy('send');
    try {
      const result = await cloudOtpSend(phone);
      logger.info('app', 'account.phone_code_sent');
      setChallenge({ otpId: result.otpId, phone, uncertain: result.deliveryUncertain });
      setSecondsLeft(result.resendAfter);
      setCode('');
    } catch (err) {
      setError(otpErrorMessage(err, t('We could not send the code. Please try again.')));
    } finally {
      setBusy(null);
    }
  };

  const requestCode = () => {
    const invalid = validatePhone(number);
    if (invalid) {
      setError(invalid);
      return;
    }
    const check = normalizeLkPhone(number);
    if (check.ok) void send(check.phone);
  };

  const verify = async (value: string) => {
    if (!challenge) return;
    setError(null);
    setBusy('verify');
    try {
      const result = await cloudOtpVerify(challenge.otpId, value);
      logger.info('app', 'account.phone_verified');
      onVerified({ phone: challenge.phone, proof: result.phoneProof });
    } catch (err) {
      setError(otpErrorMessage(err, t('We could not check the code. Please try again.')));
      // A wrong code leaves the boxes filled; clear them so the next try starts fresh.
      setCode('');
    } finally {
      setBusy(null);
    }
  };

  const changeNumber = () => {
    setChallenge(null);
    setCode('');
    setError(null);
    setSecondsLeft(0);
    onClear();
  };

  if (verified) {
    return (
      <Stack gap={4}>
        <Text size="sm" fw={600} c="teal">
          {t('Your phone number is verified.')}
        </Text>
        <Group gap="md">
          <Text size="sm" c="dimmed" data-testid="verified-phone">
            {maskPhone(verified.phone)}
          </Text>
          <Anchor
            component="button"
            type="button"
            size="sm"
            onClick={changeNumber}
            disabled={disabled}
            data-log-id="account.phone.change"
          >
            {t('Change number')}
          </Anchor>
        </Group>
      </Stack>
    );
  }

  if (!challenge) {
    return (
      <Stack gap="xs">
        <TextInput
          label={t('Mobile number')}
          description={`${t('Sri Lankan mobile numbers only.')} ${t('We will text a 6-digit code to this number.')}`}
          placeholder={PHONE_COUNTRY.placeholder}
          // The country is fixed: the prefix is part of the field, so people type only the rest.
          leftSection={
            <Text size="sm" fw={600} c="dimmed" data-testid="phone-prefix">
              {PHONE_COUNTRY.label} +{PHONE_COUNTRY.dialCode}
            </Text>
          }
          leftSectionWidth={78}
          leftSectionPointerEvents="none"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={number}
          onChange={(e) => setNumber(e.currentTarget.value)}
          // Pasting a whole number (`+94 77 ...`, `077 ...`) keeps only the part after the prefix.
          onPaste={(event) => {
            const check = normalizeLkPhone(event.clipboardData.getData('text'));
            if (!check.ok) return;
            event.preventDefault();
            setNumber(formatNationalPhone(check.phone));
          }}
          disabled={disabled}
          data-log-redact
        />
        {error && (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        )}
        <Group>
          <Button
            variant="light"
            onClick={requestCode}
            loading={busy === 'send'}
            disabled={disabled}
            data-log-id="account.phone.send"
          >
            {t('Send code')}
          </Button>
        </Group>
      </Stack>
    );
  }

  return (
    <Stack gap="xs">
      <Text size="sm">
        {t('Enter the code we sent to')} <strong>{maskPhone(challenge.phone)}</strong>.
      </Text>
      <PinInput
        length={CODE_LENGTH}
        type="number"
        inputMode="numeric"
        oneTimeCode
        ariaLabel={t('Verification code')}
        value={code}
        onChange={setCode}
        onComplete={(value) => void verify(value)}
        disabled={busy === 'verify' || disabled}
        error={error !== null && busy === null}
        data-log-redact
      />
      {challenge.uncertain && !error && (
        <Alert color="blue" variant="light">
          {t('The code can take a minute to arrive. You can ask for a new one below.')}
        </Alert>
      )}
      {error && (
        <Alert color="red" variant="light">
          {error}
        </Alert>
      )}
      <Group gap="md" justify="space-between">
        {secondsLeft > 0 ? (
          <Text size="sm" c="dimmed">
            {t('Time until you can ask for a new code')}: {secondsLeft}s
          </Text>
        ) : (
          <Anchor
            component="button"
            type="button"
            size="sm"
            onClick={() => void send(challenge.phone)}
            disabled={busy !== null || disabled}
            data-log-id="account.phone.resend"
          >
            {t('Send a new code')}
          </Anchor>
        )}
        <Anchor
          component="button"
          type="button"
          size="sm"
          onClick={changeNumber}
          data-log-id="account.phone.change"
        >
          {t('Change number')}
        </Anchor>
      </Group>
      <Group>
        <Button
          onClick={() => void verify(code)}
          loading={busy === 'verify'}
          disabled={code.length !== CODE_LENGTH || disabled}
          data-log-id="account.phone.verify"
        >
          {t('Verify')}
        </Button>
      </Group>
    </Stack>
  );
};
