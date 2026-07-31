import { ReactNode } from 'react';
import { Box, Flex } from '@mantine/core';
import wallLoginImg from '@/assets/wall_login.jpg';

export interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Box
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'var(--bg-card)',
        overflow: 'hidden',
        transition: 'background-color 0.3s ease',
      }}
    >
      <Flex
        direction={{ base: 'column-reverse', md: 'row' }}
        style={{ minHeight: '100vh', width: '100%' }}
      >
        {/* Left Column: Form Container */}
        <Flex
          direction="column"
          justify="center"
          align="center"
          w={{ base: '100%', md: '45%', lg: '42%' }}
          p={{ base: '40px 24px', md: '64px 48px' }}
          style={{ position: 'relative', minHeight: '100vh' }}
        >
          {children}
        </Flex>

        {/* Right Column: Visual Brand Image Canvas */}
        <Box
          w={{ base: '100%', md: '55%', lg: '58%' }}
          p={{ base: '16px', md: '20px 20px 20px 0' }}
          style={{
            display: 'flex',
            minHeight: '440px',
          }}
        >
          <Box
            style={{
              position: 'relative',
              width: '100%',
              minHeight: 'calc(100vh - 40px)',
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
