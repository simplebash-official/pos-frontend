import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Menu,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import {
  IconChevronDown,
  IconPackage,
  IconPencil,
  IconPlus,
  IconReceipt2,
  IconTool,
  IconTrash,
} from '@tabler/icons-react';
import { IconAction } from '@/shared/components/drawer';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatMoney, toCents } from '@/shared/lib/money';
import { AnimatedNumber, FadeIn } from '@/shared/motion';
import { useRepairServices } from '../hooks/useRepairServices';
import {
  blankFee,
  itemFromPart,
  itemFromService,
  partLabel,
  partPriceCents,
  rowProblem,
  type FeeItemDraft,
  type ItemDraft,
  type LiveRepairTotals,
  type PartItemDraft,
  type RowProblemField,
} from '../lib/repairItems';
import { ItemWarrantyChip } from './ItemWarrantyChip';
import { RepairPartPicker } from './RepairPartPicker';

const sectionLabel = (text: string) => (
  <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
    {text}
  </Text>
);

interface PartRowProps {
  index: number;
  draft: PartItemDraft;
  rework: boolean;
  readOnly: boolean;
  showProblem: boolean;
  onChange: (draft: PartItemDraft) => void;
  onRemove: () => void;
  onEditPart: () => void;
}

const PartRow = ({
  index,
  draft,
  rework,
  readOnly,
  showProblem,
  onChange,
  onRemove,
  onEditPart,
}: PartRowProps) => {
  const isMobile = useIsMobile();
  const size = isMobile ? 'md' : 'sm';
  const lineCents = partPriceCents(draft.part, rework);
  const problem = showProblem ? rowProblem(draft, rework) : null;

  if (readOnly) {
    return (
      <Paper withBorder p="sm" bg="var(--bg-card)">
        <Group justify="space-between" align="flex-start" gap="sm" wrap="nowrap">
          <Group gap="xs" align="flex-start" wrap="nowrap" style={{ minWidth: 0 }}>
            <Text size="xs" fw={700} c="dimmed" mt={2} style={{ width: 18, flexShrink: 0 }}>
              {index + 1}
            </Text>
            <Stack gap={4} style={{ minWidth: 0 }}>
              <Group gap="xs" wrap="nowrap">
                <IconPackage size={16} style={{ flexShrink: 0, color: 'var(--mantine-color-blue-6)' }} />
                <Text size="sm" fw={600} truncate="end">
                  {draft.description || partLabel(draft.part, rework)}
                </Text>
              </Group>
              <Text size="xs" c="dimmed">
                {partLabel(draft.part, rework)}
              </Text>
              {rework ? (
                <Text size="xs" c="dimmed">
                  {t('Covered by the original warranty')}
                </Text>
              ) : (
                <ItemWarrantyChip value={draft.warranty} onChange={() => undefined} readOnly />
              )}
            </Stack>
          </Group>
          <Text size="sm" fw={700} style={{ fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
            {formatMoney(lineCents)}
          </Text>
        </Group>
      </Paper>
    );
  }

  const fieldProblem = (field: RowProblemField): string | undefined =>
    problem !== null && problem.field === field ? problem.message : undefined;

  return (
    <Paper withBorder p="sm" bg="var(--bg-card)">
      <Group align="flex-start" gap="sm" wrap="nowrap">
        <Text
          size="xs"
          fw={700}
          c="dimmed"
          style={{ width: 18, flexShrink: 0, lineHeight: `${isMobile ? 42 : 36}px` }}
        >
          {index + 1}
        </Text>
        <Stack gap="sm" style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" align="center" gap="xs" wrap="nowrap">
            <Group gap="xs" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
              <IconPackage size={18} style={{ flexShrink: 0, color: 'var(--mantine-color-blue-6)' }} />
              <UnstyledButton
                onClick={onEditPart}
                style={{ flex: 1, minWidth: 0 }}
                aria-label={t('Change the part')}
              >
                <Group gap="xs" wrap="nowrap">
                  <Text size="sm" fw={600} truncate="end">
                    {draft.description || partLabel(draft.part, rework)}
                  </Text>
                  <IconPencil size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </Group>
              </UnstyledButton>
              <Badge
                size="sm"
                variant="light"
                color={draft.part.source === 'stock' ? 'blue' : 'gray'}
                style={{ flexShrink: 0 }}
              >
                {draft.part.source === 'stock'
                  ? draft.part.serialNumber
                    ? `${t('Serial:')} ${draft.part.serialNumber}`
                    : t('In stock')
                  : t('Bought in')}
              </Badge>
            </Group>
            <IconAction
              kind="danger"
              label={t('Remove this part')}
              icon={<IconTrash size={16} />}
              onClick={onRemove}
            />
          </Group>

          {draft.part.source === 'outside' && (
            <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="xs">
              <TextInput
                label={t('Part notes / description')}
                value={draft.description}
                onChange={(e) => onChange({ ...draft, description: e.currentTarget.value })}
                error={fieldProblem('description')}
                size={size}
              />
              <Box />
            </SimpleGrid>
          )}

          <Divider />
          <Group justify="space-between" align="center" gap="xs" wrap="nowrap">
            {rework ? (
              <Text size="xs" c="dimmed">
                {t('Covered by the original warranty')}
              </Text>
            ) : (
              <ItemWarrantyChip
                value={draft.warranty}
                onChange={(warranty) => onChange({ ...draft, warranty })}
                readOnly={false}
              />
            )}
            <Text size="sm" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(lineCents)}
            </Text>
          </Group>
          {problem && (
            <Text size="xs" c="red" role="alert">
              {problem.message}
            </Text>
          )}
        </Stack>
      </Group>
    </Paper>
  );
};

interface FeeRowProps {
  index: number;
  draft: FeeItemDraft;
  rework: boolean;
  readOnly: boolean;
  showProblem: boolean;
  onChange: (draft: FeeItemDraft) => void;
  onRemove: () => void;
}

const FeeRow = ({
  index,
  draft,
  rework,
  readOnly,
  showProblem,
  onChange,
  onRemove,
}: FeeRowProps) => {
  const isMobile = useIsMobile();
  const size = isMobile ? 'md' : 'sm';
  const lineCents = rework || draft.feeRupees === '' ? 0 : toCents(Number(draft.feeRupees));
  const problem = showProblem ? rowProblem(draft, rework) : null;

  if (readOnly) {
    return (
      <Paper withBorder p="sm" bg="var(--bg-card)">
        <Group justify="space-between" align="flex-start" gap="sm" wrap="nowrap">
          <Group gap="xs" align="flex-start" wrap="nowrap" style={{ minWidth: 0 }}>
            <Text size="xs" fw={700} c="dimmed" mt={2} style={{ width: 18, flexShrink: 0 }}>
              {index + 1}
            </Text>
            <Stack gap={4} style={{ minWidth: 0 }}>
              <Group gap="xs" wrap="nowrap">
                <IconReceipt2 size={16} style={{ flexShrink: 0, color: 'var(--mantine-color-teal-6)' }} />
                <Text size="sm" fw={600}>
                  {draft.description}
                </Text>
              </Group>
              {rework ? (
                <Text size="xs" c="dimmed">
                  {t('Covered by the original warranty')}
                </Text>
              ) : (
                <ItemWarrantyChip value={draft.warranty} onChange={() => undefined} readOnly />
              )}
            </Stack>
          </Group>
          <Text size="sm" fw={700} style={{ fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
            {formatMoney(lineCents)}
          </Text>
        </Group>
      </Paper>
    );
  }

  const fieldProblem = (field: RowProblemField): string | undefined =>
    problem !== null && problem.field === field ? problem.message : undefined;

  return (
    <Paper withBorder p="sm" bg="var(--bg-card)">
      <Group align="flex-start" gap="sm" wrap="nowrap">
        <Text
          size="xs"
          fw={700}
          c="dimmed"
          style={{ width: 18, flexShrink: 0, lineHeight: `${isMobile ? 42 : 36}px` }}
        >
          {index + 1}
        </Text>
        <Stack gap="sm" style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" wrap="nowrap" align="flex-start">
            <TextInput
              aria-label={`${t('Fee description')} ${index + 1}`}
              placeholder={t('Fee description, e.g. Diagnostic fee, Software, Cleaning...')}
              value={draft.description}
              onChange={(event) => onChange({ ...draft, description: event.currentTarget.value })}
              error={fieldProblem('description')}
              maxLength={200}
              size={size}
              style={{ flex: 1, minWidth: 0 }}
            />
            <Box style={{ height: isMobile ? 42 : 36, display: 'flex', alignItems: 'center' }}>
              <IconAction
                kind="danger"
                label={t('Remove this fee')}
                icon={<IconTrash size={16} />}
                onClick={onRemove}
              />
            </Box>
          </Group>

          <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="xs">
            <NumberInput
              label={t('Fee (Rs.)')}
              aria-label={`${t('Fee')} ${index + 1}`}
              placeholder={rework ? t('Free under warranty') : t('e.g. 1500')}
              prefix="Rs. "
              min={0}
              thousandSeparator=","
              value={rework ? '' : draft.feeRupees}
              onChange={(value) => onChange({ ...draft, feeRupees: value })}
              error={fieldProblem('fee')}
              disabled={rework}
              size={size}
            />
            <Box />
          </SimpleGrid>

          <Divider />
          <Group justify="space-between" align="center" gap="xs" wrap="nowrap">
            {rework ? (
              <Text size="xs" c="dimmed">
                {t('Covered by the original warranty')}
              </Text>
            ) : (
              <ItemWarrantyChip
                value={draft.warranty}
                onChange={(warranty) => onChange({ ...draft, warranty })}
                readOnly={false}
              />
            )}
            <Text size="sm" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(lineCents)}
            </Text>
          </Group>
          {problem && (
            <Text size="xs" c="red" role="alert">
              {problem.message}
            </Text>
          )}
        </Stack>
      </Group>
    </Paper>
  );
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
  onNestedWindowChange: (open: boolean) => void;
}

/**
 * The parts and other fees on a repair job:
 * - Parts: taken from stock or bought in for the job, with their own warranty.
 * - Other Fees: service, diagnostic, or workmanship fees, with their own warranty.
 */
export const RepairItemsEditor = ({
  drafts,
  onChange,
  rework,
  readOnly,
  showProblems,
  totals,
  profit,
  onNestedWindowChange,
}: RepairItemsEditorProps) => {
  const services = useRepairServices(false, !readOnly);
  const [partTarget, setPartTarget] = useState<string | 'new' | null>(null);
  const editing = drafts.find((draft) => draft.uid === partTarget);

  const replace = (uid: string, next: ItemDraft) =>
    onChange(drafts.map((draft) => (draft.uid === uid ? next : draft)));

  const openNewPart = () => {
    setPartTarget('new');
    onNestedWindowChange(true);
  };

  const openPart = (uid: string) => {
    setPartTarget(uid);
    onNestedWindowChange(true);
  };

  const closePart = () => {
    setPartTarget(null);
    onNestedWindowChange(false);
  };

  const offered = services.data ?? [];

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="flex-end" gap="xs">
        <Box>
          {sectionLabel(t('Parts and Other Fees'))}
          <Text size="xs" c="dimmed" mt={2}>
            {drafts.length === 0
              ? t(
                  'Leave this empty until the device is checked. Add parts from stock and any additional fees or service charges.'
                )
              : t('Parts used and any additional service fees on this job.')}
          </Text>
        </Box>
      </Group>

      {drafts.map((draft, index) => (
        <FadeIn key={draft.uid}>
          {draft.kind === 'part' ? (
            <PartRow
              index={index}
              draft={draft}
              rework={rework}
              readOnly={readOnly}
              showProblem={showProblems}
              onChange={(next) => replace(draft.uid, next)}
              onRemove={() => onChange(drafts.filter((row) => row.uid !== draft.uid))}
              onEditPart={() => openPart(draft.uid)}
            />
          ) : (
            <FeeRow
              index={index}
              draft={draft}
              rework={rework}
              readOnly={readOnly}
              showProblem={showProblems}
              onChange={(next) => replace(draft.uid, next)}
              onRemove={() => onChange(drafts.filter((row) => row.uid !== draft.uid))}
            />
          )}
        </FadeIn>
      ))}

      {!readOnly && (
        <Group gap="xs" wrap="wrap">
          <Button
            variant="light"
            color="blue"
            leftSection={<IconPackage size={16} />}
            onClick={openNewPart}
            data-log-id="repairs.add-part-from-stock"
          >
            {t('Add part from stock')}
          </Button>
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={() => onChange([...drafts, blankFee()])}
            data-log-id="repairs.add-fee"
          >
            {t('Add other fee')}
          </Button>
          {offered.length > 0 && (
            <Menu position="bottom-start" withinPortal shadow="md">
              <Menu.Target>
                <Button
                  variant="default"
                  leftSection={<IconTool size={16} />}
                  rightSection={<IconChevronDown size={14} />}
                >
                  {t('Add a service')}
                </Button>
              </Menu.Target>
              <Menu.Dropdown style={{ maxWidth: 'calc(100vw - 32px)' }}>
                {offered.map((service) => (
                  <Menu.Item
                    key={service.key}
                    onClick={() => onChange([...drafts, itemFromService(service, rework)])}
                  >
                    <Group justify="space-between" gap="md" wrap="nowrap">
                      <Text size="sm" truncate="end">
                        {service.name}
                      </Text>
                      {!rework && (
                        <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                          {formatMoney(service.laborCents)}
                        </Text>
                      )}
                    </Group>
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      )}

      {drafts.length > 0 && totals !== null && (
        <Paper withBorder p="sm" bg="var(--bg-app)">
          <Stack gap={4}>
            {totals.totals.partsCents > 0 && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {t('Parts')}
                </Text>
                <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatMoney(totals.totals.partsCents)}
                </Text>
              </Group>
            )}
            {totals.totals.laborCents > 0 && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {t('Other fees')}
                </Text>
                <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatMoney(totals.totals.laborCents)}
                </Text>
              </Group>
            )}
            <Divider my={4} />
            <Group justify="space-between">
              <Text fw={700}>{rework ? t('Customer pays (warranty)') : t('Customer pays')}</Text>
              <Text fw={800} size="lg">
                <AnimatedNumber value={totals.totals.priceCents} format={formatMoney} />
              </Text>
            </Group>
            {!rework && profit !== undefined && (
              <Group justify="space-between" mt={4}>
                <Text size="xs" c="dimmed">
                  {t('Estimated Repair Net Profit:')}
                </Text>
                <Text
                  size="xs"
                  fw={700}
                  c={profit.priced ? 'teal.7' : 'dimmed'}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {profit.priced ? formatMoney(profit.profitCents) : profit.hint}
                </Text>
              </Group>
            )}
          </Stack>
        </Paper>
      )}

      {partTarget !== null && (
        <RepairPartPicker
          key={partTarget}
          opened
          initial={editing && editing.kind === 'part' ? editing.part : null}
          rework={rework}
          onClose={closePart}
          onPick={(part, warranty) => {
            if (partTarget === 'new') {
              onChange([...drafts, itemFromPart(part, warranty, rework)]);
            } else if (editing !== undefined && editing.kind === 'part') {
              const autoDesc =
                editing.description.trim() === '' ||
                editing.description === (editing.part.source === 'stock' ? editing.part.productName : editing.part.name)
                  ? part.source === 'stock'
                    ? part.productName
                    : part.name
                  : editing.description;
              const autoWarranty =
                !rework && editing.warranty.coverage.kind === 'none' && warranty
                  ? warranty
                  : editing.warranty;
              replace(editing.uid, {
                ...editing,
                description: autoDesc,
                part,
                warranty: autoWarranty,
              });
            }
            closePart();
          }}
        />
      )}
    </Stack>
  );
};
