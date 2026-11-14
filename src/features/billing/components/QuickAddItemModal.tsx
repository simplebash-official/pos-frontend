import { useEffect, useState } from 'react';
import {
  Anchor,
  Box,
  Button,
  Collapse,
  Grid,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconBarcode } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { t } from '@/shared/i18n/t';
import { formatMoney, toCents } from '@/shared/lib/money';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useHasPermission, useIsAdmin } from '@/shared/hooks/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { CURRENCY } from '@/constants';
import type { ApiError } from '@/shared/types/common';
import { useCategories } from '@/features/inventory/hooks/useCategories';
import type { Product } from '@/features/inventory/types';
import {
  marginOf,
  validateDraft,
  type QuickAddCategory,
  type QuickAddDraft,
  type QuickAddErrors,
  type QuickAddSeed,
  type QuickAddSubcategory,
} from '@/features/inventory/lib/quickAddItem';
import { ProductWarrantyFields, coverageLabel } from '@/features/warranties';
import type { ProductWarranty } from '@/features/warranties';
import type { ChargeLine } from '../lib/quickAddCharge';
import { useQuickAddItem } from '../hooks/useQuickAddItem';
import { QuickAddCategoryFields } from './QuickAddCategoryFields';
import { QuickAddChargeForm } from './QuickAddChargeForm';

const sectionLabelStyle = { letterSpacing: '0.05em' } as const;

const NO_WARRANTY: ProductWarranty = { coverage: { kind: 'none' } };

/** Whole-number rupee amount, or the empty string while the box is empty. */
const asAmount = (value: number | string): number | '' => (typeof value === 'number' ? value : '');

export interface QuickAddItemModalProps {
  opened: boolean;
  onClose: () => void;
  /** What the scan bar held, so the barcode or name is already filled in. */
  seed: QuickAddSeed;
  /** Called with the saved item, before the window closes, to put it in the cart. */
  onCreated: (product: Product) => void;
  /** Called with a one-time charge, before the window closes, to put it in the cart. */
  onChargeAdded: (charge: ChargeLine) => void;
}

/** What is being added: a new stock item, or a one-time charge with nothing to track. */
type AddMode = 'item' | 'charge';

/** The name and price typed so far, kept while the person switches between the two modes. */
interface Basics {
  name: string;
  price: number | '';
}

interface ContentProps {
  onClose: () => void;
  seed: QuickAddSeed;
  onCreated: (product: Product) => void;
  initialPrice: number | '';
  onBasics: (basics: Basics) => void;
  isMobile: boolean;
}

