import { notifications } from '@mantine/notifications';
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
      message: `${provider} SSO sign-${mode === 'signin' ? 'in' : 'up'} is configured for Jana2U organization credentials. Please sign in with your employee email.`,
      color: 'blue',
    });
  };

  return (
    <div className="mobile-social-container">
      <button
        type="button"
        className="mobile-social-btn"
        onClick={() => handleSocialClick('Facebook')}
        aria-label="Sign in with Facebook"
      >
        <IconBrandFacebook size={22} color="#1877F2" />
      </button>

      <button
        type="button"
        className="mobile-social-btn"
        onClick={() => handleSocialClick('Twitter')}
        aria-label="Sign in with Twitter"
      >
        <IconBrandTwitter size={22} color="#1DA1F2" />
      </button>

      <button
        type="button"
        className="mobile-social-btn"
        onClick={() => handleSocialClick('Google')}
        aria-label="Sign in with Google"
      >
        <IconBrandGoogle size={22} color="#EA4335" />
      </button>

      <button
        type="button"
        className="mobile-social-btn"
        onClick={() => handleSocialClick('Apple')}
        aria-label="Sign in with Apple"
      >
        <IconBrandApple size={22} color="#000000" />
      </button>
    </div>
  );
};
