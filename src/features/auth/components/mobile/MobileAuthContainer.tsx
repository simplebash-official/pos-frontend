import { useState } from 'react';
import { BrandBackdrop } from '@/shared/components/brand';
import { MobileSplashScreen } from './MobileSplashScreen';
import { MobileLoginForm } from './MobileLoginForm';
import './mobileAuth.css';

type MobileAuthView = 'splash' | 'login';

export const MobileAuthContainer = () => {
  const [view, setView] = useState<MobileAuthView>('splash');

  return (
    <div className="mobile-auth-viewport" data-view={view}>
      {/* Animated Brand Backdrop */}
      <BrandBackdrop />
      <div className="mobile-auth-bg-overlay" />

      {/* Screen View Router */}
      <div className="mobile-auth-content">
        {view === 'splash' && <MobileSplashScreen onStart={() => setView('login')} />}

        {view === 'login' && <MobileLoginForm onBack={() => setView('splash')} />}
      </div>
    </div>
  );
};
