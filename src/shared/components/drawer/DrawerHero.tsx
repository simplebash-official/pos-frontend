import type { ReactNode } from 'react';
import { Box, Group, Paper, Text, ThemeIcon } from '@mantine/core';

/** A filled, softly glowing icon tile in a theme colour. */
export const IconTile = ({
  color,
  size,
  children,
}: {
  color: string;
  size: number;
  children: ReactNode;
}) => (
  <ThemeIcon
    size={size}
    variant="filled"
    color={color}
    radius="var(--mantine-radius-default)"
    style={{ boxShadow: `0 6px 16px -6px var(--mantine-color-${color}-filled)`, flexShrink: 0 }}
  >
    {children}
  </ThemeIcon>
);

export interface DrawerHeroProps {
  /** Theme colour name; tints the card and the icon tile. */
  accent: string;
  icon: ReactNode;
  /** A small id line above the title, set in monospace (a SKU, an invoice number). */
  eyebrow?: string;
  /** Status as a coloured dot and word, not a badge. */
  status?: { color: string; label: string };
  title: string;
  /** Lines under the title: a category path, a contact, a date. */
  subtitle?: ReactNode;
  /** Extra rows inside the card, separated by a rule (a barcode, a notice). */
  children?: ReactNode;
}

/** Who or what this drawer is about: a tinted card with the icon tile, id, status and title. */
export const DrawerHero = ({
  accent,
  icon,
  eyebrow,
  status,
  title,
  subtitle,
  children,
}: DrawerHeroProps) => (
  <Paper
    p="md"
    shadow="xs"
    style={{
      background: `linear-gradient(135deg, var(--mantine-color-${accent}-light) 0%, var(--bg-card) 70%)`,
    }}
  >
    <Group align="flex-start" wrap="nowrap" gap="md">
      <IconTile color={accent} size={60}>
        {icon}
      </IconTile>

      <Box style={{ flex: 1, minWidth: 0 }}>
        {(eyebrow !== undefined || status !== undefined) && (
          <Group justify="space-between" wrap="nowrap" gap="xs" mb={4}>
            <Text size="xs" fw={600} c="dimmed" ff="monospace" style={{ letterSpacing: '0.04em' }}>
              {eyebrow}
            </Text>
            {status !== undefined && (
              <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
                <Box
                  w={8}
                  h={8}
                  style={{
                    borderRadius: '50%',
                    background: `var(--mantine-color-${status.color}-filled)`,
                  }}
                />
                <Text
                  size="xs"
                  fw={700}
                  c={status.color}
                  tt="uppercase"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {status.label}
                </Text>
              </Group>
            )}
          </Group>
        )}

        <Text fw={800} size="xl" lh={1.2} style={{ wordBreak: 'break-word' }}>
          {title}
        </Text>

        {subtitle !== undefined && (
          <Text component="div" size="sm" c="dimmed" mt={6}>
            {subtitle}
          </Text>
        )}
      </Box>
    </Group>

    {children !== undefined && (
      <Box mt="md" pt="sm" style={{ borderTop: '1px solid var(--border)' }}>
        {children}
      </Box>
    )}
  </Paper>
);
