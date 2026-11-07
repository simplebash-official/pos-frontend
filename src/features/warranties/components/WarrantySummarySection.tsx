import { useState } from 'react';
import { Badge, Box, Collapse, Group, Stack, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import { IconChevronDown, IconShieldCheck } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { formatDate } from '@/shared/lib/date';
import { coverageLabel, endsOnIfStartedToday } from '../lib/warrantyView';
import type { WarrantyCoverage } from '../types';

export interface WarrantySummaryLine {
  id: string;
  name: string;
  quantity: number;
  coverage: WarrantyCoverage;
}

/**
 * Before payment, the warranties this sale gives: each covered line with how long and the end
 * date it will get today, so the cashier can say it to the customer. Hidden when nothing in the
 * cart is covered; folded by default to keep the payment panel short.
 */
export const WarrantySummarySection = ({ lines }: { lines: WarrantySummaryLine[] }) => {
  const [open, setOpen] = useState(false);
  const covered = lines.filter((line) => line.coverage.kind !== 'none');
  if (covered.length === 0) return null;

  return (
    <Box
      p="xs"
      style={{
        borderRadius: 'var(--mantine-radius-md)',
        border: '1px solid color-mix(in srgb, var(--status-ok) 28%, var(--border))',
        background: 'color-mix(in srgb, var(--status-ok) 8%, var(--bg-card))',
        transition: 'border-color 0.15s ease',
      }}
    >
      <UnstyledButton
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'block',
          borderRadius: 'var(--mantine-radius-sm)',
          padding: '2px 4px',
          transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor =
            'color-mix(in srgb, var(--status-ok) 12%, transparent)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
          <Group gap={8} wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
            <ThemeIcon
              size={22}
              radius="sm"
              variant="light"
              color="teal"
              style={{ flexShrink: 0 }}
            >
              <IconShieldCheck size={13} />
            </ThemeIcon>
            <Text
              size="xs"
              fw={700}
              tt="uppercase"
              lineClamp={1}
              style={{
                fontSize: 11,
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}
            >
              {t('Warranty on this sale')}
            </Text>
          </Group>

          <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
            <Badge
              size="xs"
              variant="light"
              color="teal"
              style={{ textTransform: 'none', fontWeight: 600 }}
            >
              {covered.length} {covered.length === 1 ? t('item covered') : t('items covered')}
            </Badge>
            <IconChevronDown
              size={14}
              style={{
                transform: open ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                color: 'var(--text-secondary)',
              }}
            />
          </Group>
        </Group>
      </UnstyledButton>

      <Collapse expanded={open}>
        <Stack gap={0} mt="xs">
          {covered.map((line) => {
            const endsOn = endsOnIfStartedToday(line.coverage);
            return (
              <Box
                key={line.id}
                py={6}
                px={4}
                style={{
                  borderTop: '1px solid color-mix(in srgb, var(--status-ok) 18%, transparent)',
                }}
              >
                <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
                  <Box style={{ minWidth: 0, flex: 1 }}>
                    <Text size="xs" fw={500} lineClamp={1} title={line.name}>
                      {line.quantity > 1 ? (
                        <Text component="span" fw={700} c="teal">
                          {line.quantity} ×{' '}
                        </Text>
                      ) : null}
                      {line.name}
                    </Text>
                    {endsOn !== null && (
                      <Text size="2xs" c="dimmed" mt={1} style={{ fontSize: 11 }}>
                        {t('until')} {formatDate(endsOn)}
                      </Text>
                    )}
                  </Box>

                  <Badge
                    size="xs"
                    variant="light"
                    color="teal"
                    style={{ flexShrink: 0, textTransform: 'none', fontWeight: 600 }}
                  >
                    {coverageLabel(line.coverage)}
                  </Badge>
                </Group>
              </Box>
            );
          })}
        </Stack>
      </Collapse>
    </Box>
  );
};
