import { Modal, Group, Text, ThemeIcon, Badge, Box } from '@mantine/core';
import { IconCalculator } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { Calculator } from './Calculator';
import type { CalculatorProps } from './types';

export interface CalculatorModalProps extends CalculatorProps {
  opened: boolean;
  onClose: () => void;
  title?: string;
}

export const CalculatorModal = ({
  opened,
  onClose,
  onSelectResult,
  initialValue,
  showHistory = true,
  title,
}: CalculatorModalProps) => {
  const isMobile = useIsMobile();

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
      fullScreen={isMobile}
      size={isMobile ? '100%' : 390}
      padding={isMobile ? 'sm' : 'md'}
      transitionProps={{
        transition: 'pop',
        duration: 200,
        timingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      overlayProps={{
        backgroundOpacity: 0.45,
        blur: 3,
      }}
      title={
        <Group gap="xs" align="center">
          <ThemeIcon size="md" variant="light" color="blue" radius="md">
            <IconCalculator size={18} />
          </ThemeIcon>
          <Text fw={700} size="md">
            {title || t('Calculator')}
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
      <Box pt="xs" style={{ display: 'flex', justifyContent: 'center' }}>
        <Calculator
          initialValue={initialValue}
          onSelectResult={onSelectResult ? handleSelectResult : undefined}
          showHistory={showHistory}
        />
      </Box>
    </Modal>
  );
};
