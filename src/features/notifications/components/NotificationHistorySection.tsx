import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '@mantine/hooks';
import {
  Box,
  Button,
  Chip,
  Group,
  Loader,
  Skeleton,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  IconBellOff,
  IconCalendar,
  IconChecks,
  IconFilterOff,
  IconSearch,
} from '@tabler/icons-react';
import { SectionShell } from '@/features/settings/components/SectionShell';
import { t } from '@/shared/i18n/t';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { PresenceSwitch } from '@/shared/motion';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationsRead,
  useNotificationHistory,
  useNotificationSummary,
} from '../hooks/useNotifications';
import {
  NO_FILTERS,
  hasFilters,
  readHistoryParams,
  toServerFilter,
  writeHistoryParams,
  type HistoryFilters,
} from '../lib/historyParams';
import {
  CATEGORY_ORDER,
  CATEGORY_VIEW,
  SEVERITY_COLOR,
  SEVERITY_LABEL,
  SEVERITY_ORDER,
} from '../lib/notificationView';
import { useMinuteClock } from '../lib/useMinuteClock';
import type { AppNotification, NotificationCategory, NotificationSeverity } from '../types';
import { NotificationList } from './NotificationList';
import { PillSwitch } from './PillSwitch';

const SEARCH_DEBOUNCE_MS = 300;

