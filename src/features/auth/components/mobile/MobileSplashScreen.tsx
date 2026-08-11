import { IconArrowRight } from '@tabler/icons-react';

interface MobileSplashScreenProps {
  onStart: () => void;
}

export const MobileSplashScreen = ({ onStart }: MobileSplashScreenProps) => {
  return (
    <div className="mobile-splash-container">
      {/* Top Brand Badge */}
      <div className="mobile-splash-brand-badge">
        <span className="mobile-splash-brand-dot" />
        <span>JANA2U Service Center</span>
      </div>

      {/* Middle Hero Welcome Notes */}
      <div className="mobile-splash-hero">
        <h1 className="mobile-splash-title">Welcome Back!</h1>
        <p className="mobile-splash-subtitle">Sign in with your staff account to start a shift</p>
      </div>

      {/* Bottom Action Button */}
      <div className="mobile-splash-action-container">
        <button
          type="button"
          className="mobile-splash-start-btn"
          onClick={onStart}
          aria-label="Sign in to your account"
        >
          <span>Sign In</span>
          <IconArrowRight size={18} stroke={2.5} />
        </button>

        <div className="mobile-splash-footer-note">Staff & Admin Access Only</div>
      </div>
    </div>
  );
};
