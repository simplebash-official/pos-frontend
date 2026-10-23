import React, { useState } from 'react';
import { Alert, Button, Group, Modal, Select, Stack, Switch, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { t } from '@/shared/i18n/t';
import { useUpdateCashCategory } from '@/features/billing/hooks/useCashLookups';
import type {
  CashCategory,
  CashReportGroup,
  UpdateCashCategoryInput,
} from '@/features/billing/types';
import { REPORT_GROUPS, reportGroupLabel, validateCategoryName } from '../../lib/categoryAdmin';

export interface CategoryEditModalProps {
  category: CashCategory;
  onClose: () => void;
}

/** Only what the person changed is sent, so an edit on another device is never overwritten with old values. */
const changes = (
  c: CashCategory,
  f: { name: string; nameSi: string; group: CashReportGroup; receipt: boolean; limit: number }
): UpdateCashCategoryInput => {
  const out: UpdateCashCategoryInput = {};
  const name = f.name.split(/\s+/).filter(Boolean).join(' ');
  if (name !== c.name) out.name = name;
  if (f.nameSi.trim() !== (c.nameSi ?? '')) out.nameSi = f.nameSi.trim();
  if (f.group !== c.reportGroup) out.reportGroup = f.group;
  if (f.receipt !== c.requiresReceipt) out.requiresReceipt = f.receipt;
  if (f.limit !== (c.requiresApprovalOverCents ?? 0)) out.requiresApprovalOverCents = f.limit;
  return out;
};

/** Renames a category and sets how it is counted and when it needs a receipt or a manager. */
export const CategoryEditModal: React.FC<CategoryEditModalProps> = ({ category, onClose }) => {
  const isMobile = useIsMobile();
  const update = useUpdateCashCategory();
  const [name, setName] = useState(category.name);
  const [nameSi, setNameSi] = useState(category.nameSi ?? '');
  const [group, setGroup] = useState<CashReportGroup>(category.reportGroup);
  const [receipt, setReceipt] = useState(category.requiresReceipt);
  const [limit, setLimit] = useState(category.requiresApprovalOverCents ?? 0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const problem = validateCategoryName(name);
    if (problem) {
      setError(problem);
      return;
    }
    const input = changes(category, { name, nameSi, group, receipt, limit });
    if (Object.keys(input).length === 0) {
      onClose();
      return;
    }
    try {
      await update.mutateAsync({ key: category.key, input });
      notifications.show({ title: t('Category saved'), message: name, color: 'green' });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, t('The category could not be saved. Please try again.')));
    }
  };

  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {t('Edit Category')}
        </Text>
      }
      size="md"
      centered
      fullScreen={isMobile}
    >
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="md">
          <TextInput
            label={t('Name')}
            value={name}
            onChange={(e) => {
              setName(e.currentTarget.value);
              setError(null);
            }}
            maxLength={40}
            required
          />
          <TextInput
            label={t('Name in Sinhala (optional)')}
            value={nameSi}
            onChange={(e) => setNameSi(e.currentTarget.value)}
            maxLength={40}
          />
          <Select
            label={t('Counted in reports as')}
            allowDeselect={false}
            data={REPORT_GROUPS.map((g) => ({ value: g, label: reportGroupLabel(g) }))}
            value={group}
            onChange={(value) => value && setGroup(value as CashReportGroup)}
          />
          <Switch
            label={t('Ask for a receipt photo')}
            description={t('A reminder only: the photo is added after the entry is saved.')}
            checked={receipt}
            onChange={(e) => setReceipt(e.currentTarget.checked)}
          />
          <MoneyInput
            label={t('Manager approval above')}
            description={t(
              'A payout in this category above this amount needs a manager PIN. Leave empty for none.'
            )}
            valueCents={limit}
            onChangeCents={setLimit}
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
            <Button type="submit" color="blue" loading={update.isPending}>
              {t('Save')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