/** Settings → Notifications: everything that happened in the shop, with filters. */
export const NotificationHistorySection = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const now = useMinuteClock(true);
  const [params, setParams] = useSearchParams();
  const filters = readHistoryParams(params);
  const [search] = useDebouncedValue(filters.search, SEARCH_DEBOUNCE_MS);
  const serverFilter = toServerFilter(filters, search);
  const history = useNotificationHistory({ state: filters.state, filter: serverFilter });
  const summary = useNotificationSummary();
  const markRead = useMarkNotificationsRead();
  const markAll = useMarkAllNotificationsRead();

  const update = (patch: Partial<HistoryFilters>) =>
    setParams(writeHistoryParams(params, { ...filters, ...patch }), { replace: true });

  // A category missing from the counts has nothing unread.
  const unreadOf = (category: NotificationCategory) => {
    const entry = summary.data?.unreadByCategory.find((e) => e.category === category);
    return entry === undefined ? 0 : entry.unread;
  };
  const unreadTotal = summary.data === undefined ? 0 : summary.data.unreadTotal;
  const items = history.data === undefined ? [] : history.data.pages.flatMap((p) => p.items);
  const filtered = hasFilters(filters);

  const open = (notification: AppNotification) => {
    if (!notification.read) markRead.mutate([notification.key]);
    if (notification.link !== undefined) navigate(notification.link.path);
  };

  const state = history.isError
    ? 'failed'
    : history.isPending
      ? 'loading'
      : items.length === 0
        ? 'empty'
        : 'list';

  return (
    <SectionShell
      title={t('Notifications')}
      description={t(
        'Everything that happened in your shop. Filter it, search it, and open any of it.'
      )}
      isDirty={false}
      onSave={() => undefined}
      onCancel={() => undefined}
      hideActions
    >
      <Stack gap="md" style={{ minHeight: 0, flex: 1 }}>
        <Group gap="sm" wrap="wrap" align="flex-end">
          <TextInput
            aria-label={t('Search notifications')}
            placeholder={t('Search notifications')}
            leftSection={<IconSearch size={16} />}
            value={filters.search}
            onChange={(e) => update({ search: e.currentTarget.value })}
            style={{ flex: isMobile ? '1 1 100%' : '1 1 240px' }}
            styles={isMobile ? { input: { fontSize: 16 } } : undefined}
          />
          <DatePickerInput
            type="range"
            aria-label={t('Dates')}
            placeholder={t('Any date')}
            valueFormat="D MMM YYYY"
            leftSection={<IconCalendar size={16} />}
            clearable
            allowSingleDateInRange
            popoverProps={{ withinPortal: true }}
            value={[filters.fromDay, filters.toDay]}
            onChange={([fromDay, toDay]) => update({ fromDay, toDay })}
            w={isMobile ? '100%' : 250}
          />
          <Box style={{ width: isMobile ? '100%' : 260, flexShrink: 0 }}>
            <PillSwitch
              label={t('Show')}
              grow
              value={filters.state}
              onChange={(state) => update({ state })}
              options={[
                { value: 'all', label: t('All') },
                { value: 'unread', label: t('Unread'), count: unreadTotal },
                { value: 'read', label: t('Read') },
              ]}
            />
          </Box>
        </Group>

        <Stack gap={8}>
          <Chip.Group
            multiple
            value={filters.categories}
            onChange={(values) => update({ categories: values as NotificationCategory[] })}
          >
            <Group gap={6} wrap="wrap">
              {CATEGORY_ORDER.map((category) => {
                const Icon = CATEGORY_VIEW[category].icon;
                const unread = unreadOf(category);
                return (
                  <Chip
                    key={category}
                    value={category}
                    size={isMobile ? 'md' : 'sm'}
                    variant="light"
                  >
                    <Group gap={6} wrap="nowrap" component="span">
                      <Icon size={14} />
                      {t(CATEGORY_VIEW[category].label)}
                      {unread > 0 && <span className="ntf-chip-count">{unread}</span>}
                    </Group>
                  </Chip>
                );
              })}
            </Group>
          </Chip.Group>
          <Chip.Group
            multiple
            value={filters.severities}
            onChange={(values) => update({ severities: values as NotificationSeverity[] })}
          >
            <Group gap={6} wrap="wrap">
              {SEVERITY_ORDER.map((severity) => (
                <Chip
                  key={severity}
                  value={severity}
                  size={isMobile ? 'md' : 'xs'}
                  color={SEVERITY_COLOR[severity]}
                  variant="outline"
                >
                  {t(SEVERITY_LABEL[severity])}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        </Stack>

        <Group justify="space-between" wrap="wrap" gap="xs">
          <Text size="sm" c="dimmed">
            {state === 'list'
              ? `${t('Showing')} ${items.length}${history.hasNextPage ? '+' : ''}`
              : ' '}
          </Text>
          <Group gap="xs">
            {filtered && (
              <Button
                variant="subtle"
                color="gray"
                size="xs"
                leftSection={<IconFilterOff size={14} />}
                onClick={() => setParams(writeHistoryParams(params, NO_FILTERS), { replace: true })}
              >
                {t('Clear filters')}
              </Button>
            )}
            <Button
              variant="light"
              size="xs"
              leftSection={<IconChecks size={14} />}
              disabled={unreadTotal === 0}
              loading={markAll.isPending}
              onClick={() => markAll.mutate(serverFilter)}
            >
              {filtered ? t('Mark these as read') : t('Mark all as read')}
            </Button>
          </Group>
        </Group>

        <Box className="ntf-history" style={{ flex: 1, minHeight: 0 }}>
          <PresenceSwitch stateKey={state}>
            {state === 'failed' && (
              <Stack align="center" gap="xs" py="xl">
                <Text size="sm" c="dimmed">
                  {t('Notifications could not be loaded.')}
                </Text>
                <Button size="xs" variant="light" onClick={() => void history.refetch()}>
                  {t('Try again')}
                </Button>
              </Stack>
            )}
            {state === 'loading' && (
              <Stack gap="md" py="sm">
                {[0, 1, 2, 3].map((i) => (
                  <Group key={i} gap="sm" wrap="nowrap" align="flex-start">
                    <Skeleton height={36} width={36} />
                    <Stack gap={6} style={{ flex: 1 }}>
                      <Skeleton height={12} width="40%" />
                      <Skeleton height={10} width="80%" />
                    </Stack>
                  </Group>
                ))}
              </Stack>
            )}
            {state === 'empty' && (
              <Stack align="center" gap={6} py={48}>
                <ThemeIcon size={56} variant="light" color="gray" radius="xl">
                  <IconBellOff size={28} />
                </ThemeIcon>
                <Text fw={600} mt={6}>
                  {filtered ? t('Nothing matches these filters') : t('No notifications yet')}
                </Text>
                <Text size="sm" c="dimmed" ta="center" maw={340}>
                  {filtered
                    ? t('Try another date, or clear the filters to see everything.')
                    : t('Alerts about stock, repairs, bills and more will show up here.')}
                </Text>
                {filtered && (
                  <Button
                    mt="xs"
                    variant="light"
                    size="xs"
                    onClick={() =>
                      setParams(writeHistoryParams(params, NO_FILTERS), { replace: true })
                    }
                  >
                    {t('Clear filters')}
                  </Button>
                )}
              </Stack>
            )}
            {state === 'list' && (
              <Stack gap="sm">
                <NotificationList
                  items={items}
                  now={now}
                  variant="full"
                  onOpen={open}
                  onMarkRead={(n) => markRead.mutate([n.key])}
                  touch={isMobile}
                />
                {history.hasNextPage && (
                  <Group justify="center" py="sm">
                    <Button
                      variant="default"
                      size={isMobile ? 'md' : 'sm'}
                      onClick={() => void history.fetchNextPage()}
                      disabled={history.isFetchingNextPage}
                      leftSection={history.isFetchingNextPage ? <Loader size={14} /> : undefined}
                    >
                      {t('Show older notifications')}
                    </Button>
                  </Group>
                )}
              </Stack>
            )}
          </PresenceSwitch>
        </Box>
      </Stack>
    </SectionShell>
  );
};
