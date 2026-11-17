import { useMemo, useRef, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Loader,
  NumberInput,
  Paper,
  Popover,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import {
  IconPackage,
  IconPlus,
  IconScan,
  IconSearch,
  IconShoppingBag,
  IconTool,
  IconTrash,
} from '@tabler/icons-react';
import { fetchSerialByNumber } from '@/features/inventory/api/productsApi';
import { useAllProducts } from '@/features/inventory/hooks/useProducts';
import type { Product } from '@/features/inventory/types';
import type { ProductWarranty } from '@/features/warranties';
import { AnimatedNumber } from '@/shared/motion';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatMoney, fromCents, toCents } from '@/shared/lib/money';
import { useRepairServices } from '../hooks/useRepairServices';
import {
  calculateOutsideProfit,
  calculatePartsProfitCents,
  DEFAULT_QUICK_FEES,
  type FeeItemDraft,
  type ItemDraft,
  type LiveRepairTotals,
  type PartDraft,
  type PartItemDraft,
} from '../lib/repairItems';
import { ItemWarrantyChip } from './ItemWarrantyChip';

const NO_COVER: ProductWarranty = { coverage: { kind: 'none' } };

let nextUid = 1000;
const genUid = () => {
  nextUid += 1;
  return `item-${nextUid}-${Date.now()}`;
};

export interface RepairItemsEditorProps {
  drafts: ItemDraft[];
  onChange: (drafts: ItemDraft[]) => void;
  rework: boolean;
  /** A handed-back job's work no longer changes. */
  readOnly: boolean;
  /** Show each row's problem (after a save was tried). */
  showProblems: boolean;
  totals: LiveRepairTotals | null;
  profit?: {
    priced: boolean;
    profitCents: number;
    hint: string | null;
  };
  /** The part window is open, so the job window must not close on Escape. */
  onNestedWindowChange?: (open: boolean) => void;
}

