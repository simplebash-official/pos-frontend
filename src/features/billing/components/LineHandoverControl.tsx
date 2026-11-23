import { Box, Button, Group, Text, Tooltip } from '@mantine/core';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import type { Handover } from '../types';

export interface LineHandoverControlProps {
  /** What the sale will do now (the cashier's choice, or `now` on a paid sale); `null` when unchosen. */
  value: Handover | null;
  /** The ticket number, for the buttons' screen-reader names. */
  ticketNumber: string;
  onChange: (handover: Handover) => void;
  /** The sale is done: the choice is shown but cannot change. */
  disabled: boolean;
}

const HINTS: Record<Handover, string> = {
  now: 'The customer takes it with this sale.',
  later: 'It stays in the shop until the customer collects it.',
};

/**
 * "Hand over: Now | Later" for a repair or print job on the bill. Nothing is chosen for the
 * cashier on a credit sale, and the row says so until they pick.
 */
export const LineHandoverControl = ({
  value,
  ticketNumber,
  onChange,
  disabled,
}: LineHandoverControlProps) => {
  const isMobile = useIsMobile();
  const unchosen = value === null;
  const options: { id: Handover; label: string }[] = [
    { id: 'now', label: t('Now') },
    { id: 'later', label: t('Later') },
  ];
  return (
    <Box
      px="xs"
      py={6}
      role="group"
      aria-label={`${t('Hand over')} ${ticketNumber}`}
      style={{
        borderTop: '1px solid var(--border)',
        background: unchosen ? 'var(--status-warn-bg)' : undefined,
      }}
    >
      <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
        <Box style={{ minWidth: 0 }}>
          <Text size="xs" fw={700}>
            {t('Hand over')}
          </Text>
          <Text
            size="xs"
            c={unchosen ? undefined : 'dimmed'}
            style={{ color: unchosen ? 'var(--status-warn)' : undefined, fontSize: 11 }}
          >
            {t(unchosen ? 'Choose one to continue.' : HINTS[value])}
          </Text>
        </Box>
        <Button.Group style={{ flexShrink: 0 }}>
          {options.map((option) => (
            <Tooltip key={option.id} label={t(HINTS[option.id])} disabled={isMobile}>
              <Button
                size={isMobile ? 'md' : 'compact-sm'}
                variant={value === option.id ? 'filled' : 'default'}
                aria-pressed={value === option.id}
                disabled={disabled}
                aria-label={`${option.label}: ${ticketNumber}`}
                data-log-id={`billing.handover-${option.id}`}
                onClick={() => onChange(option.id)}
                style={{ minWidth: isMobile ? 72 : 56 }}
              >
                {option.label}
              </Button>
            </Tooltip>
          ))}
        </Button.Group>
      </Group>
    </Box>
  );
};
