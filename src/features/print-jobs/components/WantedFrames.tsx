import { ActionIcon, Box, Flex, Group, Paper, Stack, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { QuantityInput } from '@/shared/components/QuantityInput';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { FadeIn } from '@/shared/motion';
import { addWantedFrame, frameName, type FrameDraft } from '../lib/frameSizes';
import { lineQuantity, MAX_LINE_QUANTITY } from '../lib/printItems';
import { FrameSizePicker } from './FrameSizePicker';

export interface WantedFramesProps {
  frames: FrameDraft[];
  onChange: (frames: FrameDraft[]) => void;
  /** A billed or handed-back job's frames no longer change. */
  readOnly: boolean;
  /** Mark the quantity boxes that stop a save (after one was tried). */
  showProblems: boolean;
}

/** The frames a customer wants: a size search above, one row with a quantity per frame. */
export const WantedFrames = ({ frames, onChange, readOnly, showProblems }: WantedFramesProps) => {
  const isMobile = useIsMobile();

  return (
    <Stack gap="sm">
      {!readOnly && (
        <Text size="xs" c="dimmed">
          {t('Optional. What the customer wants; it does not change the price.')}
        </Text>
      )}
      {readOnly && frames.length === 0 && (
        <Text size="xs" c="dimmed">
          {t('No frames were chosen.')}
        </Text>
      )}
      {!readOnly && (
        <FrameSizePicker onPick={(picked) => onChange(addWantedFrame(frames, picked))} />
      )}
      {frames.map((frame) => {
        const name = frameName(frame);
        return (
          <FadeIn key={frame.frameSizeKey}>
            <Paper withBorder p="sm">
              {/* A phone puts the name above its quantity: side by side they do not fit. */}
              <Flex
                direction={isMobile ? 'column' : 'row'}
                align={isMobile ? 'stretch' : 'center'}
                justify="space-between"
                gap="sm"
              >
                <Text size="sm" fw={600}>
                  {name}
                </Text>
                {readOnly ? (
                  <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {`× ${frame.quantity}`}
                  </Text>
                ) : (
                  <Group gap="sm" wrap="nowrap">
                    <Box w={isMobile ? undefined : 150} style={{ flex: isMobile ? 1 : undefined }}>
                      <QuantityInput
                        value={frame.quantity}
                        onChange={(quantity) =>
                          onChange(
                            frames.map((other) =>
                              other.frameSizeKey === frame.frameSizeKey
                                ? { ...other, quantity }
                                : other
                            )
                          )
                        }
                        min={1}
                        max={MAX_LINE_QUANTITY}
                        size={isMobile ? 'md' : 'sm'}
                        aria-label={`${t('Quantity of')} ${name}`}
                        error={showProblems && lineQuantity(frame.quantity) === null}
                      />
                    </Box>
                    <ActionIcon
                      variant="light"
                      color="red"
                      size={isMobile ? 44 : 36}
                      aria-label={`${t('Remove')} ${name}`}
                      onClick={() =>
                        onChange(
                          frames.filter((other) => other.frameSizeKey !== frame.frameSizeKey)
                        )
                      }
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                )}
              </Flex>
            </Paper>
          </FadeIn>
        );
      })}
    </Stack>
  );
};
