import { useState } from 'react';
import { Button, Group, Paper, Stack, TextInput } from '@mantine/core';
import { SearchCombobox, type SearchComboboxItem } from '@/shared/components/SearchCombobox';
import { getErrorMessage } from '@/shared/lib/error';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { useCreatePayee } from '../../../hooks/useCashLookups';
import { cleanPayeeName, payeeNameError, PAYEE_NAME_MAX } from '../../../lib/payeeName';

export interface PayeePickerProps {
  items: SearchComboboxItem[];
  loading: boolean;
  /** The chosen payee's key. */
  value: string | null;
  onChange: (key: string | null) => void;
  /** Whether this person may add a landlord or company to the list. */
  canCreate: boolean;
}

/**
 * Picks the landlord or company a rent or bill payment goes to. Anyone who may manage payees can
 * add a new one from the list's pinned footer: a small form asks for the name and an optional
 * phone number, saves it, and picks it.
 */
export const PayeePicker = ({ items, loading, value, onChange, canCreate }: PayeePickerProps) => {
  const isMobile = useIsMobile();
  const createPayee = useCreatePayee();
  const [draftName, setDraftName] = useState<string | null>(null);
  const [draftPhone, setDraftPhone] = useState('');
  const [draftError, setDraftError] = useState<string | null>(null);

  const openDraft = (typed: string) => {
    setDraftName(typed);
    setDraftPhone('');
    setDraftError(null);
  };

  const closeDraft = () => {
    setDraftName(null);
    setDraftError(null);
  };

  const saveDraft = async () => {
    if (draftName === null) return;
    const problem = payeeNameError(draftName);
    if (problem) {
      setDraftError(problem);
      return;
    }
    try {
      const created = await createPayee.mutateAsync({
        payeeType: 'vendor',
        name: cleanPayeeName(draftName),
        phone: draftPhone.trim() === '' ? undefined : draftPhone.trim(),
      });
      onChange(created.key);
      closeDraft();
    } catch (err) {
      setDraftError(getErrorMessage(err));
    }
  };

  if (draftName !== null) {
    return (
      <Paper withBorder p="sm" data-testid="new-payee-confirm">
        <Stack gap="sm">
          <TextInput
            label={t('Name of the landlord or company')}
            value={draftName}
            onChange={(e) => {
              setDraftName(e.currentTarget.value);
              setDraftError(null);
            }}
            maxLength={PAYEE_NAME_MAX}
            error={draftError}
            autoFocus={!isMobile}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void saveDraft();
              }
            }}
          />
          <TextInput
            label={t('Phone number (optional)')}
            value={draftPhone}
            onChange={(e) => setDraftPhone(e.currentTarget.value)}
            inputMode="tel"
            autoComplete="off"
            name="new-payee-phone"
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={closeDraft} disabled={createPayee.isPending}>
              {t('Cancel')}
            </Button>
            <Button onClick={() => void saveDraft()} loading={createPayee.isPending}>
              {t('Add and use')}
            </Button>
          </Group>
        </Stack>
      </Paper>
    );
  }

  return (
    <SearchCombobox
      label={t('Who is being paid?')}
      placeholder={t('Landlord or company')}
      loading={loading}
      items={items}
      value={value}
      onChange={onChange}
      required
      create={
        canCreate
          ? {
              labelFor: (typed) => `${t('+ Add')} "${typed}" ${t('as a new landlord or company')}`,
              emptyLabel: t('+ Add a new landlord or company'),
              onCreate: openDraft,
            }
          : undefined
      }
      noCreateHint={canCreate ? undefined : t('To add someone new, ask a manager.')}
      emptyText={t('Nobody added yet.')}
    />
  );
};
