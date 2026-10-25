import { useMemo } from 'react';
import { SearchCombobox, type SearchComboboxItem } from '@/shared/components/SearchCombobox';
import { PERMISSIONS } from '@/constants/permissions';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { getErrorMessage } from '@/shared/lib/error';
import { notifications } from '@mantine/notifications';
import { t } from '@/shared/i18n/t';
import { useCreatePayee, usePayees } from '@/features/billing/hooks/useCashLookups';
import { cleanPayeeName, payeeNameError } from '@/features/billing/lib/payeeName';

export interface ChargePayeeFieldProps {
  /** The chosen payee's key. */
  value: string | null;
  onChange: (key: string | null) => void;
}

/**
 * Picks the courier, clearing agent or porter an extra charge is paid to. Only companies and
 * people added for this purpose are offered, never a supplier or a staff member. A manager can
 * add a new one from the list's footer.
 */
export const ChargePayeeField = ({ value, onChange }: ChargePayeeFieldProps) => {
  const canCreate = useHasPermission(PERMISSIONS.PAYEES_MANAGE);
  const { data: payees, isLoading } = usePayees({}, true);
  const createPayee = useCreatePayee();

  const items: SearchComboboxItem[] = useMemo(
    () =>
      (payees === undefined ? [] : payees)
        .filter((payee) => payee.payeeType === 'vendor' || payee.payeeType === 'other')
        .map((payee) => ({ value: payee.key, label: payee.name, description: payee.phone })),
    [payees]
  );

  const addNew = async (typed: string) => {
    const problem = payeeNameError(typed);
    if (problem !== null) {
      notifications.show({
        title: t('Could not add the courier or agent'),
        message: problem,
        color: 'red',
      });
      return;
    }
    try {
      const created = await createPayee.mutateAsync({
        payeeType: 'vendor',
        name: cleanPayeeName(typed),
      });
      onChange(created.key);
    } catch (error) {
      notifications.show({
        title: t('Could not add the courier or agent'),
        message: getErrorMessage(error),
        color: 'red',
      });
    }
  };

  return (
    <SearchCombobox
      label={t('Who is paid? (optional)')}
      placeholder={t('Courier, agent or porter')}
      loading={isLoading}
      items={items}
      value={value}
      onChange={onChange}
      clearable
      create={
        canCreate
          ? {
              labelFor: (typed) => `${t('+ Add')} "${typed}" ${t('as a new courier or agent')}`,
              emptyLabel: t('Type a name to add a new courier or agent'),
              requiresName: true,
              onCreate: (typed) => void addNew(typed),
            }
          : undefined
      }
      noCreateHint={canCreate ? undefined : t('To add someone new, ask a manager.')}
      emptyText={t('Nobody added yet.')}
    />
  );
};
