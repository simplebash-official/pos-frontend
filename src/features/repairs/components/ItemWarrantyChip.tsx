import { useState } from 'react';
import { Badge, Button, Group, Popover, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconShieldCheck, IconShieldOff } from '@tabler/icons-react';
import { coverageLabel, profileProblem, type ProductWarranty } from '@/features/warranties';
import { t } from '@/shared/i18n/t';
import { cleanWarranty } from '../lib/repairItems';
import { WorkWarrantyFields } from './WorkWarrantyFields';

export interface ItemWarrantyChipProps {
  value: ProductWarranty;
  onChange: (warranty: ProductWarranty) => void;
  /** A finished job or a warranty rework shows the tag only. */
  readOnly: boolean;
}

/**
 * The warranty tag on one piece of repair work ("3 months", "No warranty"). Tapping it opens a
 * small editor: how long, who gives it, and what it covers.
 */
export const ItemWarrantyChip = ({ value, onChange, readOnly }: ItemWarrantyChipProps) => {
  const [opened, setOpened] = useState(false);
  const [draft, setDraft] = useState<ProductWarranty>(value);
  const covered = value.coverage.kind !== 'none';
  const problem = profileProblem(draft);

  const tag = (
    <Badge
      size="sm"
      variant="light"
      color={covered ? 'teal' : 'gray'}
      leftSection={covered ? <IconShieldCheck size={12} /> : <IconShieldOff size={12} />}
      style={{ textTransform: 'none', flexShrink: 0, cursor: readOnly ? 'default' : 'pointer' }}
    >
      {coverageLabel(value.coverage)}
    </Badge>
  );
  if (readOnly) return tag;

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-start"
      withArrow
      shadow="md"
      trapFocus
    >
      <Popover.Target>
        <UnstyledButton
          onClick={() => {
            setDraft(value);
            setOpened((open) => !open);
          }}
          aria-label={t('Change the warranty for this work')}
          style={{ display: 'inline-flex', alignItems: 'center', minHeight: 32, flexShrink: 0 }}
        >
          {tag}
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown style={{ width: 'min(340px, calc(100vw - 32px))' }}>
        <Stack gap="sm">
          <Text size="sm" fw={700}>
            {t('Warranty for this work')}
          </Text>
          <WorkWarrantyFields value={draft} onChange={setDraft} />
          {problem !== null && (
            <Text size="xs" c="red">
              {problem}
            </Text>
          )}
          <Group justify="flex-end" gap="xs">
            <Button variant="default" size="xs" onClick={() => setOpened(false)}>
              {t('Cancel')}
            </Button>
            <Button
              size="xs"
              disabled={problem !== null}
              onClick={() => {
                onChange(cleanWarranty(draft));
                setOpened(false);
              }}
            >
              {t('Apply')}
            </Button>
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};
