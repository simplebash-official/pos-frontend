import { ServiceCatalogSection } from '@/shared/components/ticket-items/ServiceCatalogSection';
import type {
  CatalogServiceInput,
  ServiceCatalogCopy,
} from '@/shared/components/ticket-items/serviceCatalog';
import { t } from '@/shared/i18n/t';
import {
  useCreateRepairService,
  useRepairServices,
  useUpdateRepairService,
} from '../hooks/useRepairServices';
import type { SaveRepairServiceInput } from '../types';

const toInput = ({
  priceCents,
  costCents,
  ...rest
}: CatalogServiceInput): SaveRepairServiceInput => ({
  ...rest,
  laborCents: priceCents,
  laborCostCents: costCents,
});

/** The shop's ready-made repair services in Settings. */
export const RepairServicesSection = () => {
  const services = useRepairServices(true, true);
  const create = useCreateRepairService();
  const update = useUpdateRepairService();

  const copy: ServiceCatalogCopy = {
    title: t('Repair Services'),
    description: t(
      'The work you do often, with its usual fee and warranty. Add one to a repair job in one tap.'
    ),
    empty: t('No services yet. Add the repairs you do most, like a screen or battery replacement.'),
    priceLabel: t('Fee'),
    priceFieldLabel: t('Usual fee'),
    priceBelowZero: t('Fee cannot be below zero.'),
    costLabel: t('Cost to shop'),
    costFieldLabel: t('Usual cost to shop'),
    addTitle: t('Add a repair service'),
    namePlaceholder: t('e.g. Screen replacement'),
    offerLabel: t('Offer it on the repair form'),
    logId: 'repairs.save-service',
  };

  return (
    <ServiceCatalogSection
      copy={copy}
      services={services.data?.map((service) => ({
        key: service.key,
        name: service.name,
        priceCents: service.laborCents,
        costCents: service.laborCostCents,
        warranty: service.warranty,
        active: service.active,
      }))}
      loading={services.isLoading}
      actions={{
        create: (input) => create.mutateAsync(toInput(input)),
        update: (key, input) => update.mutateAsync({ key, input: toInput(input) }),
        saving: create.isPending || update.isPending,
        failure: create.error ?? update.error,
      }}
      togglingKey={update.isPending ? (update.variables?.key ?? null) : null}
    />
  );
};
