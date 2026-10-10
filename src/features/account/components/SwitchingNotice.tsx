import { Loader, Stack, Text, Title } from '@mantine/core';
import { t } from '@/shared/i18n/t';

/** Shown while the app restarts onto another shop's own data. Nothing else may be used meanwhile. */
export const SwitchingNotice = ({ shop }: { shop: string | null }) => (
  <Stack gap="md" align="center" ta="center" role="status" data-testid="switching-shop">
    <Loader size="sm" />
    <Title order={3}>
      {shop ? t('Switching to {shop}…').replace('{shop}', shop) : t('Switching shop…')}
    </Title>
    <Text size="sm" c="dimmed">
      {t('The app restarts by itself. This takes a few seconds.')}
    </Text>
  </Stack>
);
