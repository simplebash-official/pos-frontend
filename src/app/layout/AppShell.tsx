import { AppShell as MantineAppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function AppShell() {
  const [opened, { toggle, close }] = useDisclosure();

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
      <MantineAppShell.Header>
        <Header opened={opened} toggle={toggle} />
      </MantineAppShell.Header>

      <MantineAppShell.Navbar>
        <Sidebar closeMobile={close} />
      </MantineAppShell.Navbar>

      <MantineAppShell.Main
        style={{ backgroundColor: 'var(--mantine-color-body)', minHeight: 'calc(100vh - 60px)' }}
      >
        <Outlet />
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
