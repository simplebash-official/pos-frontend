import { Button, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconArrowRight, IconShieldCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { WarrantyMetrics } from '@/features/warranties';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';

/** The warranty desk's numbers on the dashboard, with a way into the Warranties page. */
export const WarrantyDeskWidget = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon color="teal" variant="light" size="lg">
            <IconShieldCheck size={20} />
          </ThemeIcon>
          <div>
            <Text fw={700} size="md">
              {t('Warranties')}
            </Text>
            <Text size="xs" c="dimmed">
              {t('What is covered, what ends this week, and the claims in hand')}
            </Text>
          </div>
        </Group>
        <Button
          variant="default"
          size={isMobile ? 'sm' : 'xs'}
          mih={isMobile ? 44 : undefined}
          fullWidth={isMobile}
          rightSection={<IconArrowRight size={14} />}
          onClick={() => navigate(ROUTES.WARRANTIES)}
        >
          {t('Open warranties')}
        </Button>
      </Group>
      <WarrantyMetrics />
    </Stack>
  );
};
