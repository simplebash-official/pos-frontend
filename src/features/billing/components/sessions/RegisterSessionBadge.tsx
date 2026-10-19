import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Menu,
  SimpleGrid,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconCash,
  IconCoins,
  IconDoorExit,
  IconLayersLinked,
  IconLock,
  IconLockOpen,
  IconReceipt,
} from '@tabler/icons-react';
import { getDeviceId } from '@/api/deviceId';
import { useCurrentSession } from '../../hooks/useRegisterSession';
import { OpenSessionModal } from './OpenSessionModal';
import { CloseSessionModal } from './CloseSessionModal';
import { CashMovementModal } from './CashMovementModal';
import { ZReportModal } from './ZReportModal';
import { formatMoney } from '@/shared/lib/money';
import { t } from '@/shared/i18n/t';
import { FadeIn } from '@/shared/motion';
import { motion, useReducedMotion } from 'framer-motion';
import type { RegisterSession } from '../../types';

/** A small dot that breathes (opacity only) while the shift is open. */
const LiveDot = ({ isShared = false }: { isShared?: boolean }) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      animate={reduceMotion ? undefined : { opacity: [1, 0.35, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: isShared ? 'var(--mantine-color-cyan-6)' : 'var(--mantine-color-teal-6)',
        display: 'inline-block',
      }}
    />
  );
};

/** A small tinted tile that leads a menu row. */
const MenuIcon = ({ color, icon }: { color: string; icon: React.ReactNode }) => (
  <ThemeIcon variant="light" color={color} size={32}>
    {icon}
  </ThemeIcon>
);

/** One labelled amount in the shift card. */
const ShiftFigure = ({ label, cents }: { label: string; cents: number }) => (
  <div>
    <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: '0.05em' }}>
      {label}
    </Text>
    <Text size="sm" fw={700} style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
      {formatMoney(cents)}
    </Text>
  </div>
);