const QuickAddItemContent = ({
  onClose,
  seed,
  onCreated,
  initialPrice,
  onBasics,
  isMobile,
}: ContentProps) => {
  const isAdmin = useIsAdmin();
  const { data: categoryList } = useCategories();
  const { save, isSaving } = useQuickAddItem();

  const [draft, setDraft] = useState<QuickAddDraft>({
    name: seed.name,
    barcodeMode: seed.barcodeMode,
    barcode: seed.barcode,
    category: null,
    subcategory: null,
    quantity: '',
    costPrice: '',
    sellingPrice: initialPrice,
    warranty: NO_WARRANTY,
  });
  const [errors, setErrors] = useState<QuickAddErrors>({});

  useEffect(() => {
    onBasics({ name: draft.name, price: draft.sellingPrice });
  }, [draft.name, draft.sellingPrice, onBasics]);
  const [warrantyOpen, setWarrantyOpen] = useState(false);
  // A new item takes its category's warranty until the person changes it themselves.
  const [warrantyTouched, setWarrantyTouched] = useState(false);

  const patch = (changes: Partial<QuickAddDraft>, cleared: (keyof QuickAddErrors)[] = []) => {
    setDraft((prev) => ({ ...prev, ...changes }));
    if (cleared.length > 0) {
      setErrors((prev) => {
        const next = { ...prev };
        cleared.forEach((field) => delete next[field]);
        return next;
      });
    }
  };

  const categoryTemplate = (() => {
    if (draft.category === null || draft.category.kind !== 'existing') return undefined;
    const key = draft.category.key;
    const found = categoryList.find((c) => c.key === key);
    return found === undefined || found.warrantyTemplate === undefined
      ? undefined
      : { categoryName: found.name, warranty: found.warrantyTemplate };
  })();

  const changeCategory = (
    category: QuickAddCategory | null,
    subcategory: QuickAddSubcategory | null
  ) => {
    const changes: Partial<QuickAddDraft> = { category, subcategory };
    if (!warrantyTouched && category !== null && category.kind === 'existing') {
      const key = category.key;
      const template = categoryList.find((c) => c.key === key)?.warrantyTemplate;
      changes.warranty = template === undefined ? NO_WARRANTY : template;
    }
    patch(changes, ['category', 'subcategory']);
  };

  const margin = marginOf(draft.costPrice, draft.sellingPrice);

  const showApiError = (err: unknown) => {
    const apiError = err as ApiError;
    if (apiError.code === 'BARCODE_ALREADY_EXISTS' || apiError.statusCode === 409) {
      if (draft.barcodeMode === 'enter' && apiError.code !== 'CATEGORY_ALREADY_EXISTS') {
        setErrors((prev) => ({ ...prev, barcode: apiError.message }));
        return;
      }
    }
    if (apiError.code === 'CATEGORY_ALREADY_EXISTS') {
      setErrors((prev) => ({ ...prev, category: apiError.message }));
      return;
    }
    if (apiError.code === 'SUBCATEGORY_ALREADY_EXISTS') {
      setErrors((prev) => ({ ...prev, subcategory: apiError.message }));
      return;
    }
    notifications.show({
      title: t('Could not save the item'),
      message: apiError.message,
      color: 'red',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateDraft(draft);
    setErrors(found);
    if (found.warranty !== undefined) setWarrantyOpen(true);
    if (Object.keys(found).length > 0) return;

    try {
      const product = await save(draft, ({ category, subcategory }) =>
        // Keep the category that now exists, so a retry after a failed save does not make it again.
        setDraft((prev) => ({ ...prev, category, subcategory }))
      );
      onCreated(product);
      onClose();
    } catch (err: unknown) {
      showApiError(err);
    }
  };

  const nameIsEmpty = draft.name.trim() === '';

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate>
      <Stack gap="lg">
        <Stack gap="sm">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={sectionLabelStyle}>
            {t('The item')}
          </Text>
          <TextInput
            label={t('Item name')}
            placeholder={t('For example: Phone case, blue')}
            value={draft.name}
            onChange={(e) => patch({ name: e.currentTarget.value }, ['name'])}
            error={errors.name}
            disabled={isSaving}
            required
            data-autofocus={!isMobile && nameIsEmpty ? true : undefined}
          />
          <Stack gap={6}>
            <SegmentedToggle
              fullWidth
              value={draft.barcodeMode}
              onChange={(value) =>
                patch({ barcodeMode: value === 'enter' ? 'enter' : 'generate' }, ['barcode'])
              }
              data={[
                { value: 'enter', label: t('I have a barcode') },
                { value: 'generate', label: t('Make one for me') },
              ]}
              disabled={isSaving}
              aria-label={t('Barcode')}
            />
            {draft.barcodeMode === 'enter' ? (
              <TextInput
                aria-label={t('Barcode')}
                placeholder={t('Scan it, or type the numbers')}
                value={draft.barcode}
                onChange={(e) => patch({ barcode: e.currentTarget.value }, ['barcode'])}
                error={errors.barcode}
                disabled={isSaving}
                inputMode="numeric"
                leftSection={<IconBarcode size={16} />}
              />
            ) : (
              <Text size="xs" c="dimmed">
                {t('A scannable shop barcode is made when you save.')}
              </Text>
            )}
          </Stack>
        </Stack>

        <QuickAddCategoryFields
          category={draft.category}
          subcategory={draft.subcategory}
          onChange={changeCategory}
          errors={{ category: errors.category, subcategory: errors.subcategory }}
          canCreate={isAdmin}
          disabled={isSaving}
        />

        <Stack gap="sm">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={sectionLabelStyle}>
            {t('How many, and the prices')}
          </Text>
          <Grid gap="xs" align="flex-start">
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput
                label={t('How many do you have?')}
                placeholder="0"
                min={1}
                allowDecimal={false}
                value={draft.quantity}
                onChange={(value) => patch({ quantity: asAmount(value) }, ['quantity'])}
                error={errors.quantity}
                disabled={isSaving}
                inputMode="numeric"
                required
                data-autofocus={!isMobile && !nameIsEmpty ? true : undefined}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 4 }}>
              <NumberInput
                label={t('Cost price each')}
                placeholder="0.00"
                min={0}
                decimalScale={2}
                value={draft.costPrice}
                onChange={(value) => patch({ costPrice: asAmount(value) }, ['costPrice'])}
                error={errors.costPrice}
                disabled={isSaving}
                inputMode="decimal"
                leftSection={
                  <Text size="xs" fw={700} c="dimmed">
                    {CURRENCY.symbol}
                  </Text>
                }
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 4 }}>
              <NumberInput
                label={t('Selling price each')}
                placeholder="0.00"
                min={0.01}
                decimalScale={2}
                value={draft.sellingPrice}
                onChange={(value) => patch({ sellingPrice: asAmount(value) }, ['sellingPrice'])}
                error={errors.sellingPrice}
                disabled={isSaving}
                inputMode="decimal"
                leftSection={
                  <Text size="xs" fw={700} c="dimmed">
                    {CURRENCY.symbol}
                  </Text>
                }
                required
              />
            </Grid.Col>
          </Grid>
          <Box aria-live="polite" mih={20}>
            {margin !== null && (
              <Text
                size="sm"
                fw={600}
                c={margin.profit >= 0 ? 'teal' : 'red'}
                data-testid="quick-add-margin"
              >
                {margin.profit >= 0
                  ? `${t('You earn')} ${formatMoney(toCents(margin.profit))} ${t('on each one')} · ${margin.marginPct.toFixed(1)}%`
                  : `${t('You lose')} ${formatMoney(toCents(-margin.profit))} ${t('on each one. The selling price is below the cost.')}`}
              </Text>
            )}
          </Box>
        </Stack>

        <Stack gap="xs">
          <Group justify="space-between" align="center" wrap="nowrap">
            <Text size="sm">
              <Text span fw={600}>
                {t('Warranty')}:
              </Text>{' '}
              {coverageLabel(draft.warranty.coverage)}
            </Text>
            <Anchor
              component="button"
              type="button"
              size="sm"
              onClick={() => setWarrantyOpen((open) => !open)}
              aria-expanded={warrantyOpen}
            >
              {warrantyOpen ? t('Done') : t('Change')}
            </Anchor>
          </Group>
          {errors.warranty !== undefined && !warrantyOpen && (
            <Text size="xs" c="red">
              {errors.warranty}
            </Text>
          )}
          <Collapse expanded={warrantyOpen}>
            <ProductWarrantyFields
              value={draft.warranty}
              onChange={(warranty) => {
                setWarrantyTouched(true);
                patch({ warranty }, ['warranty']);
              }}
              categoryTemplate={categoryTemplate}
              error={errors.warranty ?? null}
              disabled={isSaving}
            />
          </Collapse>
        </Stack>

        <Group
          justify="flex-end"
          gap="sm"
          style={
            isMobile
              ? {
                  position: 'sticky',
                  bottom: 0,
                  background: 'var(--mantine-color-body)',
                  paddingBlock: 'var(--mantine-spacing-sm)',
                  borderTop: '1px solid var(--border)',
                }
              : undefined
          }
        >
          <Button variant="default" onClick={onClose} disabled={isSaving}>
            {t('Cancel')}
          </Button>
          <Button
            type="submit"
            color="blue"
            loading={isSaving}
            data-log-id="billing.quick-add-save"
            size={isMobile ? 'md' : 'sm'}
          >
            {t('Save and add to cart')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export const QuickAddItemModal = ({
  opened,
  onClose,
  seed,
  onCreated,
  onChargeAdded,
}: QuickAddItemModalProps) => {
  const isMobile = useIsMobile();
  const canAddItem = useHasPermission(PERMISSIONS.INVENTORY_WRITE);
  const canAddCharge = useHasPermission(PERMISSIONS.BILLING_WRITE);
  // A scanned barcode means a real product, so a stock item is the way in whenever it is allowed.
  const [mode, setMode] = useState<AddMode>(canAddItem ? 'item' : 'charge');
  const [basics, setBasics] = useState<Basics>({ name: seed.name, price: '' });

  const canSwitch = canAddItem && canAddCharge;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {mode === 'item' ? t('Add a New Item') : t('Add a One-time Charge')}
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
    >
      {opened && (
        <Stack gap="md">
          {canSwitch && (
            <Stack gap={6}>
              <SegmentedToggle
                fullWidth
                value={mode}
                onChange={(value) => setMode(value === 'charge' ? 'charge' : 'item')}
                data={[
                  { value: 'item', label: t('Stock item') },
                  { value: 'charge', label: t('One-time charge') },
                ]}
                aria-label={t('What are you adding?')}
              />
              <Text size="xs" c="dimmed">
                {mode === 'item'
                  ? t('Something you keep in stock and sell again.')
                  : t('Not tracked in stock. For services and one-off fees.')}
              </Text>
            </Stack>
          )}
          {mode === 'item' ? (
            <QuickAddItemContent
              // A fresh form for every opening and every switch, so nothing stale comes back.
              key={`item|${seed.barcode}|${seed.barcodeMode}`}
              onClose={onClose}
              seed={{ ...seed, name: basics.name }}
              initialPrice={basics.price}
              onBasics={setBasics}
              onCreated={onCreated}
              isMobile={isMobile}
            />
          ) : (
            <QuickAddChargeForm
              key="charge"
              initialName={basics.name}
              initialPrice={basics.price}
              onBasics={setBasics}
              onClose={onClose}
              onAdd={(charge) => {
                onChargeAdded(charge);
                onClose();
              }}
              isMobile={isMobile}
            />
          )}
        </Stack>
      )}
    </Modal>
  );
};
