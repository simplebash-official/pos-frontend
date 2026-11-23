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
  IconBuildingStore,
  IconCash,
  IconCashRegister,
  IconCoins,
  IconDevices,
  IconDoorExit,
  IconLock,
  IconLockOpen,
  IconReceipt,
} from '@tabler/icons-react';
import { getDeviceId } from '@/api/deviceId';
import { useShopProfile } from '@/features/settings';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { formatMoney } from '@/shared/lib/money';
import { t } from '@/shared/i18n/t';
import { FadeIn } from '@/shared/motion';
import { useAppSelector } from '@/store/hooks';
import type { SettingsState } from '@/store/slices/settingsSlice';
import { motion, useReducedMotion } from 'framer-motion';
import { useCurrentSession } from '../../hooks/useRegisterSession';
import type { RegisterSession } from '../../types';
import { CashMovementModal } from './CashMovementModal';
import { CloseSessionModal } from './CloseSessionModal';
import { OpenSessionModal } from './OpenSessionModal';
import { ShiftOpenFor } from './ShiftOpenFor';
import { ZReportModal } from './ZReportModal';

/** A small dot that breathes (opacity only) while the shift is open. */
const LiveDot = ({ isShopShift = false }: { isShopShift?: boolean }) => {
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
        background: isShopShift ? 'var(--mantine-color-cyan-6)' : 'var(--mantine-color-teal-6)',
        display: 'inline-block',
      }}
    />
  );
};

/** A tinted tile that leads a menu row. */
const MenuIcon = ({ color, icon }: { color: string; icon: React.ReactNode }) => (
  <ThemeIcon variant="light" color={color} size={32}>
    {icon}
  </ThemeIcon>
);

/** One labelled amount in the shift card. */
const ShiftFigure = ({
  label,
  cents,
  valueColor,
}: {
  label: string;
  cents: number;
  valueColor: string;
}) => (
  <Box
    p="xs"

    style={{
      background: 'var(--bg-app)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--mantine-radius-default)',
    }}
  >
    <Text c="dimmed" fw={600} tt="uppercase" style={{ fontSize: 10, letterSpacing: '0.06em' }}>
      {label}
    </Text>
    <Text
      fw={700}
      c={valueColor}
      mt={2}
      // Wraps instead of spilling out of the tile when the amount is large.
      style={{
        fontSize: 15,
        fontVariantNumeric: 'tabular-nums',
        overflowWrap: 'anywhere',
      }}
    >
      {formatMoney(cents)}
    </Text>
  </Box>
);

