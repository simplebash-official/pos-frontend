import {
  Stack,
  Group,
  Text,
  UnstyledButton,
  ScrollArea,
  ActionIcon,
  Tooltip,
  Center,
  Divider,
} from '@mantine/core';
import { IconTrash, IconHistory } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import type { CalculatorHistoryItem } from './types';

export interface CalculatorHistoryProps {
  history: CalculatorHistoryItem[];
  onRecall: (item: CalculatorHistoryItem) => void;
  onClear: () => void;
}

export const CalculatorHistory = ({ history, onRecall, onClear }: CalculatorHistoryProps) => {
  return (
    <Stack gap="xs" style={{ userSelect: 'none' }}>
      <Group justify="space-between" align="center">
        <Group gap={6}>
          <IconHistory size={14} style={{ opacity: 0.7 }} />
          <Text size="xs" fw={700} c="dimmed">
            {t('Calculation History')}
          </Text>
        </Group>

        {history.length > 0 && (
          <Tooltip label={t('Clear History')} withArrow position="top">
            <ActionIcon
              size="xs"
              variant="subtle"
              color="red"
              onClick={onClear}
              aria-label={t('Clear History')}
            >
              <IconTrash size={13} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>

      <Divider />

      <ScrollArea.Autosize
        mah={160}
        type="auto"
        classNames={{ viewport: 'scrollarea-fluid-content' }}
      >
        {history.length === 0 ? (
          <Center py="sm">
            <Text size="xs" c="dimmed">
              {t('No recent calculations')}
            </Text>
          </Center>
        ) : (
          <Stack gap={6}>
            {history.map((item) => (
              <UnstyledButton
                key={item.id}
                onClick={() => onRecall(item)}
                p="xs"
                className="calc-history-item"
              >
                <Group justify="space-between" align="center" wrap="nowrap">
                  <Text
                    size="xs"
                    c="dimmed"
                    style={{
                      fontFamily: 'monospace',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.expression}
                  </Text>
                  <Text size="sm" fw={700} c="blue.6">
                    = {item.result}
                  </Text>
                </Group>
              </UnstyledButton>
            ))}
          </Stack>
        )}
      </ScrollArea.Autosize>
    </Stack>
  );
};
