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
import type { CatalogService, ServiceCatalogActions, ServiceCatalogCopy } from './serviceCatalog';
import { ServiceFormModal } from './ServiceFormModal';

export interface ServiceCatalogSectionProps {
  copy: ServiceCatalogCopy;
  /** Every service, hidden ones included; `undefined` until it has loaded. */
  services: CatalogService[] | undefined;
  loading: boolean;
  actions: ServiceCatalogActions;
  /** The service being hidden or shown right now. */
  togglingKey: string | null;
}

/**
 * One of the shop's lists of ready-made services: the work it does often, with the usual charge
 * and warranty, added to a job in one tap. Hiding never deletes; jobs keep their own copy. Every
 * action saves at once.
 */
export const ServiceCatalogSection = ({
  copy,
  services,
  loading,
  actions,
  togglingKey,
}: ServiceCatalogSectionProps) => {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [editing, setEditing] = useState<CatalogService | 'new' | null>(null);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (services ?? []).filter(
      (service) =>
        (showHidden || service.active) && (q === '' || service.name.toLowerCase().includes(q))
    );
  }, [services, search, showHidden]);

  const toggle = (service: CatalogService) => {
    const { key, ...rest } = service;
    // The mutation's own notification reports a failure.
    void actions.update(key, { ...rest, active: !service.active }).catch(() => undefined);
  };

  const size = isMobile ? 44 : 32;

  return (
    <>
      <SectionShell
        title={copy.title}
        description={copy.description}
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

          {loading ? (
            <Skeleton h={160} />
          ) : visible.length === 0 ? (
            <Text size="sm" c="dimmed">
              {services === undefined || services.length === 0
                ? copy.empty
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
                          {[
                            `${copy.priceLabel} ${formatMoney(service.priceCents)}`,
                            ...(service.costCents === undefined
                              ? []
                              : [`${copy.costLabel} ${formatMoney(service.costCents)}`]),
                            coverageLabel(service.warranty.coverage),
                          ].join(' · ')}
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
                            loading={togglingKey === service.key}
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
        <ServiceFormModal
          service={editing === 'new' ? null : editing}
          copy={copy}
          actions={actions}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
};
