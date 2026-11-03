import { useState } from 'react';
import {
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
  IconPlus,
  IconTool,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { IconAction } from '@/shared/components/drawer';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatMoney, toCents } from '@/shared/lib/money';
import { AnimatedNumber, FadeIn } from '@/shared/motion';
import { useRepairServices } from '../hooks/useRepairServices';
import {
  blankItem,
  itemFromService,
  partPriceCents,
  rowProblem,
  type ItemDraft,
  type LiveRepairTotals,
  type PartDraft,
} from '../lib/repairItems';
import { ItemWarrantyChip } from './ItemWarrantyChip';
import { RepairPartPicker } from './RepairPartPicker';

const sectionLabel = (text: string) => (
  <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
    {text}
  </Text>
);

const partLabel = (part: PartDraft, rework: boolean): string => {
  const what =
    part.source === 'stock'
      ? part.serialNumber === undefined
        ? part.productName
        : `${part.productName} · ${part.serialNumber}`
      : part.name;
  const price = partPriceCents(part, rework);
  return rework || price === 0 ? what : `${what} · ${formatMoney(price)}`;
};

interface RowProps {
  index: number;
  draft: ItemDraft;
  rework: boolean;
  readOnly: boolean;
  showProblem: boolean;
  onChange: (draft: ItemDraft) => void;
  onRemove: () => void;
  onEditPart: () => void;
}

const ItemRow = ({
  index,
  draft,
  rework,
  readOnly,
  showProblem,
  onChange,
  onRemove,
  onEditPart,
}: RowProps) => {
  const isMobile = useIsMobile();
  const size = isMobile ? 'md' : 'sm';
  const lineCents =
    (rework || draft.laborRupees === '' ? 0 : toCents(Number(draft.laborRupees))) +
    partPriceCents(draft.part, rework);
  const problem = showProblem ? rowProblem(draft, rework) : null;

  if (readOnly) {
    const labourCents = rework || draft.laborRupees === '' ? 0 : toCents(Number(draft.laborRupees));
    return (
      <Paper withBorder p="sm" bg="var(--bg-card)">
        <Group justify="space-between" align="flex-start" gap="sm" wrap="nowrap">
          <Group gap="xs" align="flex-start" wrap="nowrap" style={{ minWidth: 0 }}>
            <Text size="xs" fw={700} c="dimmed" mt={2} style={{ width: 18, flexShrink: 0 }}>
              {index + 1}
            </Text>
            <Stack gap={4} style={{ minWidth: 0 }}>
              <Text size="sm" fw={600}>
                {draft.description}
              </Text>
              <Text size="xs" c="dimmed">
                {`${t('Labour')} ${formatMoney(labourCents)}`}
                {draft.part === null ? '' : ` · ${partLabel(draft.part, rework)}`}
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

  return (
    <Paper withBorder p="sm" bg="var(--bg-card)">
      <Stack gap="xs">
        <Group gap="xs" wrap="nowrap" align="flex-start">
          <Text
            size="xs"
            fw={700}
            c="dimmed"
            mt={isMobile ? 12 : 8}
            style={{ width: 18, flexShrink: 0 }}
          >
            {index + 1}
          </Text>
          <TextInput
            aria-label={`${t('What is done')} ${index + 1}`}
            placeholder={t('What is done, e.g. Replace screen')}
            value={draft.description}
            onChange={(event) => onChange({ ...draft, description: event.currentTarget.value })}
            maxLength={200}
            size={size}
            style={{ flex: 1, minWidth: 0 }}
          />
          <IconAction
            kind="danger"
            label={t('Remove this work')}
            icon={<IconTrash size={16} />}
            onClick={onRemove}
          />
        </Group>
        <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="xs" pl={isMobile ? 0 : 26}>
          <NumberInput
            aria-label={`${t('Labour')} ${index + 1}`}
            label={isMobile ? t('Labour') : undefined}
            placeholder={rework ? t('Free under warranty') : t('Labour, e.g. 2500')}
            prefix="Rs. "
            min={0}
            thousandSeparator=","
            value={rework ? '' : draft.laborRupees}
            onChange={(value) => onChange({ ...draft, laborRupees: value })}
            disabled={rework}
            size={size}
          />
          {draft.part === null ? (
            <Button
              variant="light"
              leftSection={<IconPackage size={16} />}
              onClick={onEditPart}
              size={size}
              justify="flex-start"
            >
              {t('Add a part')}
            </Button>
          ) : (
            <Group
              gap={6}
              wrap="nowrap"
              px="xs"
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--mantine-radius-default)',
                minHeight: isMobile ? 42 : 36,
                minWidth: 0,
              }}
            >
              <IconPackage size={16} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
              <UnstyledButton
                onClick={onEditPart}
                style={{ flex: 1, minWidth: 0 }}
                aria-label={t('Change the part')}
              >
                <Text size="sm" truncate="end">
                  {partLabel(draft.part, rework)}
                </Text>
              </UnstyledButton>
              <UnstyledButton
                onClick={() => onChange({ ...draft, part: null })}
                aria-label={t('Remove the part')}
                style={{ display: 'inline-flex', padding: 6, flexShrink: 0 }}
              >
                <IconX size={14} />
              </UnstyledButton>
            </Group>
          )}
        </SimpleGrid>
        <Group justify="space-between" gap="xs" pl={isMobile ? 0 : 26} wrap="nowrap">
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
        {problem !== null && (
          <Text size="xs" c="red" pl={isMobile ? 0 : 26} role="alert">
            {problem}
          </Text>
        )}
      </Stack>
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
  /** The part window is open, so the job window must not close on Escape. */
  onNestedWindowChange: (open: boolean) => void;
}

