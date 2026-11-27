import { useState } from 'react';
import { Button, Group, Modal, NumberInput, Stack, Switch, Text, TextInput } from '@mantine/core';
import { profileProblem } from '@/features/warranties';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { getErrorMessage } from '@/shared/lib/error';
import { fromCents, toCents } from '@/shared/lib/money';
import { costBoxValue, typedCostCents } from './costToShop';
import type { CatalogService, ServiceCatalogActions, ServiceCatalogCopy } from './serviceCatalog';
import { cleanWarranty, NO_COVER } from './warranty';
import { WorkWarrantyFields } from './WorkWarrantyFields';

const sectionLabel = (text: string) => (
  <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
    {text}
  </Text>
);

export interface ServiceFormModalProps {
  /** The service to edit, or `null` to add one. */
  service: CatalogService | null;
  copy: ServiceCatalogCopy;
  actions: ServiceCatalogActions;
  onClose: () => void;
}

/** Adds or changes one of the shop's ready-made services. */
export const ServiceFormModal = ({ service, copy, actions, onClose }: ServiceFormModalProps) => {
  const isMobile = useIsMobile();
  const [name, setName] = useState(service === null ? '' : service.name);
  const [price, setPrice] = useState<number | string>(
    service === null ? '' : fromCents(service.priceCents)
  );
  const [cost, setCost] = useState<number | string>(
    service === null ? '' : costBoxValue(service.costCents)
  );
  const [warranty, setWarranty] = useState(service === null ? NO_COVER : service.warranty);
  const [active, setActive] = useState(service === null ? true : service.active);
  const [tried, setTried] = useState(false);

  const nameProblem = name.trim() === '' ? t('Give the service a name.') : null;
  const priceProblem = price !== '' && Number(price) < 0 ? copy.priceBelowZero : null;
  const costProblem = cost !== '' && Number(cost) < 0 ? t('A cost cannot be below zero.') : null;
  const warrantyProblem = profileProblem(warranty);

  const save = async () => {
    setTried(true);
    const problems = [nameProblem, priceProblem, costProblem, warrantyProblem];
    if (problems.some((problem) => problem !== null)) return;
    const input = {
      name: name.trim(),
      // An empty box is a service with no usual charge: it is typed on the job.
      priceCents: price === '' ? 0 : toCents(Number(price)),
      costCents: typedCostCents(cost),
      warranty: cleanWarranty(warranty),
      active,
    };
    try {
      if (service === null) {
        await actions.create(input);
      } else {
        await actions.update(service.key, input);
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
          {service === null ? copy.addTitle : `${t('Edit:')} ${service.name}`}
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
            placeholder={copy.namePlaceholder}
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            error={tried ? nameProblem : null}
            maxLength={80}
            size={size}
            data-autofocus={isMobile ? undefined : true}
          />
          <NumberInput
            label={copy.priceFieldLabel}
            description={t(
              'Filled in when the service is added to a job; you can change it there.'
            )}
            placeholder="0"
            prefix="Rs. "
            min={0}
            thousandSeparator=","
            value={price}
            onChange={setPrice}
            error={tried ? priceProblem : null}
            size={size}
          />
          <NumberInput
            label={copy.costFieldLabel}
            description={t('Optional. Filled in on the job; you can change it there.')}
            placeholder={t('Optional')}
            prefix="Rs. "
            min={0}
            thousandSeparator=","
            value={cost}
            onChange={setCost}
            error={tried ? costProblem : null}
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
            label={copy.offerLabel}
            description={t('Turn off to hide a service you no longer do. Old jobs keep it.')}
            checked={active}
            onChange={(event) => setActive(event.currentTarget.checked)}
          />
          {actions.failure !== null && (
            <Text size="sm" c="red" role="alert">
              {getErrorMessage(actions.failure)}
            </Text>
          )}
          <Group justify="flex-end" mt="md" gap="sm">
            <Button variant="default" onClick={onClose} disabled={actions.saving}>
              {t('Cancel')}
            </Button>
            <Button type="submit" color="blue" loading={actions.saving} data-log-id={copy.logId}>
              {service === null ? t('Add the service') : t('Save Changes')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
