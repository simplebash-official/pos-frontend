import { useState } from 'react';
import { Button, Group, Modal, NumberInput, Stack, Switch, Text, TextInput } from '@mantine/core';
import { profileProblem } from '@/features/warranties';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { getErrorMessage } from '@/shared/lib/error';
import { fromCents, toCents } from '@/shared/lib/money';
import { useCreateRepairService, useUpdateRepairService } from '../hooks/useRepairServices';
import type { RepairService } from '../types';
import { cleanWarranty } from '../lib/repairItems';
import { WorkWarrantyFields } from './WorkWarrantyFields';

const sectionLabel = (text: string) => (
  <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
    {text}
  </Text>
);

export interface RepairServiceFormModalProps {
  /** The service to edit, or `null` to add one. */
  service: RepairService | null;
  onClose: () => void;
}

/** Adds or changes one of the shop's ready-made repair services. */
export const RepairServiceFormModal = ({ service, onClose }: RepairServiceFormModalProps) => {
  const isMobile = useIsMobile();
  const create = useCreateRepairService();
  const update = useUpdateRepairService();
  const [name, setName] = useState(service === null ? '' : service.name);
  const [labor, setLabor] = useState<number | string>(
    service === null ? '' : fromCents(service.laborCents)
  );
  const [warranty, setWarranty] = useState(
    service === null ? { coverage: { kind: 'none' as const } } : service.warranty
  );
  const [active, setActive] = useState(service === null ? true : service.active);
  const [tried, setTried] = useState(false);

  const saving = create.isPending || update.isPending;
  const failure = create.error ?? update.error;
  const nameProblem = name.trim() === '' ? t('Give the service a name.') : null;
  const laborProblem = labor !== '' && Number(labor) < 0 ? t('Labour cannot be below zero.') : null;
  const warrantyProblem = profileProblem(warranty);

  const save = async () => {
    setTried(true);
    if (nameProblem !== null || laborProblem !== null || warrantyProblem !== null) return;
    const input = {
      name: name.trim(),
      laborCents: labor === '' ? 0 : toCents(Number(labor)),
      warranty: cleanWarranty(warranty),
      active,
    };
    try {
      if (service === null) {
        await create.mutateAsync(input);
      } else {
        await update.mutateAsync({ key: service.key, input });
      }
      onClose();
    } catch {
      // The notification and the inline message below say what went wrong.
    }
  };

  const size = isMobile ? 'md' : 'sm';

  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {service === null ? t('Add a repair service') : `${t('Edit:')} ${service.name}`}
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <Stack gap="md">
          <TextInput
            label={t('What is the service called?')}
            placeholder={t('e.g. Screen replacement')}
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            error={tried ? nameProblem : null}
            maxLength={80}
            size={size}
            data-autofocus={isMobile ? undefined : true}
          />
          <NumberInput
            label={t('Usual labour')}
            description={t(
              'Filled in when the service is added to a job; you can change it there.'
            )}
            placeholder="0"
            prefix="Rs. "
            min={0}
            thousandSeparator=","
            value={labor}
            onChange={setLabor}
            error={tried ? laborProblem : null}
            size={size}
          />
          <Stack gap="xs">
            {sectionLabel(t('Usual warranty'))}
            <WorkWarrantyFields value={warranty} onChange={setWarranty} />
            {tried && warrantyProblem !== null && (
              <Text size="xs" c="red">
                {warrantyProblem}
              </Text>
            )}
          </Stack>
          <Switch
            label={t('Offer it on the repair form')}
            description={t('Turn off to hide a service you no longer do. Old jobs keep it.')}
            checked={active}
            onChange={(event) => setActive(event.currentTarget.checked)}
          />
          {failure !== null && (
            <Text size="sm" c="red" role="alert">
              {getErrorMessage(failure)}
            </Text>
          )}
          <Group justify="flex-end" mt="md" gap="sm">
            <Button variant="default" onClick={onClose} disabled={saving}>
              {t('Cancel')}
            </Button>
            <Button type="submit" color="blue" loading={saving} data-log-id="repairs.save-service">
              {service === null ? t('Add the service') : t('Save Changes')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
