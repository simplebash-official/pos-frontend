import { t } from '@/shared/i18n/t';
import type { ReactNode } from 'react';
import { ActionIcon, CopyButton, Group, Text, Tooltip } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { useIsMobile } from '@/shared/hooks/useResponsive';

/** The small uppercase heading above each card in the Item Specifications drawer. */
export const SectionLabel = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
  <Group gap={6} wrap="nowrap" c="dimmed">
    {icon}
    <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
      {children}
    </Text>
  </Group>
);

/** A copy-to-clipboard icon that flips to a tick for a moment after copying. */
export const CopyIconButton = ({ value, label }: { value: string; label: string }) => {
  const isMobile = useIsMobile();
  return (
    <CopyButton value={value}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? t('Copied') : label} withArrow>
          <ActionIcon
            variant="subtle"
            color={copied ? 'teal' : 'gray'}
            size={isMobile ? 44 : 'sm'}
            onClick={copy}
            aria-label={label}
          >
            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
          </ActionIcon>
        </Tooltip>
      )}
    </CopyButton>
  );
};
