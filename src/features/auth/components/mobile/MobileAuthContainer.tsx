import { useState } from 'react';
import wallLoginImg from '@/assets/wall_login.jpg';
import { MobileSplashScreen } from './MobileSplashScreen';
import { MobileLoginForm } from './MobileLoginForm';
import './mobileAuth.css';

type MobileAuthView = 'splash' | 'login';

export const MobileAuthContainer = () => {
  const [view, setView] = useState<MobileAuthView>('splash');

  return (
    <div className="mobile-auth-viewport" data-view={view}>
      {/* Background with fluid gradient and image */}
      <div className="mobile-auth-bg" style={{ backgroundImage: `url(${wallLoginImg})` }} />
      <div className="mobile-auth-bg-overlay" />

      {/* Screen View Router */}
      <div className="mobile-auth-content">
        {view === 'splash' && <MobileSplashScreen onStart={() => setView('login')} />}

        {view === 'login' && <MobileLoginForm onBack={() => setView('splash')} />}
      </div>
    </div>
  );
};