export const RegisterSessionBadge: React.FC = () => {
  const terminalId = getDeviceId();
  const { session, isLoading } = useCurrentSession(terminalId);

  const [openModalOpen, setOpenModalOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [zReportModalOpen, setZReportModalOpen] = useState(false);
  const [zReportSessionKey, setZReportSessionKey] = useState<string | undefined>(undefined);

  const handleOpenMovementModal = () => {
    setMovementModalOpen(true);
  };

  const handleCloseSessionSuccess = (closedSession: RegisterSession) => {
    setZReportSessionKey(closedSession.key);
    setZReportModalOpen(true);
  };

  if (isLoading) {
    return null;
  }

  const isOpen = session?.status === 'open';
  const isClosing = session?.status === 'closing';
  const isShared = Boolean(session && session.terminalId !== terminalId);

  // One return for every status: the modals keep the same place in the tree, so the
  // Close window is not remounted (and its step and counted cash lost) when the
  // session flips from open to closing after the blind count is submitted.
  return (
    <>
      {isOpen && (
        <FadeIn style={{ display: 'inline-block' }}>
          <Menu shadow="md" width={320} position="bottom-end" radius="md">
            <Menu.Target>
              <Button
                size="xs"
                variant="light"
                color={isShared ? 'cyan' : 'teal'}
                leftSection={
                  isShared ? (
                    <IconLayersLinked size={14} color="var(--mantine-color-cyan-6)" />
                  ) : (
                    <IconLockOpen size={14} color="var(--mantine-color-teal-6)" />
                  )
                }
              >
                <Group gap={6} wrap="nowrap">
                  <LiveDot isShared={isShared} />
                  <Text size="xs" fw={700}>
                    {session.sessionNumber}
                  </Text>
                  {isShared && (
                    <Badge
                      size="xs"
                      variant="light"
                      color="cyan"
                      leftSection={<IconLayersLinked size={12} />}
                    >
                      {t('Shared')}
                    </Badge>
                  )}
                </Group>
              </Button>
            </Menu.Target>

            <Menu.Dropdown p={6}>
              <Box
                p="sm"
                mb={6}
                style={{
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--mantine-radius-default)',
                }}
              >
                <Group gap="sm" wrap="nowrap" mb="sm">
                  <ThemeIcon variant="light" color={isShared ? 'cyan' : 'teal'} size={36}>
                    {isShared ? <IconLayersLinked size={20} /> : <IconCash size={20} />}
                  </ThemeIcon>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <Group gap={6} wrap="nowrap" justify="space-between">
                      <Text size="sm" fw={700} truncate>
                        {session.sessionNumber}
                      </Text>
                      {isShared && (
                        <Badge size="xs" variant="light" color="cyan">
                          {t('Shared')}
                        </Badge>
                      )}
                    </Group>
                    <Group gap={6} wrap="nowrap">
                      <LiveDot isShared={isShared} />
                      <Text
                        size="xs"
                        c={isShared ? 'cyan' : 'dimmed'}
                        truncate
                        fw={isShared ? 600 : 400}
                      >
                        {isShared ? t('Active (Shared Shift)') : t('Shift open')}
                        {session.cashierNameSnapshot ? ` · ${session.cashierNameSnapshot}` : ''}
                      </Text>
                    </Group>
                  </div>
                </Group>
                <SimpleGrid cols={2} spacing="xs">
                  <ShiftFigure label={t('Float')} cents={session.openingFloatCents} />
                  <ShiftFigure label={t('Cash sales')} cents={session.totalCashSalesCents} />
                </SimpleGrid>
                {isShared && (
                  <Box
                    mt="xs"
                    pt="xs"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    <SimpleGrid cols={2} spacing="xs">
                      <div>
                        <Text
                          size="xs"
                          c="dimmed"
                          fw={600}
                          tt="uppercase"
                          style={{ letterSpacing: '0.05em' }}
                        >
                          {t('Drawer Terminal')}
                        </Text>
                        <Text size="xs" fw={700} truncate title={session.terminalId}>
                          {session.terminalId}
                        </Text>
                      </div>
                      <div>
                        <Text
                          size="xs"
                          c="dimmed"
                          fw={600}
                          tt="uppercase"
                          style={{ letterSpacing: '0.05em' }}
                        >
                          {t('This Device')}
                        </Text>
                        <Text size="xs" fw={700} truncate title={terminalId}>
                          {terminalId}
                        </Text>
                      </div>
                    </SimpleGrid>
                  </Box>
                )}
              </Box>

              <Menu.Item
                py={8}
                leftSection={<MenuIcon color="blue" icon={<IconCoins size={16} />} />}
                onClick={handleOpenMovementModal}
              >
                <Text size="sm" fw={600}>
                  {t('Cash In / Cash Out')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('Add cash to the drawer or take some out')}
                </Text>
              </Menu.Item>

              <Menu.Item
                py={8}
                leftSection={<MenuIcon color="gray" icon={<IconReceipt size={16} />} />}
                onClick={() => {
                  setZReportSessionKey(session.key);
                  setZReportModalOpen(true);
                }}
              >
                <Text size="sm" fw={600}>
                  {t('View Shift Summary')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('Sales and payments so far')}
                </Text>
              </Menu.Item>

              <Divider my={6} />

              <Menu.Item
                py={8}
                color="orange"
                leftSection={<MenuIcon color="orange" icon={<IconDoorExit size={16} />} />}
                onClick={() => setCloseModalOpen(true)}
              >
                <Text size="sm" fw={700} c="orange">
                  {t('Close Register Shift')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('Count the drawer and end this shift')}
                </Text>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </FadeIn>
      )}
      {isClosing && (
        <FadeIn style={{ display: 'inline-block' }}>
          <Button
            size="xs"
            variant="light"
            color="orange"
            leftSection={<IconLock size={14} color="var(--mantine-color-orange-6)" />}
            onClick={() => setCloseModalOpen(true)}
          >
            <Text size="xs" fw={700}>
              {session.sessionNumber} · {t('Closing...')}
            </Text>
          </Button>
        </FadeIn>
      )}
      {!isOpen && !isClosing && (
        <FadeIn style={{ display: 'inline-block' }}>
          <Tooltip label={t('Register shift is closed. Click to count float and open session.')}>
            <Button
              size="xs"
              variant="filled"
              color="red"
              leftSection={<IconLock size={14} />}
              onClick={() => setOpenModalOpen(true)}
            >
              {t('Open Shift')}
            </Button>
          </Tooltip>
        </FadeIn>
      )}

      {isOpen && (
        <CashMovementModal
          opened={movementModalOpen}
          onClose={() => setMovementModalOpen(false)}
          terminalId={terminalId}
          sessionKey={session.key}
        />
      )}

      {(isOpen || isClosing) && (
        <CloseSessionModal
          opened={closeModalOpen}
          onClose={() => setCloseModalOpen(false)}
          session={session}
          onSessionClosed={handleCloseSessionSuccess}
        />
      )}

      {!isOpen && !isClosing && (
        <OpenSessionModal
          opened={openModalOpen}
          onClose={() => setOpenModalOpen(false)}
          terminalId={terminalId}
        />
      )}

      <ZReportModal
        opened={zReportModalOpen}
        onClose={() => setZReportModalOpen(false)}
        sessionKey={zReportSessionKey || session?.key}
      />
    </>
  );
};
