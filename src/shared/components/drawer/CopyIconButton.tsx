import { t } from '@/shared/i18n/t';
import { ActionIcon, CopyButton, Tooltip } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { useIsMobile } from '@/shared/hooks/useResponsive';

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
