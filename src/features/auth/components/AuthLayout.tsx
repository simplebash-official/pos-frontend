import { ReactNode } from 'react';
import { Box, Flex } from '@mantine/core';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { ROUTES } from '@/constants/routes';
import { BrandBackdrop } from '@/shared/components/brand';
import { BrandPanel } from './BrandPanel';
import { MobileAuthContainer } from './mobile/MobileAuthContainer';
import './mobile/mobileAuth.css';

export interface AuthLayoutProps {
  children: ReactNode;
  forceMobileCard?: boolean;
}

export const AuthLayout = ({ children, forceMobileCard }: AuthLayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();

  const isDedicatedAuthPage =
    location.pathname === ROUTES.FORGOT_PASSWORD ||
    location.pathname === ROUTES.RESET_PASSWORD ||
    location.pathname.startsWith('/forgot-password') ||
    location.pathname.startsWith('/reset-password');

  if (isMobile) {
    if (forceMobileCard || isDedicatedAuthPage) {
      return (
        <Box
          className="mobile-auth-viewport"
          style={{
            minHeight: '100dvh',
            height: 'auto',
            overflowY: 'auto',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'var(--mantine-color-body)',
          }}
        >
          <BrandBackdrop />
          <div className="mobile-auth-bg-overlay" />
          <Box
            style={{
              position: 'relative',
              zIndex: 5,
              width: '100%',
              maxWidth: 420,
              margin: 'auto',
              padding: '24px 16px',
            }}
          >
            {children}
          </Box>
        </Box>
      );
    }

    return <MobileAuthContainer />;
  }

  // Same proportions as the SimpleBash app's sign-in: the brand panel takes 44% of the
  // window, the form the rest, with a 16px frame around and between them.
  return (
    <Box
      className="auth-layout-root"
      style={{
        width: '100%',
        backgroundColor: 'var(--auth-page-bg)',
        overflowY: 'auto',
        display: 'flex',
        transition: 'background-color 0.3s ease',
      }}
    >
      <Box style={{ width: '100%', minHeight: '100%', display: 'flex', padding: 16, gap: 16 }}>
        <Flex
          style={{ flex: '1 1 48%', minWidth: 0 }}
          direction="column"
          justify="center"
          align="center"
          p={{ base: 32, lg: 56 }}
        >
          {children}
        </Flex>
        <Box style={{ flex: '0 0 44%', minWidth: 0 }}>
          <BrandPanel
            badge={t("Your shop's accountant")}
            headline={t('Every rupee, counted for you')}
            subline={t(
              'Sales, stock, expenses and profit are kept up to date while you work. Log in to see where your money went.'
            )}
          />
        </Box>
      </Box>
    </Box>
  );
};
