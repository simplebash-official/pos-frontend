import { t } from '@/shared/i18n/t';
import { Badge, Button, Group, Modal, Paper, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconHistory, IconSparkles } from '@tabler/icons-react';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { formatDateTime } from '@/shared/lib/date';
import type { DocumentDesign, DocumentDesignStatus } from '../api/documentsApi';

interface ReprintDesignDialogProps {
  opened: boolean;
  status: DocumentDesignStatus | undefined;
  /** The user's answer. */
  onChoose: (design: DocumentDesign) => void;
  /** Backing out: the preview closes without printing anything. */
  onCancel: () => void;
}

// Asked when a document was printed before with another design than would print now: print it
// again exactly as it was, or in today's design. One tap each; nothing is guessed for the user.
export const ReprintDesignDialog = ({
  opened,
  status,
  onChoose,
  onCancel,
}: ReprintDesignDialogProps) => {
  const isMobile = useIsMobile();

  return (
    <Modal
      opened={opened && status?.differs === true}
      onClose={onCancel}
      title={
        <Text fw={700} size="lg">
          {t('Which design should this print use?')}
        </Text>
      }
      centered
      fullScreen={isMobile}
      closeOnClickOutside={false}
      zIndex={400}
    >
      {status && (
        <ReprintDesignChoices
          status={status}
          isMobile={isMobile}
          onChoose={onChoose}
          onCancel={onCancel}
        />
      )}
    </Modal>
  );
};

interface ReprintDesignChoicesProps {
  status: DocumentDesignStatus;
  isMobile: boolean;
  onChoose: (design: DocumentDesign) => void;
  onCancel: () => void;
}

// The two answers, as tappable cards. Kept apart from the modal so it can be rendered on its own.
export const ReprintDesignChoices = ({
  status,
  isMobile,
  onChoose,
  onCancel,
}: ReprintDesignChoicesProps) => {
  const { stored, current } = status;
  const storedName = stored?.title
    ? `${stored.title}${stored.version ? ` v${stored.version}` : ''}`
    : t('the design it was first printed with');

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        {t('This document was printed before, and the design has changed since.')}
      </Text>

      <OptionCard
        icon={<IconHistory size={22} />}
        title={t('Original design')}
        design={storedName}
        detail={stored ? `${t('Printed on')} ${formatDateTime(stored.createdAt)}` : ''}
        hint={t('Prints it exactly as it was given to the customer.')}
        onClick={() => onChoose('original')}
        dataLogId="billing.reprint-original-design"
      />
      <OptionCard
        icon={<IconSparkles size={22} />}
        title={t('Current design')}
        design={`${current.title} v${current.version}`}
        detail=""
        hint={t('Prints it with the design your shop uses today.')}
        onClick={() => onChoose('current')}
        dataLogId="billing.reprint-current-design"
        recommended
      />

      <Group justify="flex-end">
        <Button variant="default" size={isMobile ? 'md' : 'sm'} onClick={onCancel}>
          {t('Cancel')}
        </Button>
      </Group>
    </Stack>
  );
};

interface OptionCardProps {
  icon: React.ReactNode;
  title: string;
  design: string;
  detail: string;
  hint: string;
  onClick: () => void;
  dataLogId: string;
  recommended?: boolean;
}

const OptionCard = ({
  icon,
  title,
  design,
  detail,
  hint,
  onClick,
  dataLogId,
  recommended = false,
}: OptionCardProps) => (
  <UnstyledButton onClick={onClick} data-log-id={dataLogId} style={{ display: 'block' }}>
    <Paper
      withBorder
      p="md"
      style={{
        backgroundColor: 'var(--bg-app)',
        minHeight: 44,
        borderColor: recommended ? 'var(--mantine-color-blue-6)' : undefined,
      }}
    >
      <Group gap="md" wrap="nowrap" align="flex-start">
        <Text
          c={recommended ? 'blue' : 'dimmed'}
          style={{ flexShrink: 0, lineHeight: 0, marginTop: 2 }}
        >
          {icon}
        </Text>
        <Stack gap={2} style={{ minWidth: 0 }}>
          <Group gap="xs">
            <Text fw={700}>{title}</Text>
            {recommended && (
              <Badge size="xs" variant="light" color="blue">
                {t('Shop standard')}
              </Badge>
            )}
          </Group>
          <Text size="sm" fw={600}>
            {design}
          </Text>
          {detail && (
            <Text size="xs" c="dimmed">
              {detail}
            </Text>
          )}
          <Text size="xs" c="dimmed">
            {hint}
          </Text>
        </Stack>
      </Group>
    </Paper>
  </UnstyledButton>
);
