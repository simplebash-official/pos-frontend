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
import { IconEye, IconEyeOff, IconPencil, IconPlus, IconSearch } from '@tabler/icons-react';
import { coverageLabel } from '@/features/warranties';
import { SectionShell } from '@/features/settings/components/SectionShell';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import { FadeIn } from '@/shared/motion';
import { useRepairServices, useUpdateRepairService } from '../hooks/useRepairServices';
import type { RepairService } from '../types';
import { RepairServiceFormModal } from './RepairServiceFormModal';

/**
 * The shop's ready-made repair services: the work it does often, with the usual labour and
 * warranty, added to a job in one tap. Hiding never deletes; jobs keep their own copy. Every
 * action saves at once.
 */
export const RepairServicesSection = () => {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const services = useRepairServices(true, true);
  const update = useUpdateRepairService();
  const [editing, setEditing] = useState<RepairService | 'new' | null>(null);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (services.data ?? []).filter(
      (service) =>
        (showHidden || service.active) && (q === '' || service.name.toLowerCase().includes(q))
    );
  }, [services.data, search, showHidden]);

  const toggle = (service: RepairService) =>
    update.mutate({
      key: service.key,
      input: {
        name: service.name,
        laborCents: service.laborCents,
        warranty: service.warranty,
        active: !service.active,
      },
    });

  const size = isMobile ? 44 : 32;

  return (
    <>
      <SectionShell
        title={t('Repair Services')}
        description={t(
          'The work you do often, with its usual labour and warranty. Add one to a repair job in one tap.'
        )}
        isDirty={false}
        onSave={() => undefined}
        onCancel={() => undefined}
        hideActions
      >
        <Stack gap="md">
          <Group gap="sm" wrap={isMobile ? 'wrap' : 'nowrap'}>
            <TextInput
              aria-label={t('Search services')}
              placeholder={t('Search services')}
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              size={isMobile ? 'md' : 'sm'}
              style={{ flex: 1, minWidth: 0 }}
            />
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setEditing('new')}
              h={isMobile ? 44 : undefined}
              fullWidth={isMobile}
            >
              {t('Add a service')}
            </Button>
          </Group>
          <Switch
            label={t('Show hidden')}
            checked={showHidden}
            onChange={(event) => setShowHidden(event.currentTarget.checked)}
          />

          {services.isLoading ? (
            <Skeleton h={160} />
          ) : visible.length === 0 ? (
            <Text size="sm" c="dimmed">
              {(services.data ?? []).length === 0
                ? t(
                    'No services yet. Add the repairs you do most, like a screen or battery replacement.'
                  )
                : t('No service matches.')}
            </Text>
          ) : (
            <Stack gap="xs">
              {visible.map((service, index) => (
                <FadeIn key={service.key} index={index}>
                  <Paper withBorder p="sm" opacity={service.active ? 1 : 0.6}>
                    <Group justify="space-between" wrap="wrap" gap="xs">
                      <Stack gap={2} style={{ minWidth: 0, flex: isMobile ? '1 1 100%' : 1 }}>
                        <Group gap={6} wrap="wrap">
                          <Text fw={600} size="sm">
                            {service.name}
                          </Text>
                          {!service.active && (
                            <Badge size="xs" color="gray" variant="light">
                              {t('Hidden')}
                            </Badge>
                          )}
                        </Group>
                        <Text size="xs" c="dimmed">
                          {`${t('Labour')} ${formatMoney(service.laborCents)} · ${coverageLabel(service.warranty.coverage)}`}
                        </Text>
                      </Stack>
                      <Group gap={4} wrap="nowrap">
                        <Tooltip label={t('Edit')}>
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            size={size}
                            aria-label={`${t('Edit')} ${service.name}`}
                            onClick={() => setEditing(service)}
                          >
                            <IconPencil size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={service.active ? t('Hide') : t('Show')}>
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            size={size}
                            aria-label={`${service.active ? t('Hide') : t('Show')} ${service.name}`}
                            onClick={() => toggle(service)}
                            loading={update.isPending && update.variables?.key === service.key}
                          >
                            {service.active ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Group>
                  </Paper>
                </FadeIn>
              ))}
            </Stack>
          )}
        </Stack>
      </SectionShell>

      {editing !== null && (
        <RepairServiceFormModal
          service={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
};
