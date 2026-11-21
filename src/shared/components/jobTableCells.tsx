import type { CSSProperties, ReactNode } from 'react';
import { ActionIcon, Box, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconPrinter, IconShieldCheck } from '@tabler/icons-react';
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS } from '@/constants';
import type { JobStatus } from '@/constants';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatDate } from '@/shared/lib/date';
import { getJobDueMeta } from '@/shared/lib/jobDueDate';
import { formatMoney } from '@/shared/lib/money';
import type { SearchTerm } from '@/shared/lib/search';
import { SearchHighlight } from './SearchHighlight';

/** Cells shared by the repair and print job tables: a strong first line, a dimmed second line. */

const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const;

/**
 * For a column that takes the space left over: `contain: inline-size` stops the text's length
 * from widening the table, so long text is cut with an ellipsis instead of pushing columns off
 * screen. The column's `width` share decides how wide it gets.
 */
const flexible = (minWidth: number): CSSProperties => ({
  contain: 'inline-size',
  width: '100%',
  minWidth,
});

interface TwoLineProps {
  primary: ReactNode;
  secondary?: ReactNode;
  /** The full text, shown on hover when a line is cut. */
  title: string;
}

/** A strong line over a dimmed one, each kept to a single line. */
export const TwoLineCell = ({ primary, secondary, title }: TwoLineProps) => (
  <Stack gap={2} style={flexible(100)} title={title}>
    <Text size="sm" fw={600} truncate>
      {primary}
    </Text>
    {secondary !== undefined && (
      <Text size="xs" c="dimmed" truncate component="div">
        {secondary}
      </Text>
    )}
  </Stack>
);

interface TicketCellProps {
  ticketNumber: string;
  createdAt: string;
  /** Ticket number of the job this one reworks under warranty. */
  reworkOf?: string;
  terms: readonly SearchTerm[];
}

export const TicketCell = ({ ticketNumber, createdAt, reworkOf, terms }: TicketCellProps) => (
  <Stack gap={2} style={{ whiteSpace: 'nowrap' }}>
    <Text size="sm" fw={700} style={TABULAR}>
      <SearchHighlight text={ticketNumber} terms={terms} />
    </Text>
    {reworkOf === undefined ? (
      <Text size="xs" c="dimmed" style={TABULAR}>
        {formatDate(createdAt)}
      </Text>
    ) : (
      <Group gap={4} wrap="nowrap">
        <IconShieldCheck size={12} style={{ color: 'var(--status-busy)', flexShrink: 0 }} />
        <Text size="xs" c="dimmed">
          {t('Rework of')} {reworkOf}
        </Text>
      </Group>
    )}
  </Stack>
);

interface CustomerCellProps {
  name: string;
  phone: string;
  terms: readonly SearchTerm[];
}

export const CustomerCell = ({ name, phone, terms }: CustomerCellProps) => (
  <TwoLineCell
    title={phone === '' ? name : `${name} · ${phone}`}
    primary={<SearchHighlight text={name} terms={terms} />}
    secondary={phone === '' ? undefined : <SearchHighlight text={phone} terms={terms} />}
  />
);

interface TechnicianCellProps {
  name?: string;
  earnedCents?: number;
}

export const TechnicianCell = ({ name, earnedCents }: TechnicianCellProps) => {
  if (!name) {
    return (
      <Text size="sm" c="dimmed">
        {t('Unassigned')}
      </Text>
    );
  }
  return (
    <Stack gap={0} style={flexible(100)} title={name}>
      <Text size="sm" fw={500} truncate>
        {name}
      </Text>
      {earnedCents ? (
        <Text size="xs" c="dimmed" truncate style={TABULAR}>
          {t('Earned')} {formatMoney(earnedCents)}
        </Text>
      ) : null}
    </Stack>
  );
};

interface StatusCellProps {
  status: JobStatus;
  promisedReadyAt?: string;
}

/**
 * A coloured dot and the status in words, with the due date under it on every row so rows line
 * up. While the job is open, a date that is near or past turns into "Due today", "Due soon" or
 * "Overdue" in colour.
 */
export const StatusCell = ({ status, promisedReadyAt }: StatusCellProps) => {
  const due = promisedReadyAt ? getJobDueMeta({ promisedReadyAt, status }) : null;
  let dueLine = t('No due date');
  if (promisedReadyAt) {
    dueLine = due
      ? `${due.label} · ${formatDate(promisedReadyAt)}`
      : `${t('Due')} ${formatDate(promisedReadyAt)}`;
  }
  return (
    <Stack gap={2} style={{ whiteSpace: 'nowrap' }}>
      <Group gap={8} wrap="nowrap">
        <Box
          w={8}
          h={8}
          bg={`${JOB_STATUS_COLORS[status]}.6`}
          style={{ borderRadius: '50%', flexShrink: 0 }}
        />
        <Text size="sm" fw={600}>
          {t(JOB_STATUS_LABELS[status])}
        </Text>
      </Group>
      <Text
        size="xs"
        c={due ? due.color : 'dimmed'}
        fw={due ? 600 : 400}
        style={{ ...TABULAR, paddingLeft: 16 }}
      >
        {dueLine}
      </Text>
    </Stack>
  );
};

type AmountCellProps = { cents: number } | { note: string };

/** A right-aligned amount, or a dash with a short dimmed reason under it ("Pending diagnosis"). */
export const AmountCell = (props: AmountCellProps) =>
  'cents' in props ? (
    <Text size="sm" fw={600} style={{ ...TABULAR, whiteSpace: 'nowrap' }}>
      {formatMoney(props.cents)}
    </Text>
  ) : (
    <Stack gap={2} align="flex-end" style={{ whiteSpace: 'nowrap' }}>
      <Text size="sm" c="dimmed">
        —
      </Text>
      <Text size="xs" c="dimmed">
        {props.note}
      </Text>
    </Stack>
  );

/** Buttons in a clickable row: a click here must not also open the row. */
export const RowActions = ({ children }: { children: ReactNode }) => (
  <Group gap={6} wrap="nowrap" justify="flex-end" onClick={(event) => event.stopPropagation()}>
    {children}
  </Group>
);

/** The quiet print-receipt icon at the end of a row. */
export const ReceiptAction = ({ onClick }: { onClick: () => void }) => {
  const isMobile = useIsMobile();
  return (
    <Tooltip label={t('Print receipt')}>
      <ActionIcon
        variant="subtle"
        color="gray"
        size={isMobile ? 44 : 32}
        aria-label={t('Print receipt')}
        onClick={onClick}
      >
        <IconPrinter size={18} />
      </ActionIcon>
    </Tooltip>
  );
};
