import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { Button, Modal, Text } from '@mantine/core';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import type { LabelRow } from '../lib/printJob';
import { LabelPrintWorkspace } from './LabelPrintWorkspace';

export interface LabelPrintModalProps {
  opened: boolean;
  onClose: () => void;
  /** The items to print, with how many of each (more can be added inside). */
  rows: LabelRow[];
}

/** The label print window opened from other screens (inventory, new stock). */
export const LabelPrintModal = ({ opened, onClose, rows }: LabelPrintModalProps) => {
  const isMobile = useIsMobile();
  const [current, setCurrent] = useState(rows);
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {t('Print Labels')}
        </Text>
      }
      size="xl"
      centered
      fullScreen={isMobile}
    >
      <LabelPrintWorkspace
        rows={current}
        onRowsChange={setCurrent}
        onPrinted={onClose}
        shortcutsActive={opened}
        footerStart={
          <Button variant="default" onClick={onClose}>
            {t('Cancel')}
          </Button>
        }
      />
    </Modal>
  );
};
