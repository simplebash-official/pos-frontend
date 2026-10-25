import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  Skeleton,
  Stack,
  Switch,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEye, IconEyeOff, IconPencil, IconPlus, IconSearch } from '@tabler/icons-react';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { t } from '@/shared/i18n/t';
import { usePayees, useUpdatePayee } from '@/features/billing/hooks/useCashLookups';
import type { Payee } from '@/features/billing/types';
import { SectionShell } from '../SectionShell';
import { PayeeFormModal } from './PayeeFormModal';

// Where the shop keeps the landlords and companies it pays by cash: add, rename, change a phone
// number, and hide one that is no longer used. Suppliers and staff are kept on their own pages.
// Hiding never deletes: past payments keep the name. Every action saves at once.
export const PayeesSection = () => {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const { data, isLoading } = usePayees({ includeHidden: true }, true);
  const update = useUpdatePayee();
  // `null` closed, `'new'` adding, otherwise the payee being edited.
  const [editing, setEditing] = useState<Payee | 'new' | null>(null);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter(
      (p) =>
        (p.payeeType === 'vendor' || p.payeeType === 'other') &&
        (showHidden || p.active) &&
        (q === '' || p.name.toLowerCase().includes(q) || (p.phone ?? '').includes(q))
    );
  }, [data, search, showHidden]);

  const toggle = async (p: Payee) => {
    try {
      await update.mutateAsync({ key: p.key, input: { active: !p.active } });
    } catch (err) {
      notifications.show({
        title: t('Save Failed'),
        message: getErrorMessage(err, t('This could not be saved. Please try again.')),
        color: 'red',
      });
    }
  };

  const size = isMobile ? 44 : 32;

  return (
    <>
      <SectionShell
        title={t('Landlords and Companies')}
        description={t('Who you pay rent and bills to from the drawer.')}
        isDirty={false}
        onSave={() => undefined}
        onCancel={() => undefined}
        hideActions
      >
        <Stack gap="md">
          <Group gap="sm" wrap={isMobile ? 'wrap' : 'nowrap'}>
            <TextInput
              aria-label={t('Search by name or phone')}
              placeholder={t('Search by name or phone')}
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              size={isMobile ? 'md' : 'sm'}
              style={{ flex: 1, minWidth: 0 }}
            />
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setEditing('new')}
              h={isMobile ? 44 : undefined}
              fullWidth={isMobile}
            >
              {t('Add')}
            </Button>
          </Group>
          <Switch
            label={t('Show hidden')}
            checked={showHidden}
            onChange={(e) => setShowHidden(e.currentTarget.checked)}
          />

          {isLoading ? (
            <Skeleton h={160} />
          ) : visible.length === 0 ? (
            <Text size="sm" c="dimmed">
              {t('Nobody added yet.')}
            </Text>
          ) : (
            <Stack gap="xs">
              {visible.map((p) => (
                <Paper key={p.key} withBorder p="sm" opacity={p.active ? 1 : 0.6}>
                  <Group justify="space-between" wrap="wrap" gap="xs">
                    <Stack gap={2} style={{ minWidth: 0, flex: isMobile ? '1 1 100%' : 1 }}>
                      <Group gap={6} wrap="wrap">
                        <Text fw={600} size="sm">
                          {p.name}
                        </Text>
                        {!p.active && (
                          <Badge size="xs" color="gray" variant="light">
                            {t('Hidden')}
                          </Badge>
                        )}
                        {p.payeeType === 'other' && (
                          <Badge size="xs" color="blue" variant="light">
                            {t('Typed on a payment')}
                          </Badge>
                        )}
                      </Group>
                      <Text size="xs" c="dimmed">
                        {p.phone ? `${p.phone} · ` : ''}
                        {`${t('Used')} ${p.usageCount}`}
                      </Text>
                    </Stack>
                    <Group gap={4} wrap="nowrap">
                      <Tooltip label={t('Edit')}>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size={size}
                          aria-label={`${t('Edit')} ${p.name}`}
                          onClick={() => setEditing(p)}
                        >
                          <IconPencil size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label={p.active ? t('Hide') : t('Show')}>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size={size}
                          aria-label={`${p.active ? t('Hide') : t('Show')} ${p.name}`}
                          onClick={() => void toggle(p)}
                        >
                          {p.active ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>
      </SectionShell>

      {editing !== null && (
        <PayeeFormModal
          payee={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
};
