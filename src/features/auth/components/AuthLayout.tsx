import { ReactNode } from 'react';
import { Box, Flex } from '@mantine/core';
import wallLoginImg from '@/assets/wall_login.jpg';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { MobileAuthContainer } from './mobile/MobileAuthContainer';

export interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileAuthContainer />;
  }

  return (
    <Box
      className="auth-layout-root"
      style={{
        width: '100%',
        backgroundColor: 'var(--bg-card)',
        overflowY: 'auto',
        transition: 'background-color 0.3s ease',
      }}
    >
      <Flex direction={{ base: 'column', md: 'row' }} className="auth-layout-min-h" w="100%">
        {/* Left Column: Form Container */}
        <Flex
          direction="column"
          justify="center"
          align="center"
          w={{ base: '100%', md: '45%', lg: '42%' }}
          p={{ base: '40px 24px', md: '64px 48px' }}
          className="auth-layout-min-h"
          style={{ position: 'relative' }}
        >
          {children}
        </Flex>

        {/* Right Column: Visual Brand Image Canvas */}
        <Box
          w={{ base: '100%', md: '55%', lg: '58%' }}
          p={{ base: '16px', md: '20px 20px 20px 0' }}
          mih={{ base: 200, md: 440 }}
          style={{
            display: 'flex',
          }}
        >
          <Box
            mih={{ base: 200, md: 'calc(100vh - 40px)' }}
            style={{
              position: 'relative',
              width: '100%',
              borderRadius: '32px',
              overflow: 'hidden',
              backgroundImage: `url(${wallLoginImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 20px 40px var(--border-strong)',
            }}
          />
        </Box>
      </Flex>
    </Box>
  );
}

