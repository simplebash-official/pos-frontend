import { ServiceCatalogSection } from '@/shared/components/ticket-items/ServiceCatalogSection';
import type {
  CatalogServiceInput,
  ServiceCatalogCopy,
} from '@/shared/components/ticket-items/serviceCatalog';
import { t } from '@/shared/i18n/t';
import {
  useCreatePrintService,
  usePrintServices,
  useUpdatePrintService,
} from '../hooks/usePrintServices';
import type { SavePrintServiceInput } from '../types';

const fromCatalog = ({ priceCents, ...rest }: CatalogServiceInput): SavePrintServiceInput => ({
  ...rest,
  unitPriceCents: priceCents,
});

/** The shop's ready-made print services in Settings. */
export const PrintServicesSection = () => {
  const services = usePrintServices(true, true);
  const create = useCreatePrintService();
  const update = useUpdatePrintService();

  const copy: ServiceCatalogCopy = {
    title: t('Print Services'),
    description: t(
      'The print work you do often, with its price for one and warranty. Add one to a print job in one tap.'
    ),
    empty: t('No services yet. Add the work you do most, like design or mug printing.'),
    priceLabel: t('Price for one'),
    priceFieldLabel: t('Usual price for one'),
    priceBelowZero: t('A price cannot be below zero.'),
    addTitle: t('Add a print service'),
    namePlaceholder: t('e.g. Mug printing'),
    offerLabel: t('Offer it on the print job form'),
    logId: 'print-jobs.save-service',
  };

  return (
    <ServiceCatalogSection
      copy={copy}
      services={services.data?.map((service) => ({
        key: service.key,
        name: service.name,
        priceCents: service.unitPriceCents,
        warranty: service.warranty,
        active: service.active,
      }))}
      loading={services.isLoading}
      actions={{
        create: (input) => create.mutateAsync(fromCatalog(input)),
        update: (key, input) => update.mutateAsync({ key, input: fromCatalog(input) }),
        saving: create.isPending || update.isPending,
        failure: create.error === null ? update.error : create.error,
      }}
      togglingKey={update.isPending && update.variables !== undefined ? update.variables.key : null}
    />
  );
};
