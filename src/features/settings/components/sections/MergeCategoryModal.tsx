import React, { useState } from 'react';
import { Alert, Button, Group, Modal, Select, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { t } from '@/shared/i18n/t';
import { useMergeCashCategory } from '@/features/billing/hooks/useCashLookups';
import type { CashCategory } from '@/features/billing/types';

export interface MergeCategoryModalProps {
  category: CashCategory;
  /** The other visible categories of the same kind. */
  targets: CashCategory[];
  onClose: () => void;
}

/** Moves everything filed under one category into another and retires the first. */
export const MergeCategoryModal: React.FC<MergeCategoryModalProps> = ({
  category,
  targets,
  onClose,
}) => {
  const isMobile = useIsMobile();
  const merge = useMergeCashCategory();
  const [targetKey, setTargetKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const target = targets.find((c) => c.key === targetKey);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (targetKey === null) {
      setError(t('Please pick the category to merge into.'));
      return;
    }
    try {
      await merge.mutateAsync({ key: category.key, targetKey });
      notifications.show({
        title: t('Categories merged'),
        message: target?.name ?? '',
        color: 'green',
      });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, t('The categories could not be merged. Please try again.')));
    }
  };

  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {`${t('Merge')} — ${category.name}`}
        </Text>
      }
      size="md"
      centered
      fullScreen={isMobile}
    >
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="md">
          <Text size="sm">
            {t(
              'Everything filed under this category moves to the one you pick, and this one is retired. This cannot be undone.'
            )}
          </Text>
          <Select
            label={t('Merge into')}
            placeholder={t('Pick a category')}
            data={targets.map((c) => ({ value: c.key, label: c.name }))}
            value={targetKey}
            onChange={(value) => {
              setTargetKey(value);
              setError(null);
            }}
            searchable
            required
          />
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              title={t('Please check')}
            >
              {error}
            </Alert>
          )}
          <Group justify="flex-end" mt="md" gap="sm">
            <Button variant="default" onClick={onClose} type="button">
              {t('Cancel')}
            </Button>
            <Button type="submit" color="red" loading={merge.isPending}>
              {t('Merge')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
