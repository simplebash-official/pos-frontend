import { AppShell as MantineAppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, Navigate } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { STORAGE_KEYS } from '@/config/constants';

export function AppShell() {
  const [opened, { toggle, close }] = useDisclosure();
  const isAuthenticated = Boolean(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MantineAppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <MantineAppShell.Header bg="var(--bg-sidebar)">
        <Header opened={opened} toggle={toggle} />
      </MantineAppShell.Header>

      <MantineAppShell.Navbar bg="var(--bg-sidebar)">
        <Sidebar closeMobile={close} />
      </MantineAppShell.Navbar>

      <MantineAppShell.Main
        style={{ backgroundColor: 'var(--bg-app)', minHeight: 'calc(100vh - 60px)' }}
      >
        <Outlet />
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
