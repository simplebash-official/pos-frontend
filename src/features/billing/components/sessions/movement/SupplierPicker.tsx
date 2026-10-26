import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { SearchCombobox, type SearchComboboxItem } from '@/shared/components/SearchCombobox';
import { t } from '@/shared/i18n/t';
import { SupplierFormModal } from '@/features/suppliers/components/SupplierFormModal';
import { useCreateSupplier } from '@/features/suppliers/hooks/useSuppliers';
import type { SupplierInput } from '@/features/suppliers/types';

export interface SupplierPickerProps {
  items: SearchComboboxItem[];
  loading: boolean;
  /** The chosen supplier's key. */
  value: string | null;
  onChange: (key: string | null) => void;
  /** Whether this person may register a new supplier from the list. */
  canCreate: boolean;
  /**
   * Told when the register window opens and closes, so the window around it can ignore Escape
   * meanwhile: every open Mantine modal closes on Escape, which would close both at once.
   */
  onWindowOpenChange: (open: boolean) => void;
}

/**
 * Picks the supplier a payment goes to. Anyone who may register suppliers gets a pinned "+ Add"
 * footer that opens the same Register New Supplier window as the Suppliers page (without the
 * product links, which the cash window has no business with); once saved, the new supplier is
 * in the list and already chosen.
 */
export const SupplierPicker = ({
  items,
  loading,
  value,
  onChange,
  canCreate,
  onWindowOpenChange,
}: SupplierPickerProps) => {
  const createSupplier = useCreateSupplier();
  // The name typed in the list when "+ Add" was pressed; `null` while the window is shut.
  const [draftName, setDraftName] = useState<string | null>(null);

  useEffect(() => {
    onWindowOpenChange(draftName !== null);
    return () => onWindowOpenChange(false);
  }, [draftName, onWindowOpenChange]);

  const handleSubmit = async (values: SupplierInput) => {
    const created = await createSupplier.mutateAsync(values);
    onChange(created.key);
    notifications.show({
      title: t('Supplier Created'),
      message: created.name,
      color: 'green',
      icon: <IconCheck size={16} />,
    });
  };

  return (
    <>
      <SearchCombobox
        label={t('Supplier')}
        placeholder={t('Who is being paid?')}
        loading={loading}
        items={items}
        value={value}
        onChange={onChange}
        required
        create={
          canCreate
            ? {
                labelFor: (typed) => `${t('+ Add')} "${typed}" ${t('as a new supplier')}`,
                emptyLabel: t('+ Add a new supplier'),
                requiresName: false,
                onCreate: setDraftName,
              }
            : undefined
        }
        noCreateHint={canCreate ? undefined : t('To add a supplier, ask a manager.')}
        emptyText={t('No supplier found.')}
      />
      {draftName !== null && (
        <SupplierFormModal
          opened
          onClose={() => setDraftName(null)}
          onSubmit={handleSubmit}
          linkProducts={false}
          initialName={draftName}
          loading={createSupplier.isPending}
        />
      )}
    </>
  );
};
