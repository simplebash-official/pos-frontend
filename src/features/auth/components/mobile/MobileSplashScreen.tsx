import { t } from '@/shared/i18n/t';
import { IconArrowRight } from '@tabler/icons-react';
import { SERVICE_CENTER_NAME } from '@/config/branding';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectShopProfile } from '@/store/slices/settingsSlice';
import { getShopNameFromLink } from '../../lib/shopCode';

interface MobileSplashScreenProps {
  onStart: () => void;
}

export const MobileSplashScreen = ({ onStart }: MobileSplashScreenProps) => {
  const location = useLocation();
  const shopProfile = useAppSelector(selectShopProfile);
  const linkName = getShopNameFromLink(location.search);
  const shopName =
    linkName ||
    (shopProfile?.tradingName?.trim() !== 'SimpleBash POS' && shopProfile?.tradingName?.trim()) ||
    shopProfile?.tradingName?.trim() ||
    shopProfile?.legalName?.trim() ||
    SERVICE_CENTER_NAME;

  return (
    <div className="mobile-splash-container">
      {/* Top Brand Badge */}
      <div className="mobile-splash-brand-badge">
        <span className="mobile-splash-brand-dot" />
        <span>{shopName === SERVICE_CENTER_NAME ? t(SERVICE_CENTER_NAME) : shopName}</span>
      </div>

      {/* Middle Hero Welcome Notes */}
      <div className="mobile-splash-hero">
        <h1 className="mobile-splash-title">{t('Welcome Back!')}</h1>
        <p className="mobile-splash-subtitle">
          {t('Sign in with your staff account to start a shift')}
        </p>
      </div>

      {/* Bottom Action Button */}
      <div className="mobile-splash-action-container">
        <button
          type="button"
          className="mobile-splash-start-btn"
          onClick={onStart}
          aria-label={t('Sign in to your account')}
        >
          <span>{t('Sign In')}</span>
          <IconArrowRight size={18} stroke={2.5} />
        </button>

        <div className="mobile-splash-footer-note">{t('Staff & Admin Access Only')}</div>
      </div>
    </div>
  );
};