export const RegisterSessionBadge: React.FC = () => {
  const terminalId = getDeviceId();
  const isMobile = useIsMobile();
  const { session, isLoading } = useCurrentSession(terminalId);
  const { shopProfile: fetchedProfile } = useShopProfile();
  const storeProfile = useAppSelector(
    (state: { settings?: SettingsState }) => state.settings?.shopProfile ?? null
  );
  const shopProfile = fetchedProfile ?? storeProfile;

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

  const isOpen = session?.status === 'open' || session?.status === 'reopened';
  const isClosing = session?.status === 'closing';
  const isReopened = session?.status === 'reopened';
  const isShopShift = shopProfile?.allowSharedUserSessions === true;
  const isPersonalOtherDevice =
    shopProfile !== null &&
    !shopProfile.allowSharedUserSessions &&
    Boolean(session && session.terminalId !== terminalId);
  const badgeColor = isReopened ? 'grape' : isShopShift ? 'cyan' : 'teal';
  const shiftKindLabel = isReopened
    ? t('Reopened for Audit')
    : isShopShift
      ? t('Shared Shop Shift')
      : t('Shift open');

  const closingTooltip = session?.closingCashierNameSnapshot
    ? `${t('Cash count in progress by')} ${session.closingCashierNameSnapshot}. ${t('New sales and payouts are paused until finished or cancelled.')}`
    : t('Cash count in progress. New sales and payouts are paused until finished or cancelled.');

  // One return for every status: the modals keep the same place in the tree, so the
  // Close window is not remounted (and its step and counted cash lost) when the
  // session flips from open to closing after the blind count is submitted.
  return (
    <>
      {isOpen && (
        <FadeIn style={{ display: 'inline-block' }}>
          <Menu
            shadow="md"
            width="min(340px, calc(100vw - 32px))"
            position="bottom-end"
            radius="md"
          >
            <Menu.Target>
              <Button
                size={isMobile ? 'sm' : 'xs'}
                variant="light"
                color={badgeColor}
                style={isMobile ? { minHeight: 44 } : undefined}
                leftSection={
                  isReopened ? (
                    <IconLockOpen size={14} color="var(--mantine-color-grape-6)" />
                  ) : isShopShift ? (
                    <IconBuildingStore size={14} color="var(--mantine-color-cyan-6)" />
                  ) : (
                    <IconLockOpen size={14} color="var(--mantine-color-teal-6)" />
                  )
                }
              >
                <Group gap={6} wrap="nowrap">
                  <LiveDot isShopShift={isShopShift} />
                  <Text size="xs" fw={700}>
                    {session.sessionNumber}
                  </Text>
                  {isReopened && (
                    <Badge size="xs" variant="light" color="grape">
                      {t('Reopened')}
                    </Badge>
                  )}
                  {isShopShift && (
                    <Badge
                      size="xs"
                      variant="light"
                      color="cyan"
                      leftSection={<IconBuildingStore size={12} />}
                    >
                      {t('Shop Shift')}
                    </Badge>
                  )}
                </Group>
              </Button>
            </Menu.Target>

            <Menu.Dropdown p="xs">
              <Box
                p="sm"
                mb="xs"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--mantine-radius-default)',
                }}
              >
                <Group gap="sm" wrap="nowrap" mb="sm">
                  <ThemeIcon variant="light" color={badgeColor} size={36}>
                    {isReopened ? (
                      <IconCashRegister size={20} />
                    ) : isShopShift ? (
                      <IconBuildingStore size={20} />
                    ) : (
                      <IconCash size={20} />
                    )}
                  </ThemeIcon>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <Text size="sm" fw={700} truncate>
                      {session.sessionNumber}
                    </Text>
                    <Group gap={6} wrap="nowrap" mt={2}>
                      <Badge
                        variant="light"
                        color={badgeColor}
                        size="sm"
                        tt="none"
                        fw={600}
                        leftSection={<LiveDot isShopShift={isShopShift} />}
                        style={{ flexShrink: 0 }}
                      >
                        {shiftKindLabel}
                      </Badge>
                      <Text size="xs" c="dimmed" truncate>
                        {session.cashierNameSnapshot}
                      </Text>
                    </Group>
                  </div>
                </Group>
                <ShiftOpenFor openedAt={session.openedAt} />
                <SimpleGrid cols={2} spacing="xs">
                  <ShiftFigure
                    label={t('Float')}
                    cents={session.openingFloatCents}
                    valueColor="var(--text-primary)"
                  />
                  <ShiftFigure
                    label={t('Cash sales')}
                    cents={session.totalCashSalesCents}
                    valueColor="var(--status-ok)"
                  />
                </SimpleGrid>
                {session.terminalId !== terminalId && (
                  <Box
                    mt="xs"
                    p="xs"
                    style={{
                      background:
                        'color-mix(in srgb, var(--mantine-color-blue-6) 16%, var(--bg-card))',
                      border:
                        '1px solid color-mix(in srgb, var(--mantine-color-blue-6) 45%, var(--bg-card))',
                      borderRadius: 'var(--mantine-radius-default)',
                    }}
                  >
                    <Group gap="sm" wrap="nowrap" align="flex-start">
                      <IconDevices
                        size={18}
                        color="var(--mantine-color-blue-light-color)"
                        style={{ flexShrink: 0, marginTop: 2 }}
                        aria-hidden
                      />
                      <div>
                        <Text size="sm" fw={600}>
                          {t('Opened on another device')}
                        </Text>
                        {isPersonalOtherDevice && (
                          <Text size="xs" c="dimmed">
                            {t('Personal shift active across your signed-in devices')}
                          </Text>
                        )}
                      </div>
                    </Group>
                  </Box>
                )}
              </Box>

              <Menu.Item
                py={8}
                leftSection={<MenuIcon color="blue" icon={<IconCoins size={16} />} />}
                onClick={handleOpenMovementModal}
              >
                <Text size="sm" fw={600}>
                  {t('Cash in / cash out')}
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
                  {t('View shift summary')}
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
                  {t('Close register shift')}
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
          <Tooltip label={closingTooltip}>
            <Button
              size={isMobile ? 'sm' : 'xs'}
              variant="light"
              color="orange"
              style={isMobile ? { minHeight: 44 } : undefined}
              leftSection={<IconLock size={14} color="var(--mantine-color-orange-6)" />}
              onClick={() => setCloseModalOpen(true)}
            >
              <Text size="xs" fw={700}>
                {session.closingCashierNameSnapshot
                  ? `${session.sessionNumber} · ${t('Closing')} (${session.closingCashierNameSnapshot})`
                  : `${session.sessionNumber} · ${t('Closing...')}`}
              </Text>
            </Button>
          </Tooltip>
        </FadeIn>
      )}
      {!isOpen && !isClosing && (
        <FadeIn style={{ display: 'inline-block' }}>
          <Tooltip label={t('Register shift is closed. Click to count float and open session.')}>
            <Button
              size={isMobile ? 'sm' : 'xs'}
              variant="filled"
              color="red"
              style={isMobile ? { minHeight: 44 } : undefined}
              leftSection={<IconLock size={14} />}
              onClick={() => setOpenModalOpen(true)}
            >
              {t('Open Shift')}
            </Button>
          </Tooltip>
        </FadeIn>
      )}

      {(isOpen || (isClosing && movementModalOpen)) && session && (
        <CashMovementModal
          opened={movementModalOpen}
          onClose={() => setMovementModalOpen(false)}
          terminalId={terminalId}
          sessionKey={session.key}
          shiftClosing={isClosing}
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
