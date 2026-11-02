import { ReactNode } from 'react';
import { Box, Flex } from '@mantine/core';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { BrandPanel } from './BrandPanel';
import { MobileAuthContainer } from './mobile/MobileAuthContainer';

export interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
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