/**
 * The work on a repair job: one row per piece of work, each with its labour, at most one part
 * (from stock or bought in) and its own warranty, then what the customer pays. Totals come from
 * the shared calculation; the server works them out again when the job is saved.
 */
export const RepairItemsEditor = ({
  drafts,
  onChange,
  rework,
  readOnly,
  showProblems,
  totals,
  onNestedWindowChange,
}: RepairItemsEditorProps) => {
  const services = useRepairServices(false, !readOnly);
  const [partRow, setPartRow] = useState<string | null>(null);
  const editing = drafts.find((draft) => draft.uid === partRow);

  const replace = (uid: string, next: ItemDraft) =>
    onChange(drafts.map((draft) => (draft.uid === uid ? next : draft)));
  const openPart = (uid: string) => {
    setPartRow(uid);
    onNestedWindowChange(true);
  };
  const closePart = () => {
    setPartRow(null);
    onNestedWindowChange(false);
  };

  const offered = services.data ?? [];

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="flex-end" gap="xs">
        <Box>
          {sectionLabel(t('Work and parts'))}
          <Text size="xs" c="dimmed" mt={2}>
            {drafts.length === 0
              ? t(
                  'Leave this empty until the device is checked. Add each piece of work on its own line, so each can have its own warranty.'
                )
              : t('Add each piece of work on its own line with "Add work".')}
          </Text>
        </Box>
      </Group>

      {drafts.map((draft, index) => (
        <FadeIn key={draft.uid}>
          <ItemRow
            index={index}
            draft={draft}
            rework={rework}
            readOnly={readOnly}
            showProblem={showProblems}
            onChange={(next) => replace(draft.uid, next)}
            onRemove={() => onChange(drafts.filter((row) => row.uid !== draft.uid))}
            onEditPart={() => openPart(draft.uid)}
          />
        </FadeIn>
      ))}

      {!readOnly && (
        <Group gap="xs">
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={() => onChange([...drafts, blankItem()])}
            data-log-id="repairs.add-work"
          >
            {t('Add work')}
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
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {t('Labour')}
              </Text>
              <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatMoney(totals.totals.laborCents)}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {t('Parts')}
              </Text>
              <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatMoney(totals.totals.partsCents)}
              </Text>
            </Group>
            <Divider my={4} />
            <Group justify="space-between">
              <Text fw={700}>{rework ? t('Customer pays (warranty)') : t('Customer pays')}</Text>
              <Text fw={800} size="lg">
                <AnimatedNumber value={totals.totals.priceCents} format={formatMoney} />
              </Text>
            </Group>
          </Stack>
        </Paper>
      )}

      {editing !== undefined && (
        <RepairPartPicker
          key={editing.uid}
          opened
          initial={editing.part}
          rework={rework}
          onClose={closePart}
          onPick={(part) => {
            replace(editing.uid, { ...editing, part });
            closePart();
          }}
        />
      )}
    </Stack>
  );
};
