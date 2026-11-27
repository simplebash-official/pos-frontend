import { useRef, useState } from 'react';
import { Button, Flex, Modal, NumberInput, Stack, Text, TextInput } from '@mantine/core';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { getErrorMessage } from '@/shared/lib/error';
import { useCreatePrintFrameSize } from '../hooks/usePrintFrameSizes';
import {
  FRAME_SIZE_MAX_LENGTH,
  FRAME_WIDTH_MAX_INCHES,
  toWidthHundredths,
} from '../lib/frameSizes';

export interface FrameSizeModalProps {
  /** Set when adding a width to a listed size, which then cannot be changed. */
  size: string | null;
  onClose: () => void;
}

const widthProblemOf = (width: number | string): string | null => {
  if (width === '' || !(toWidthHundredths(Number(width)) >= 1)) {
    return t('Enter the frame width in inches.');
  }
  if (Number(width) > FRAME_WIDTH_MAX_INCHES) {
    return t('A frame width can be at most 100 inches.');
  }
  return null;
};

/** Adds a frame size with a width. Mount it to open it: it starts with a clean slate. */
export const FrameSizeModal = ({ size: listedSize, onClose }: FrameSizeModalProps) => {
  const isMobile = useIsMobile();
  const create = useCreatePrintFrameSize();
  const [size, setSize] = useState(listedSize === null ? '' : listedSize);
  const [width, setWidth] = useState<number | string>('');
  const [tried, setTried] = useState(false);
  const sizeInput = useRef<HTMLInputElement>(null);

  const newSize = listedSize === null;
  const sizeProblem = size.trim() === '' ? t('Enter the frame size, like 8x10 or A4.') : null;
  const widthProblem = widthProblemOf(width);

  /** A refusal is about what was typed before, so typing again takes it away. */
  const typed = () => {
    if (create.isError) create.reset();
  };

  const submit = async (another: boolean) => {
    setTried(true);
    if (sizeProblem !== null || widthProblem !== null) return;
    try {
      await create.mutateAsync({
        size: size.trim(),
        widthHundredthsInch: toWidthHundredths(Number(width)),
      });
    } catch {
      // The notification and the inline message below say what went wrong.
      return;
    }
    if (!another) {
      onClose();
      return;
    }
    // The width stays, to work down one column of a size list.
    setSize('');
    setTried(false);
    if (!isMobile) sizeInput.current?.focus();
  };

  const inputSize = isMobile ? 'md' : 'sm';
  const touch = isMobile ? 44 : undefined;

  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {newSize ? t('Add a frame size') : `${t('Add a width:')} ${listedSize}`}
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
    >
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void submit(false);
        }}
      >
        <Stack gap="md">
          <TextInput
            ref={sizeInput}
            label={t('Frame size')}
            placeholder={t('e.g. 8x10 or A4')}
            value={size}
            onChange={(event) => {
              typed();
              setSize(event.currentTarget.value);
            }}
            error={tried ? sizeProblem : null}
            maxLength={FRAME_SIZE_MAX_LENGTH}
            readOnly={!newSize}
            variant={newSize ? 'default' : 'filled'}
            size={inputSize}
            data-autofocus={!isMobile && newSize ? true : undefined}
          />
          <NumberInput
            label={t('Frame width (inches)')}
            placeholder={t('e.g. 0.75')}
            value={width}
            onChange={(value) => {
              typed();
              setWidth(value);
            }}
            error={tried ? widthProblem : null}
            decimalScale={2}
            allowNegative={false}
            hideControls
            inputMode="decimal"
            size={inputSize}
            data-autofocus={!isMobile && !newSize ? true : undefined}
          />
          {create.error !== null && (
            <Text size="sm" c="red" role="alert">
              {getErrorMessage(create.error)}
            </Text>
          )}
          {/* A phone stacks the buttons full width with Save on top: three do not fit a row. */}
          <Flex direction={isMobile ? 'column-reverse' : 'row'} justify="flex-end" mt="md" gap="sm">
            <Button variant="default" onClick={onClose} disabled={create.isPending} h={touch}>
              {t('Cancel')}
            </Button>
            {newSize && (
              <Button
                variant="light"
                onClick={() => void submit(true)}
                disabled={create.isPending}
                h={touch}
              >
                {t('Save & add another')}
              </Button>
            )}
            <Button
              type="submit"
              color="blue"
              loading={create.isPending}
              h={touch}
              data-log-id="print-jobs.save-frame-size"
            >
              {t('Save')}
            </Button>
          </Flex>
        </Stack>
      </form>
    </Modal>
  );
};