export const RepairItemsEditor = ({
  drafts,
  onChange,
  rework,
  readOnly,
  totals,
  profit,
}: RepairItemsEditorProps) => {
  const isMobile = useIsMobile();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const [scanning, setScanning] = useState(false);

  const services = useRepairServices(false, !readOnly);
  const products = useAllProducts({ enabled: !readOnly });

  const inStockProducts = useMemo(() => {
    return products.data.filter((candidate) =>
      candidate.isSerialized ? candidate.stockQuantity > 0 : candidate.priceTiers.length > 0
    );
  }, [products.data]);

  const filteredInStock = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return inStockProducts.slice(0, 6);
    return inStockProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [inStockProducts, searchQuery]);

  const handleSelectStockProduct = (product: Product) => {
    const defaultTier = product.priceTiers[0];
    const priceCents = defaultTier ? defaultTier.sellingPriceCents : 0;
    const costCents = defaultTier?.minUnitCostCents ?? null;

    const partDraft: PartDraft = {
      source: 'stock',
      productKey: product.key,
      productName: product.name,
      sku: product.sku,
      stockQuantity: product.stockQuantity,
      sellingPriceCents: priceCents,
      priceCents,
      costCents,
    };

    const newRow: PartItemDraft = {
      uid: genUid(),
      kind: 'part',
      description: product.name,
      part: partDraft,
      warranty: rework ? NO_COVER : (product.warranty ?? NO_COVER),
    };

    onChange([...drafts, newRow]);
    setSearchQuery('');
    setDropdownOpened(false);
  };

  const handleAddOutsidePart = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newRow: PartItemDraft = {
      uid: genUid(),
      kind: 'part',
      description: trimmed,
      part: {
        source: 'outside',
        name: trimmed,
        priceRupees: '',
        costRupees: '',
      },
      warranty: NO_COVER,
    };
    onChange([...drafts, newRow]);
    setSearchQuery('');
    setDropdownOpened(false);
  };

  const handleAddFee = (name: string, defaultCents = 0, warranty = NO_COVER) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newRow: FeeItemDraft = {
      uid: genUid(),
      kind: 'fee',
      description: trimmed,
      feeRupees: defaultCents > 0 ? fromCents(defaultCents) : '',
      warranty: rework ? NO_COVER : warranty,
    };
    onChange([...drafts, newRow]);
    setSearchQuery('');
    setDropdownOpened(false);
  };

  const handleScanOrSubmit = async (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    // 1. Direct SKU/barcode/name match in inventory
    const directMatch = inStockProducts.find(
      (p) =>
        p.barcode === text ||
        (p.sku && p.sku.toLowerCase() === text.toLowerCase()) ||
        p.name.toLowerCase() === text.toLowerCase()
    );
    if (directMatch) {
      handleSelectStockProduct(directMatch);
      return;
    }

    // 2. Look up as a serial number
    setScanning(true);
    try {
      const found = await fetchSerialByNumber(text);
      const partDraft: PartDraft = {
        source: 'stock',
        productKey: found.product.key,
        productName: found.product.name,
        serialNumber: found.serial.serialNumber,
        sku: found.product.sku,
        stockQuantity: found.product.stockQuantity,
        sellingPriceCents: found.sellingPriceCents,
        priceCents: found.sellingPriceCents,
        costCents: null,
      };
      const newRow: PartItemDraft = {
        uid: genUid(),
        kind: 'part',
        description: found.product.name,
        part: partDraft,
        warranty: rework ? NO_COVER : (found.product.warranty ?? NO_COVER),
      };
      onChange([...drafts, newRow]);
      setSearchQuery('');
      setDropdownOpened(false);
      return;
    } catch {
      // Not a serial; add as service fee
      handleAddFee(text);
    } finally {
      setScanning(false);
    }
  };

  const updateDraftWarranty = (uid: string, warranty: ProductWarranty) => {
    onChange(drafts.map((d) => (d.uid === uid ? { ...d, warranty } : d)));
  };

  const updateStockPartPrice = (uid: string, value: number | string) => {
    onChange(
      drafts.map((d) => {
        if (d.uid !== uid || d.kind !== 'part' || d.part.source !== 'stock') return d;
        const priceCents = value === '' ? 0 : toCents(Number(value));
        return {
          ...d,
          part: {
            ...d.part,
            priceCents,
            sellingPriceCents: priceCents,
          },
        };
      })
    );
  };

  const updateOutsidePart = (
    uid: string,
    field: 'priceRupees' | 'costRupees',
    value: number | string
  ) => {
    onChange(
      drafts.map((d) => {
        if (d.uid !== uid || d.kind !== 'part' || d.part.source !== 'outside') return d;
        return {
          ...d,
          part: {
            ...d.part,
            [field]: value,
          },
        };
      })
    );
  };

  const updateFeeRupees = (uid: string, feeRupees: number | string) => {
    onChange(
      drafts.map((d) => {
        if (d.uid !== uid || d.kind !== 'fee') return d;
        return { ...d, feeRupees };
      })
    );
  };

  const removeDraft = (uid: string) => {
    onChange(drafts.filter((d) => d.uid !== uid));
  };

  const partsProfitCents = useMemo(() => calculatePartsProfitCents(drafts), [drafts]);

  return (
    <Paper withBorder p="md" bg="var(--bg-card)" radius="md">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="center" wrap="nowrap">
          <Box>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
              {t('PARTS AND OTHER FEES')}
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              {t('Leave this empty until the device is checked.')}
            </Text>
          </Box>
          <Badge variant="light" color="gray" radius="xl" size="sm">
            {drafts.length} {drafts.length === 1 ? t('item') : t('items')}
          </Badge>
        </Group>

        {/* Universal Search & Barcode Input */}
        {!readOnly && (
          <Box style={{ position: 'relative' }}>
            <Popover
              opened={dropdownOpened}
              onChange={setDropdownOpened}
              position="bottom-start"
              width="target"
              shadow="lg"
              withinPortal={false}
              radius="md"
            >
              <Popover.Target>
                <TextInput
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.currentTarget.value);
                    setDropdownOpened(true);
                  }}
                  onFocus={() => setDropdownOpened(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void handleScanOrSubmit(searchQuery);
                    }
                  }}
                  placeholder={t('Scan barcode, search stock, or type a part or fee name')}
                  leftSection={<IconSearch size={16} />}
                  rightSection={scanning ? <Loader size="xs" /> : <IconScan size={16} />}
                  data-barcode-scanner="true"
                  size="md"
                  radius="md"
                />
              </Popover.Target>

              <Popover.Dropdown
                p="xs"
                bg="light-dark(var(--bg-card), var(--mantine-color-dark-7))"
                style={{
                  maxHeight: 380,
                  overflowY: 'auto',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--mantine-shadow-lg)',
                }}
              >
                <Stack gap={4}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="xs" py={4}>
                    {t('IN STOCK')}
                  </Text>

                  {filteredInStock.length === 0 ? (
                    <Text size="xs" c="dimmed" px="xs" py={4}>
                      {t('No in-stock item matches.')}
                    </Text>
                  ) : (
                    filteredInStock.map((prod) => {
                      const tierPrice = prod.priceTiers[0]?.sellingPriceCents ?? 0;
                      return (
                        <UnstyledButton
                          key={prod.key}
                          onClick={() => handleSelectStockProduct(prod)}
                          p="xs"
                          style={{
                            borderRadius: 'var(--mantine-radius-sm)',
                            transition: 'background-color 150ms ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <Group justify="space-between" wrap="nowrap" gap="sm">
                            <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                              <ThemeIcon
                                size={32}
                                radius="md"
                                variant="light"
                                color="blue"
                                style={{ flexShrink: 0 }}
                              >
                                <IconPackage size={16} />
                              </ThemeIcon>
                              <Stack gap={0} style={{ minWidth: 0 }}>
                                <Text size="sm" fw={600} truncate="end">
                                  {prod.name}
                                </Text>
                                <Text size="xs" c="dimmed" truncate="end">
                                  {prod.sku || prod.barcode} · {prod.stockQuantity} {t('in stock')}
                                </Text>
                              </Stack>
                            </Group>
                            <Text size="sm" fw={600} style={{ fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                              {formatMoney(tierPrice)}
                            </Text>
                          </Group>
                        </UnstyledButton>
                      );
                    })
                  )}

                  <Divider my={4} />
                  <Text size="xs" c="dimmed" ta="center" py={4}>
                    {t('Keep typing to add something that is not in stock.')}
                  </Text>

                  {searchQuery.trim() !== '' && (
                    <Group gap="xs" grow>
                      <Button
                        variant="light"
                        color="grape"
                        size="xs"
                        leftSection={<IconTool size={14} />}
                        onClick={() => handleAddFee(searchQuery)}
                      >
                        {t('Add as Service fee')}
                      </Button>
                      <Button
                        variant="light"
                        color="yellow"
                        size="xs"
                        leftSection={<IconShoppingBag size={14} />}
                        onClick={() => handleAddOutsidePart(searchQuery)}
                      >
                        {t('Add as Outside part')}
                      </Button>
                    </Group>
                  )}
                </Stack>
              </Popover.Dropdown>
            </Popover>

            {/* Quick Fees Row */}
            <Group gap="xs" align="center" mt="xs" wrap="wrap">
              <Text size="xs" c="dimmed" fw={500}>
                {t('Quick fees')}
              </Text>
              {DEFAULT_QUICK_FEES.map((feeName) => (
                <Button
                  key={feeName}
                  variant="default"
                  size="xs"
                  radius="xl"
                  leftSection={<IconPlus size={12} />}
                  onClick={() => handleAddFee(feeName)}
                >
                  {t(feeName)}
                </Button>
              ))}
              {(services.data ?? []).map((svc) => (
                <Button
                  key={svc.key}
                  variant="default"
                  size="xs"
                  radius="xl"
                  leftSection={<IconPlus size={12} />}
                  onClick={() => handleAddFee(svc.name, svc.laborCents, svc.warranty)}
                >
                  {svc.name}
                </Button>
              ))}
            </Group>
          </Box>
        )}

        {/* Table Container */}
        {drafts.length > 0 && (
          <Paper
            withBorder
            radius="md"
            p={0}
            bg="light-dark(var(--bg-card), var(--mantine-color-dark-8))"
            style={{
              overflow: 'hidden',
              borderColor: 'var(--border)',
            }}
          >
            {/* Table Header */}
            <Group
              justify="space-between"
              align="center"
              px="md"
              py="xs"
              wrap="nowrap"
              bg="light-dark(var(--bg-app), rgba(255, 255, 255, 0.02))"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ flex: 1, letterSpacing: '0.05em' }}>
                {t('ITEM')}
              </Text>
              <Text
                size="xs"
                fw={700}
                c="dimmed"
                tt="uppercase"
                style={{ width: isMobile ? 110 : 140, textAlign: 'center', letterSpacing: '0.05em' }}
              >
                {t('WARRANTY')}
              </Text>
              <Text
                size="xs"
                fw={700}
                c="dimmed"
                tt="uppercase"
                style={{ width: isMobile ? 150 : 210, textAlign: 'right', letterSpacing: '0.05em' }}
              >
                {t('CUSTOMER PAYS')}
              </Text>
            </Group>

            {/* Table Rows */}
            <Box>
              {drafts.map((draft, index) => {
                const rowBorder = '1px solid var(--border)';

                if (draft.kind === 'part') {
                  const part = draft.part;
                  if (part.source === 'stock') {
                    const lineRupees = part.priceCents / 100;
                    return (
                      <Box
                        key={draft.uid}
                        px="md"
                        py="sm"
                        style={{
                          borderBottom: rowBorder,
                          transition: 'background-color 150ms ease',
                        }}
                      >
                        <Group justify="space-between" align="center" wrap="nowrap" gap="sm">
                          {/* Item Info Column */}
                          <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                            <ThemeIcon
                              size={36}
                              radius="md"
                              variant="light"
                              color="blue"
                              style={{ flexShrink: 0 }}
                            >
                              <IconPackage size={18} />
                            </ThemeIcon>
                            <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
                              <Text size="sm" fw={600} truncate="end">
                                {draft.description}
                              </Text>
                              <Text size="xs" c="dimmed" truncate="end">
                                {part.serialNumber
                                  ? `${t('Serial:')} ${part.serialNumber}`
                                  : `${t('From stock ·')} ${part.stockQuantity !== undefined ? part.stockQuantity : ''} ${t('left')}`}
                              </Text>
                            </Stack>
                          </Group>

                          {/* Warranty Column */}
                          <Box style={{ width: isMobile ? 110 : 140, display: 'flex', justifyContent: 'center' }}>
                            {rework ? (
                              <Badge size="sm" variant="light" color="gray" radius="xl" style={{ textTransform: 'none' }}>
                                {t('Covered by the original warranty')}
                              </Badge>
                            ) : (
                              <ItemWarrantyChip
                                value={draft.warranty}
                                onChange={(w) => updateDraftWarranty(draft.uid, w)}
                                readOnly={readOnly}
                              />
                            )}
                          </Box>

                          {/* Customer Pays Column */}
                          <Group
                            gap="xs"
                            justify="flex-end"
                            wrap="nowrap"
                            style={{ width: isMobile ? 150 : 210 }}
                          >
                            <NumberInput
                              size="sm"
                              w={isMobile ? 115 : 165}
                              prefix="Rs. "
                              min={0}
                              thousandSeparator=","
                              styles={{ input: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' } }}
                              value={rework ? 0 : lineRupees}
                              onChange={(val) => updateStockPartPrice(draft.uid, val)}
                              disabled={rework || readOnly}
                            />
                            {!readOnly && (
                              <ActionIcon
                                color="gray"
                                variant="subtle"
                                size="sm"
                                onClick={() => removeDraft(draft.uid)}
                                aria-label={`${t('Remove')} ${draft.description}`}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            )}
                          </Group>
                        </Group>
                      </Box>
                    );
                  }

                  // Outside Part
                  const lineRupees = Number(part.priceRupees || 0);
                  return (
                    <Box
                      key={draft.uid}
                      px="md"
                      py="sm"
                      style={{
                        borderBottom: rowBorder,
                        transition: 'background-color 150ms ease',
                      }}
                    >
                      <Group justify="space-between" align="center" wrap="nowrap" gap="sm">
                        {/* Item Info Column */}
                        <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                          <ThemeIcon
                            size={36}
                            radius="md"
                            variant="light"
                            color="yellow"
                            style={{ flexShrink: 0 }}
                          >
                            <IconShoppingBag size={18} />
                          </ThemeIcon>
                          <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
                            <Text size="sm" fw={600} truncate="end">
                              {draft.description}
                            </Text>
                            <Group gap="xs" align="center" wrap="nowrap">
                              <Text size="xs" c="dimmed">
                                {t('Cost to shop')}
                              </Text>
                              <NumberInput
                                size="xs"
                                w={95}
                                placeholder="0"
                                min={0}
                                value={part.costRupees}
                                onChange={(val) => updateOutsidePart(draft.uid, 'costRupees', val)}
                                disabled={readOnly}
                              />
                              {(() => {
                                const p = calculateOutsideProfit(
                                  part.priceRupees,
                                  part.costRupees
                                );
                                if (p === null) return null;
                                return (
                                  <Text size="xs" fw={700} c={p >= 0 ? 'teal' : 'red'}>
                                    {t('Profit Rs.')} {p.toLocaleString()}
                                  </Text>
                                );
                              })()}
                            </Group>
                          </Stack>
                        </Group>

                        {/* Warranty Column */}
                        <Box style={{ width: isMobile ? 110 : 140, display: 'flex', justifyContent: 'center' }}>
                          {rework ? (
                            <Badge size="sm" variant="light" color="gray" radius="xl" style={{ textTransform: 'none' }}>
                              {t('Covered by the original warranty')}
                            </Badge>
                          ) : (
                            <ItemWarrantyChip
                              value={draft.warranty}
                              onChange={(w) => updateDraftWarranty(draft.uid, w)}
                              readOnly={readOnly}
                            />
                          )}
                        </Box>

                        {/* Customer Pays Column */}
                        <Group
                          gap="xs"
                          justify="flex-end"
                          wrap="nowrap"
                          style={{ width: isMobile ? 150 : 210 }}
                        >
                          <NumberInput
                            size="sm"
                            w={isMobile ? 115 : 165}
                            prefix="Rs. "
                            min={0}
                            thousandSeparator=","
                            styles={{ input: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' } }}
                            value={rework ? 0 : lineRupees}
                            onChange={(val) => updateOutsidePart(draft.uid, 'priceRupees', val)}
                            disabled={rework || readOnly}
                          />
                          {!readOnly && (
                            <ActionIcon
                              color="gray"
                              variant="subtle"
                              size="sm"
                              onClick={() => removeDraft(draft.uid)}
                              aria-label={`${t('Remove')} ${draft.description}`}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          )}
                        </Group>
                      </Group>
                    </Box>
                  );
                }

                // Fee Row
                return (
                  <Box
                    key={draft.uid}
                    px="md"
                    py="sm"
                    style={{
                      borderBottom: rowBorder,
                      transition: 'background-color 150ms ease',
                    }}
                  >
                    <Group justify="space-between" align="center" wrap="nowrap" gap="sm">
                      {/* Item Info Column */}
                      <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                        <ThemeIcon
                          size={36}
                          radius="md"
                          variant="light"
                          color="grape"
                          style={{ flexShrink: 0 }}
                        >
                          <IconTool size={18} />
                        </ThemeIcon>
                        <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
                          <Text size="sm" fw={600} truncate="end">
                            {draft.description}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {t('Service fee')}
                          </Text>
                        </Stack>
                      </Group>

                      {/* Warranty Column */}
                      <Box style={{ width: isMobile ? 110 : 140, display: 'flex', justifyContent: 'center' }}>
                        {rework ? (
                          <Badge size="sm" variant="light" color="gray" radius="xl" style={{ textTransform: 'none' }}>
                            {t('Covered by the original warranty')}
                          </Badge>
                        ) : (
                          <ItemWarrantyChip
                            value={draft.warranty}
                            onChange={(w) => updateDraftWarranty(draft.uid, w)}
                            readOnly={readOnly}
                          />
                        )}
                      </Box>

                      {/* Customer Pays Column */}
                      <Group
                        gap="xs"
                        justify="flex-end"
                        wrap="nowrap"
                        style={{ width: isMobile ? 150 : 210 }}
                      >
                        <NumberInput
                          size="sm"
                          w={isMobile ? 115 : 165}
                          aria-label={`${t('Fee')} ${index + 1}`}
                          prefix="Rs. "
                          min={0}
                          thousandSeparator=","
                          styles={{ input: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' } }}
                          value={rework ? 0 : draft.feeRupees}
                          onChange={(val) => updateFeeRupees(draft.uid, val)}
                          disabled={rework || readOnly}
                        />
                        {!readOnly && (
                          <ActionIcon
                            color="gray"
                            variant="subtle"
                            size="sm"
                            onClick={() => removeDraft(draft.uid)}
                            aria-label={`${t('Remove')} ${draft.description}`}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        )}
                      </Group>
                    </Group>
                  </Box>
                );
              })}
            </Box>

            {/* Footer / Summary */}
            {totals !== null && (
              <Box
                px="md"
                py="md"
                bg="light-dark(var(--bg-app), rgba(255, 255, 255, 0.02))"
              >
                <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
                  {/* Left Column: Profit on parts */}
                  <Stack gap={2}>
                    {!rework && (
                      <>
                        <Text size="sm" fw={700} c="teal">
                          {t('Profit on parts:')}{' '}
                          {partsProfitCents !== null
                            ? formatMoney(partsProfitCents)
                            : (profit?.hint ?? '—')}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {t('Only you see this. The customer’s bill shows prices only.')}
                        </Text>
                      </>
                    )}
                  </Stack>

                  {/* Right Column: Breakdown & Total */}
                  <Stack gap={4} align="flex-end" style={{ minWidth: isMobile ? '100%' : 220 }}>
                    <Group justify="space-between" w="100%">
                      <Text size="sm" c="dimmed">
                        {t('Parts')}
                      </Text>
                      <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatMoney(totals.totals.partsCents)}
                      </Text>
                    </Group>

                    <Group justify="space-between" w="100%">
                      <Text size="sm" c="dimmed">
                        {t('Service fees')}
                      </Text>
                      <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatMoney(totals.totals.laborCents)}
                      </Text>
                    </Group>

                    <Divider my={4} w="100%" />

                    <Group justify="space-between" w="100%">
                      <Text size="md" fw={700}>
                        {rework ? t('Total (warranty)') : t('Total')}
                      </Text>
                      <Text size="xl" fw={800} style={{ fontVariantNumeric: 'tabular-nums' }}>
                        <AnimatedNumber value={totals.totals.priceCents} format={formatMoney} />
                      </Text>
                    </Group>
                  </Stack>
                </Group>
              </Box>
            )}
          </Paper>
        )}
      </Stack>
    </Paper>
  );
};
