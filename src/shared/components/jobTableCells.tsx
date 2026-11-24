import type { CSSProperties, ReactNode } from 'react';
import { ActionIcon, Box, Group, Stack, Text, Tooltip } from '@mantine/core';
import { IconPrinter, IconShieldCheck } from '@tabler/icons-react';
import { JOB_STATUS_COLORS } from '@/constants';
import type { JobStatus } from '@/constants';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatDate } from '@/shared/lib/date';
import { getJobDueMeta, isJobFinished } from '@/shared/lib/jobDueDate';
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
  /** For the dot's colour and the due date; the words come from `label`. */
  status: JobStatus;
  /** The status in words, already translated: a print job's "In Production" is a repair's "In Repair". */
  label: string;
  promisedReadyAt?: string;
  /** The invoice that billed the job. While the job is still open it is shown under the status. */
  billedInvoiceNumber?: string;
}

/**
 * A coloured dot and the status in words. While the job is open the due date sits under it, and a
 * date that is near or past turns into "Due today", "Due soon" or "Overdue" in colour. From Ready
 * on there is no due line.
 */
export const StatusCell = ({
  status,
  label,
  promisedReadyAt,
  billedInvoiceNumber,
}: StatusCellProps) => {
  const billedAndOpen = billedInvoiceNumber !== undefined && status !== 'delivered';
  const due = promisedReadyAt ? getJobDueMeta({ promisedReadyAt, status }) : null;
  const dueLine = promisedReadyAt
    ? due
      ? `${due.label} · ${formatDate(promisedReadyAt)}`
      : `${t('Due')} ${formatDate(promisedReadyAt)}`
    : t('No due date');
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
          {label}
        </Text>
      </Group>
      {!isJobFinished(status) && (
        <Text
          size="xs"
          c={due ? due.color : 'dimmed'}
          fw={due ? 600 : 400}
          style={{ ...TABULAR, paddingLeft: 16 }}
        >
          {dueLine}
        </Text>
      )}
      {billedAndOpen && (
        <Text size="xs" c="teal" fw={600} style={{ ...TABULAR, paddingLeft: 16 }}>
          {t('Billed on')} {billedInvoiceNumber}
        </Text>
      )}
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

/** The quiet job-slip icon at the end of a row. */
export const JobSlipAction = ({ onClick }: { onClick: () => void }) => {
  const isMobile = useIsMobile();
  return (
    <Tooltip label={t('Job slip')}>
      <ActionIcon
        variant="subtle"
        color="gray"
        size={isMobile ? 44 : 32}
        aria-label={t('Job slip')}
        onClick={onClick}
      >
        <IconPrinter size={18} />
      </ActionIcon>
    </Tooltip>
  );
};
