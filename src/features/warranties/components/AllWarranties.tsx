import { Alert, Button, Skeleton, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle, IconShieldOff } from '@tabler/icons-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { getErrorMessage } from '@/shared/lib/error';
import { useAllWarranties } from '../hooks/useWarranties';
import { toSingleGroup } from '../lib/warrantyView';
import { WarrantyGroupCard } from './WarrantyGroupCard';

/** Every warranty the shop has issued, newest first, shown before anyone searches. */
export const AllWarranties = ({
  onOpen,
  perRow,
}: {
  onOpen: (warrantyKey: string) => void;
  perRow: number;
}) => {
  const isMobile = useIsMobile();
  const query = useAllWarranties();

  if (query.isError) {
    return (
      <Alert color="red" icon={<IconAlertTriangle size={18} />}>
        {getErrorMessage(query.error)}
      </Alert>
    );
  }
  if (query.data === undefined) {
    return (
      <SimpleGrid cols={perRow} spacing="md">
        {[0, 1, 2, 3].map((slot) => (
          <Skeleton key={slot} height={120} />
        ))}
      </SimpleGrid>
    );
  }

  const warranties = query.data.pages.flatMap((page) => page.items);
  const total = query.data.pages[0].total;
  if (total === 0) {
    return (
      <EmptyState
        icon={
          <ThemeIcon size={56} variant="light" color="gray">
            <IconShieldOff size={30} />
          </ThemeIcon>
        }
        title={t('No warranties yet')}
        description={t('Items sold with a warranty will show here.')}
      />
    );
  }

  return (
    <Stack gap="sm">
      <Text size="sm" c="dimmed">
        {t('Showing')} {warranties.length} {t('of')} {total} {t('warranties')}
      </Text>
      <SimpleGrid cols={perRow} spacing="md">
        {warranties.map((warranty, index) => (
          <WarrantyGroupCard
            key={warranty.key}
            group={toSingleGroup(warranty)}
            index={index}
            onOpen={onOpen}
          />
        ))}
      </SimpleGrid>
      {query.hasNextPage && (
        <Button
          variant="default"
          h={isMobile ? 44 : undefined}
          loading={query.isFetchingNextPage}
          onClick={() => query.fetchNextPage()}
          style={{ alignSelf: 'center' }}
        >
          {t('Show more')}
        </Button>
      )}
    </Stack>
  );
};
