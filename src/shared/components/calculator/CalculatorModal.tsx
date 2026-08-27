import { Modal, Group, Text, ThemeIcon, Badge, Box } from '@mantine/core';
import { IconCalculator } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { Calculator } from './Calculator';
import type { CalculatorProps } from './types';

export interface CalculatorModalProps extends CalculatorProps {
  opened: boolean;
  onClose: () => void;
}

export const CalculatorModal = ({
  opened,
  onClose,
  onSelectResult,
  initialValue,
  showHistory = true,
}: CalculatorModalProps) => {
  const handleSelectResult = (val: string) => {
    if (onSelectResult) {
      onSelectResult(val);
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size={380}
      radius="lg"
      padding="md"
      title={
        <Group gap="xs" align="center">
          <ThemeIcon size="md" variant="light" color="blue" radius="md">
            <IconCalculator size={18} />
          </ThemeIcon>
          <Text fw={700} size="md">
            {t('Calculator')}
          </Text>
          <Badge size="xs" variant="outline" color="gray" visibleFrom="xs">
            Alt+C
          </Badge>
        </Group>
      }
      styles={{
        header: {
          borderBottom: '1px solid var(--border)',
          paddingBottom: 'var(--mantine-spacing-xs)',
          marginBottom: 'var(--mantine-spacing-xs)',
        },
        body: {
          paddingTop: 0,
        },
        content: {
          boxShadow: '0 20px 35px -5px rgba(0, 0, 0, 0.2), 0 10px 15px -5px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Box pt="xs">
        <Calculator
          initialValue={initialValue}
          onSelectResult={onSelectResult ? handleSelectResult : undefined}
          showHistory={showHistory}
        />
      </Box>
    </Modal>
  );
};
