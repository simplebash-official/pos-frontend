import { useMemo, useState } from 'react';
import { Badge, Button, Checkbox, Group, Paper, Stack, Text, TextInput } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { SearchCombobox } from '@/shared/components/SearchCombobox';
import { getErrorMessage } from '@/shared/lib/error';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { useCreateCashCategory, useSimilarCashCategories } from '../../../hooks/useCashLookups';
import type { CashCategory, CashMovementType } from '../../../types';
import { ChoiceCard, ChoiceGroup } from './ChoiceCard';

/** How many of the shop's most used categories get a one-tap chip. */
const CHIP_COUNT = 5;
const NAME_MIN = 2;
const NAME_MAX = 40;

export interface CategoryChoice {
  categoryKey: string | null;
  /** Set only when the shop chose to use a new name once instead of saving it. */
  customLabel: string;
}

export interface CategoryPickerProps {
  movementType: CashMovementType;
  /** The type's categories, best first, as the server ranks them. */
  categories: CashCategory[];
  loading: boolean;
  value: CategoryChoice;
  onChange: (choice: CategoryChoice) => void;
  /** Whether this person may add a category for this kind of payment. */
  canCreate: boolean;
  /** Called after a category is chosen by creating it, so the form can move on to the amount. */
  onCreated: () => void;
  error?: string | null;
}

/**
 * Picks what a cash movement is for. The shop's five most used categories are one tap; "More"
 * opens the full searchable list, whose pinned footer adds a new category on the spot. A new
 * name is confirmed inline: warned when it looks like an existing one, and either saved for
 * next time or used just this once (filed under the kind's "Other" with the name as a label).
 */
export const CategoryPicker = ({
  movementType,
  categories,
  loading,
  value,
  onChange,
  canCreate,
  onCreated,
  error,
}: CategoryPickerProps) => {
  const isMobile = useIsMobile();
  const [showMore, setShowMore] = useState(false);
  const [draftName, setDraftName] = useState<string | null>(null);
  const [saveForFuture, setSaveForFuture] = useState(true);
  const [draftError, setDraftError] = useState<string | null>(null);
  const createCategory = useCreateCashCategory();

  const trimmed = (draftName ?? '').trim();
  const similar = useSimilarCashCategories(movementType, draftName === null ? '' : trimmed);
  const other = categories.find((c) => c.isSystem && c.name === 'Other');

  const chips = useMemo(() => {
    const top = categories.slice(0, CHIP_COUNT);
    const chosen = categories.find((c) => c.key === value.categoryKey);
    return chosen && !top.some((c) => c.key === chosen.key) ? [...top, chosen] : top;
  }, [categories, value.categoryKey]);

  const select = (key: string) => {
    onChange({ categoryKey: key, customLabel: '' });
    setShowMore(false);
  };

  const openDraft = (typed: string) => {
    setDraftName(typed);
    setSaveForFuture(true);
    setDraftError(null);
  };

  const closeDraft = () => {
    setDraftName(null);
    setDraftError(null);
  };

  const saveDraft = async () => {
    if (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX) {
      setDraftError(t('A category name needs 2 to 40 letters.'));
      return;
    }
    if (!saveForFuture && other) {
      onChange({ categoryKey: other.key, customLabel: trimmed });
      closeDraft();
      setShowMore(false);
      return;
    }
    try {
      const created = await createCategory.mutateAsync({ movementType, name: trimmed });
      onChange({ categoryKey: created.key, customLabel: '' });
      closeDraft();
      setShowMore(false);
      onCreated();
    } catch (err) {
      setDraftError(getErrorMessage(err));
    }
  };

  return (
    <Stack gap="xs">
      <ChoiceGroup label={t('Pick one')}>
        <Group gap="xs" data-testid="category-chips">
          {chips.map((c) => {
            const selected = c.key === value.categoryKey;
            const label =
              selected && value.customLabel ? `${c.name}: ${value.customLabel}` : c.name;
            return (
              <div key={c.key} style={{ flex: isMobile ? '1 1 100%' : '0 1 auto' }}>
                <ChoiceCard
                  label={label}
                  selected={selected}
                  allowed
                  tall={isMobile}
                  onSelect={() => select(c.key)}
                  trailing={
                    c.reviewStatus === 'needs_review' ? (
                      <Badge size="xs" variant="light" ml={6}>
                        {t('New')}
                      </Badge>
                    ) : undefined
                  }
                />
              </div>
            );
          })}
          <button
            type="button"
            className="choice-card choice-more"
            style={{ width: isMobile ? '100%' : 'auto', minHeight: isMobile ? 56 : 44 }}
            onClick={() => setShowMore((open) => !open)}
            aria-expanded={showMore}
          >
            <IconPlus size={16} aria-hidden />
            <Text size="sm" fw={600} component="span">
              {t('More')}
            </Text>
          </button>
        </Group>
      </ChoiceGroup>

      {showMore && draftName === null && (
        <SearchCombobox
          label={t('Find a category')}
          placeholder={t('Type to search')}
          loading={loading}
          items={categories.map((c) => ({
            value: c.key,
            label: c.name,
            searchText: c.nameSi,
          }))}
          value={value.categoryKey}
          onChange={(key) => key && select(key)}
          create={
            canCreate
              ? {
                  labelFor: (typed) => `${t('+ Create')} "${typed}" ${t('as a new category')}`,
                  emptyLabel: t('+ Create a new category'),
                  onCreate: openDraft,
                }
              : undefined
          }
          noCreateHint={canCreate ? undefined : t('To add a new one, ask a manager.')}
          emptyText={t('No category matches. You can add it below.')}
          autoFocus={!isMobile}
        />
      )}

      {draftName !== null && (
        <Paper withBorder p="sm" data-testid="new-category-confirm">
          <Stack gap="sm">
            <TextInput
              label={t('Name of the new category')}
              value={draftName}
              onChange={(e) => {
                setDraftName(e.currentTarget.value);
                setDraftError(null);
              }}
              maxLength={NAME_MAX}
              error={draftError}
              autoFocus={!isMobile}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void saveDraft();
                }
              }}
            />

            {(similar.data ?? []).length > 0 && (
              <Stack gap={4}>
                <Text size="xs" c="dimmed">
                  {t('This looks like one you already have:')}
                </Text>
                <Group gap="xs">
                  {(similar.data ?? []).map((c) => (
                    <Button
                      key={c.key}
                      size="xs"
                      variant="light"
                      onClick={() => {
                        select(c.key);
                        closeDraft();
                      }}
                    >
                      {t('Use')} {c.name}
                    </Button>
                  ))}
                </Group>
              </Stack>
            )}

            {other && (
              <Checkbox
                label={t('Save for future use')}
                description={
                  saveForFuture
                    ? t('It will be in the list next time.')
                    : t('It is used for this payment only.')
                }
                checked={saveForFuture}
                onChange={(e) => setSaveForFuture(e.currentTarget.checked)}
              />
            )}

            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={closeDraft} disabled={createCategory.isPending}>
                {t('Cancel')}
              </Button>
              <Button onClick={() => void saveDraft()} loading={createCategory.isPending}>
                {t('Use this category')}
              </Button>
            </Group>
          </Stack>
        </Paper>
      )}

      {error && (
        <Text size="xs" c="red">
          {error}
        </Text>
      )}
    </Stack>
  );
};
