import { useState } from 'react';
import { Button, Group, Popover, Stack, Text } from '@mantine/core';
import { IconShieldCheck, IconShieldOff } from '@tabler/icons-react';
import { coverageLabel, profileProblem, type ProductWarranty } from '@/features/warranties';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { cleanWarranty } from '../lib/repairItems';
import { ItemActionButton } from './ItemActionButton';
import { WorkWarrantyFields } from './WorkWarrantyFields';

export interface ItemWarrantyButtonProps {
  value: ProductWarranty;
  onChange: (warranty: ProductWarranty) => void;
  /** A finished job shows the warranty only. */
  readOnly: boolean;
}

/**
 * The warranty button on one piece of repair work ("3 months", "No warranty"). Tapping it opens a
 * small editor: how long, who gives it, and what it covers.
 */
export const ItemWarrantyButton = ({ value, onChange, readOnly }: ItemWarrantyButtonProps) => {
  const isMobile = useIsMobile();
  const [opened, setOpened] = useState(false);
  const [draft, setDraft] = useState<ProductWarranty>(value);
  const covered = value.coverage.kind !== 'none';
  const problem = profileProblem(draft);

  const face = (onClick?: () => void) => (
    <ItemActionButton
      label={t('Warranty')}
      value={coverageLabel(value.coverage)}
      icon={covered ? <IconShieldCheck size={14} /> : <IconShieldOff size={14} />}
      tone={covered ? 'teal' : 'none'}
      readOnly={readOnly}
      onClick={onClick}
      aria-label={t('Change the warranty for this work')}
    />
  );
  if (readOnly) return face();

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
        <div>
          {face(() => {
            setDraft(value);
            setOpened((open) => !open);
          })}
        </div>
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
            <Button
              variant="default"
              size={isMobile ? 'md' : 'sm'}
              onClick={() => setOpened(false)}
            >
              {t('Cancel')}
            </Button>
            <Button
              size={isMobile ? 'md' : 'sm'}
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
