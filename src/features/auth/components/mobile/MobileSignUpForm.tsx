import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { TextInput, PasswordInput, Checkbox, Button, Divider, Stack, Anchor } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { MobileSocialButtons } from './MobileSocialButtons';
import { BRAND_NAME } from '@/config/branding';

interface MobileSignUpFormProps {
  onBack: () => void;
  onGoToSignIn: () => void;
}

export const MobileSignUpForm = ({ onBack, onGoToSignIn }: MobileSignUpFormProps) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password) {
      notifications.show({
        title: 'Registration Required',
        message: 'Please complete all required fields to register.',
        color: 'red',
      });
      return;
    }

    if (!agreeToTerms) {
      notifications.show({
        title: 'Terms of Service',
        message: 'Please agree to the processing of personal data to continue.',
        color: 'yellow',
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      notifications.show({
        title: 'Registration Request Submitted',
        message:
          'Your employee registration request has been submitted for administrator review. Please sign in.',
        color: 'green',
      });
      onGoToSignIn();
    }, 600);
  };

  return (
    <>
      {/* Top Header with Back Button */}
      <div className="mobile-auth-topbar">
        <button
          type="button"
          className="mobile-back-btn"
          onClick={onBack}
          aria-label={t('Back to Welcome Screen')}
        >
          <IconChevronLeft size={18} stroke={2.5} />
          <span>{t('Back')}</span>
        </button>
      </div>

      {/* Spacer to push card to bottom */}
      <div style={{ flex: 1 }} />

      {/* Bottom Sheet Card */}
      <div className="mobile-auth-sheet">
        <h2 className="mobile-sheet-title">{t('Get Started')}</h2>

        <form onSubmit={handleSignUp} noValidate>
          <Stack gap="sm">
            <TextInput
              label={t('Full Name')}
              placeholder={t('Enter Full Name')}
              value={fullName}
              onChange={(e) => setFullName(e.currentTarget.value)}
              className="mobile-auth-input"
              required
            />

            <TextInput
              label={t('Email')}
              placeholder={t('Enter Email')}
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              className="mobile-auth-input"
              type="email"
              required
            />

            <PasswordInput
              label={t('Password')}
              placeholder={t('Enter Password')}
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              className="mobile-auth-input"
              required
            />

            <Checkbox
              label={
                <span style={{ fontSize: 13 }}>
                  {t('I agree to the processing of')}{' '}
                  <Anchor
                    href="#terms"
                    size="xs"
                    fw={600}
                    c="blue.6"
                    onClick={(e) => {
                      e.preventDefault();
                      notifications.show({
                        title: 'Privacy Policy',
                        message: `Personal employee information is protected under ${BRAND_NAME} Data Privacy Standards.`,
                        color: 'blue',
                      });
                    }}
                  >
                    {t('Personal data')}
                  </Anchor>
                </span>
              }
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.currentTarget.checked)}
              size="sm"
              color="blue"
              mt={4}
            />

            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
              className="mobile-primary-btn"
              mt="xs"
            >
              {t('Sign up')}
            </Button>

            <Divider label={t('Sign up with')} labelPosition="center" my="xs" />

            <MobileSocialButtons mode="signup" />

            <div className="mobile-auth-footer">
              {t('Already have an account?')}{' '}
              <span
                role="button"
                tabIndex={0}
                className="mobile-auth-switch-link"
                onClick={onGoToSignIn}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onGoToSignIn();
                  }
                }}
              >
                {t('Sign in')}
              </span>
            </div>
          </Stack>
        </form>
      </div>
    </>
  );
};
