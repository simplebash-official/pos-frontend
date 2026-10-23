import { useEffect, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Button,
  Group,
  NumberInput,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconPlus, IconTrash } from '@tabler/icons-react';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { t } from '@/shared/i18n/t';
import { useCashSettings, useUpdateCashSettings } from '@/features/billing/hooks/useCashLookups';
import type { CashSettings } from '@/features/billing/types';
import {
  MAX_QUICK_AMOUNTS,
  UNDO_WINDOW_RANGE,
  fromSettings,
  isChanged,
  toInput,
  validateRules,
  type CashRulesFormState,
} from '../../lib/cashRulesForm';
import { SectionShell } from '../SectionShell';

export interface CashRulesSectionProps {
  onDirtyChange: (dirty: boolean) => void;
}

const Form = ({
  saved,
  onDirtyChange,
}: {
  saved: CashSettings;
  onDirtyChange: (dirty: boolean) => void;
}) => {
  const isMobile = useIsMobile();
  const update = useUpdateCashSettings();
  const [form, setForm] = useState<CashRulesFormState>(() => fromSettings(saved));
  const [error, setError] = useState<string | null>(null);
  const dirty = isChanged(form, saved);

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  const patch = (changes: Partial<CashRulesFormState>) => {
    setForm((current) => ({ ...current, ...changes }));
    setError(null);
  };
  const setChip = (index: number, cents: number) =>
    patch({ quickAmountsCents: form.quickAmountsCents.map((c, i) => (i === index ? cents : c)) });

  const handleSave = async () => {
    const problem = validateRules(form);
    if (problem) {
      setError(problem);
      return;
    }
    try {
      const next = await update.mutateAsync(toInput(form));
      setForm(fromSettings(next));
      notifications.show({
        title: t('Settings Saved'),
        message: t('Cash drawer rules updated.'),
        color: 'teal',
      });
    } catch (err) {
      setError(getErrorMessage(err, t('The rules could not be saved. Please try again.')));
    }
  };

  return (
    <SectionShell
      title={t('Cash Drawer Rules')}
      description={t('How the cash form behaves for everyone who uses the drawer.')}
      isDirty={dirty}
      saving={update.isPending}
      onSave={() => void handleSave()}
      onCancel={() => {
        setForm(fromSettings(saved));
        setError(null);
      }}
      saveLabel={t('Save Changes')}
    >
      <Stack gap="lg" maw={560}>
        <NumberInput
          label={t('Undo time (seconds)')}
          description={t('How long a cashier can undo their own cash entry without a manager.')}
          min={UNDO_WINDOW_RANGE.min}
          max={UNDO_WINDOW_RANGE.max}
          allowDecimal={false}
          value={form.undoWindowSeconds}
          onChange={(value) => patch({ undoWindowSeconds: typeof value === 'number' ? value : 0 })}
          size={isMobile ? 'md' : 'sm'}
        />

        <MoneyInput
          label={t('Manager approval above')}
          description={t(
            'A payout above this amount needs a manager PIN, whatever it is for. Leave empty for no shop-wide limit. A category can have its own, lower limit.'
          )}
          valueCents={form.approvalThresholdCents}
          onChangeCents={(cents) => patch({ approvalThresholdCents: cents })}
          size={isMobile ? 'md' : 'sm'}
        />

        <MoneyInput
          label={t('Float target')}
          description={t(
            'What each drawer should keep after extra cash is dropped. Leave empty for no target.'
          )}
          valueCents={form.floatTargetCents}
          onChangeCents={(cents) => patch({ floatTargetCents: cents })}
          size={isMobile ? 'md' : 'sm'}
        />

        <Stack gap="xs">
          <Text size="sm" fw={500}>
            {t('Quick amounts')}
          </Text>
          <Text size="xs" c="dimmed">
            {t('The buttons under the amount on the cash form, smallest first. Up to 8.')}
          </Text>
          {form.quickAmountsCents.map((cents, index) => (
            <Group key={index} gap="xs" wrap="nowrap">
              <MoneyInput
                aria-label={`${t('Quick amount')} ${index + 1}`}
                valueCents={cents}
                onChangeCents={(value) => setChip(index, value)}
                size={isMobile ? 'md' : 'sm'}
                style={{ flex: 1 }}
              />
              <ActionIcon
                variant="subtle"
                color="red"
                size={isMobile ? 44 : 36}
                aria-label={`${t('Remove quick amount')} ${index + 1}`}
                onClick={() =>
                  patch({ quickAmountsCents: form.quickAmountsCents.filter((_, i) => i !== index) })
                }
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
          <Group>
            <Button
              variant="default"
              size="xs"
              h={isMobile ? 44 : undefined}
              leftSection={<IconPlus size={14} />}
              disabled={form.quickAmountsCents.length >= MAX_QUICK_AMOUNTS}
              onClick={() => patch({ quickAmountsCents: [...form.quickAmountsCents, 0] })}
            >
              {t('Add amount')}
            </Button>
          </Group>
        </Stack>

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
      </Stack>
    </SectionShell>
  );
};

/** The shop's drawer rules (owner only; the whole settings page is). */
export const CashRulesSection = ({ onDirtyChange }: CashRulesSectionProps) => {
  const { data, isLoading } = useCashSettings(true);
  if (isLoading || data === undefined) {
    return (
      <SectionShell
        title={t('Cash Drawer Rules')}
        isDirty={false}
        onSave={() => undefined}
        onCancel={() => undefined}
      >
        <Skeleton h={200} />
      </SectionShell>
    );
  }
  // Keyed by version so a save (or an edit from another device) starts the form from what is stored.
  return <Form key={data.version} saved={data} onDirtyChange={onDirtyChange} />;
};
