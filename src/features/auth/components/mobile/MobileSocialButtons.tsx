import { t } from '@/shared/i18n/t';
import { notifications } from '@mantine/notifications';
import { BRAND_NAME } from '@/config/branding';
import {
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandGoogle,
  IconBrandApple,
} from '@tabler/icons-react';

interface MobileSocialButtonsProps {
  mode?: 'signin' | 'signup';
}

export const MobileSocialButtons = ({ mode = 'signin' }: MobileSocialButtonsProps) => {
  const handleSocialClick = (provider: string) => {
    notifications.show({
      title: `${provider} Authentication`,
      message: `${provider} SSO sign-${mode === 'signin' ? 'in' : 'up'} is configured for ${BRAND_NAME} organization credentials. Please sign in with your employee email.`,
      color: 'blue',
    });
  };

  return (
    <div className="mobile-social-container">
      <button
        type="button"
        className="mobile-social-btn"
        onClick={() => handleSocialClick('Facebook')}
        aria-label={t('Sign in with Facebook')}
      >
        <IconBrandFacebook size={22} color="#1877F2" />
      </button>

      <button
        type="button"
        className="mobile-social-btn"
        onClick={() => handleSocialClick('Twitter')}
        aria-label={t('Sign in with Twitter')}
      >
        <IconBrandTwitter size={22} color="#1DA1F2" />
      </button>

      <button
        type="button"
        className="mobile-social-btn"
        onClick={() => handleSocialClick('Google')}
        aria-label={t('Sign in with Google')}
      >
        <IconBrandGoogle size={22} color="#EA4335" />
      </button>

      <button
        type="button"
        className="mobile-social-btn"
        onClick={() => handleSocialClick('Apple')}
        aria-label={t('Sign in with Apple')}
      >
        <IconBrandApple size={22} color="#000000" />
      </button>
    </div>
  );
};
