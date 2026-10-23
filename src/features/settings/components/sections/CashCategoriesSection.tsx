import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  Select,
  Skeleton,
  Stack,
  Switch,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconGitMerge,
  IconPencil,
  IconPin,
  IconPinFilled,
  IconSearch,
} from '@tabler/icons-react';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { t } from '@/shared/i18n/t';
import { useCashCategories, useUpdateCashCategory } from '@/features/billing/hooks/useCashLookups';
import {
  MOVEMENT_TYPES_IN_ORDER,
  getTypeLabel,
} from '@/features/billing/components/sessions/movement/movementTypes';
import type { CashCategory, CashMovementType } from '@/features/billing/types';
import { byShopOrder, moveCategory, reportGroupLabel } from '../../lib/categoryAdmin';
import { SectionShell } from '../SectionShell';
import { CategoryEditModal } from './CategoryEditModal';
import { MergeCategoryModal } from './MergeCategoryModal';

type KindFilter = 'all' | CashMovementType;

// Where the shop keeps its cash categories in order: rename, hide, pin, reorder, merge duplicates,
// and look at the ones cashiers made on the spot. Every action saves at once.
export const CashCategoriesSection = () => {
  const isMobile = useIsMobile();
  const [kind, setKind] = useState<KindFilter>('all');
  const [search, setSearch] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [onlyReview, setOnlyReview] = useState(false);
  const { data, isLoading } = useCashCategories({ includeHidden: true }, true);
  const update = useUpdateCashCategory();
  const [editing, setEditing] = useState<CashCategory | null>(null);
  const [merging, setMerging] = useState<CashCategory | null>(null);

  const all = useMemo(() => data ?? [], [data]);
  const reviewCount = all.filter((c) => c.reviewStatus === 'needs_review').length;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter(
      (c) =>
        (kind === 'all' || c.movementType === kind) &&
        (showHidden || c.active) &&
        (!onlyReview || c.reviewStatus === 'needs_review') &&
        (q === '' || c.name.toLowerCase().includes(q) || (c.nameSi ?? '').toLowerCase().includes(q))
    );
  }, [all, kind, search, showHidden, onlyReview]);

  const run = async (key: string, input: Parameters<typeof update.mutateAsync>[0]['input']) => {
    try {
      await update.mutateAsync({ key, input });
    } catch (err) {
      notifications.show({
        title: t('Save Failed'),
        message: getErrorMessage(err, t('The category could not be saved. Please try again.')),
        color: 'red',
      });
    }
  };

  const move = async (c: CashCategory, direction: 'up' | 'down') => {
    const siblings = all.filter((x) => x.movementType === c.movementType);
    const plan = moveCategory(siblings, c.key, direction);
    if (plan === null) return;
    for (const step of plan) await run(step.key, { sortOrder: step.sortOrder });
  };

  const size = isMobile ? 44 : 32;

  return (
    <>
      <SectionShell
        title={t('Cash Categories')}
        description={t('What cash movements, expenses and income are filed under.')}
        isDirty={false}
        onSave={() => undefined}
        onCancel={() => undefined}
        hideActions
      >
        <Stack gap="md">
          <Group gap="sm" wrap={isMobile ? 'wrap' : 'nowrap'}>
            <TextInput
              aria-label={t('Search categories')}
              placeholder={t('Search categories')}
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              size={isMobile ? 'md' : 'sm'}
              style={{ flex: 1, minWidth: 0 }}
            />
            <Select
              aria-label={t('Kind of payment')}
              allowDeselect={false}
              size={isMobile ? 'md' : 'sm'}
              data={[
                { value: 'all', label: t('All kinds') },
                ...MOVEMENT_TYPES_IN_ORDER.map((type) => ({
                  value: type,
                  label: getTypeLabel(type),
                })),
              ]}
              value={kind}
              onChange={(value) => value && setKind(value as KindFilter)}
              style={{ width: isMobile ? '100%' : 220, flexShrink: 0 }}
            />
          </Group>
          <Group gap="lg">
            <Switch
              label={t('Show hidden')}
              checked={showHidden}
              onChange={(e) => setShowHidden(e.currentTarget.checked)}
            />
            <Switch
              label={`${t('Needs review')} (${reviewCount})`}
              checked={onlyReview}
              onChange={(e) => setOnlyReview(e.currentTarget.checked)}
            />
          </Group>

          {isLoading ? (
            <Skeleton h={200} />
          ) : visible.length === 0 ? (
            <Text size="sm" c="dimmed">
              {t('No categories match.')}
            </Text>
          ) : (
            MOVEMENT_TYPES_IN_ORDER.map((type) => {
              const rows = visible.filter((c) => c.movementType === type).sort(byShopOrder);
              if (rows.length === 0) return null;
              const targetsOf = (c: CashCategory) =>
                all.filter((x) => x.movementType === type && x.active && x.key !== c.key);
              return (
                <Stack key={type} gap="xs">
                  <Text fw={700} size="sm">
                    {getTypeLabel(type)}
                  </Text>
                  {rows.map((c) => (
                    <Paper key={c.key} withBorder p="sm" opacity={c.active ? 1 : 0.6}>
                      <Group justify="space-between" wrap="wrap" gap="xs">
                        <Stack gap={2} style={{ minWidth: 0, flex: isMobile ? '1 1 100%' : 1 }}>
                          <Group gap={6} wrap="wrap">
                            <Text fw={600} size="sm">
                              {c.name}
                            </Text>
                            {c.reviewStatus === 'needs_review' && (
                              <Badge size="xs" color="orange" variant="light">
                                {t('New')}
                              </Badge>
                            )}
                            {!c.active && (
                              <Badge size="xs" color="gray" variant="light">
                                {t('Hidden')}
                              </Badge>
                            )}
                            {c.isSystem && (
                              <Badge size="xs" color="blue" variant="light">
                                {t('Built in')}
                              </Badge>
                            )}
                          </Group>
                          <Text size="xs" c="dimmed">
                            {`${reportGroupLabel(c.reportGroup)} · ${t('Used')} ${c.usageCount}`}
                            {c.nameSi ? ` · ${c.nameSi}` : ''}
                          </Text>
                        </Stack>
                        <Group gap={4} wrap="wrap">
                          {c.reviewStatus === 'needs_review' && (
                            <Button
                              size="xs"
                              variant="light"
                              color="green"
                              h={isMobile ? 44 : undefined}
                              leftSection={<IconCheck size={14} />}
                              onClick={() => void run(c.key, { approve: true })}
                            >
                              {t('Approve')}
                            </Button>
                          )}
                          <Tooltip label={t('Move up')}>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size={size}
                              aria-label={`${t('Move up')} ${c.name}`}
                              onClick={() => void move(c, 'up')}
                            >
                              <IconArrowUp size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={t('Move down')}>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size={size}
                              aria-label={`${t('Move down')} ${c.name}`}
                              onClick={() => void move(c, 'down')}
                            >
                              <IconArrowDown size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={c.pinned ? t('Unpin') : t('Pin to the top')}>
                            <ActionIcon
                              variant="subtle"
                              color={c.pinned ? 'blue' : 'gray'}
                              size={size}
                              aria-label={`${c.pinned ? t('Unpin') : t('Pin to the top')} ${c.name}`}
                              onClick={() => void run(c.key, { pinned: !c.pinned })}
                            >
                              {c.pinned ? <IconPinFilled size={16} /> : <IconPin size={16} />}
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={t('Edit')}>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size={size}
                              aria-label={`${t('Edit')} ${c.name}`}
                              onClick={() => setEditing(c)}
                            >
                              <IconPencil size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={c.active ? t('Hide') : t('Show')}>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size={size}
                              aria-label={`${c.active ? t('Hide') : t('Show')} ${c.name}`}
                              onClick={() => void run(c.key, { active: !c.active })}
                            >
                              {c.active ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                            </ActionIcon>
                          </Tooltip>
                          {c.active && !c.isSystem && (
                            <Tooltip label={t('Merge into another')}>
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                size={size}
                                aria-label={`${t('Merge')} ${c.name}`}
                                disabled={targetsOf(c).length === 0}
                                onClick={() => setMerging(c)}
                              >
                                <IconGitMerge size={16} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </Group>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              );
            })
          )}
        </Stack>
      </SectionShell>

      {editing !== null && (
        <CategoryEditModal category={editing} onClose={() => setEditing(null)} />
      )}
      {merging !== null && (
        <MergeCategoryModal
          category={merging}
          targets={all.filter(
            (x) => x.movementType === merging.movementType && x.active && x.key !== merging.key
          )}
          onClose={() => setMerging(null)}
        />
      )}
    </>
  );
};
