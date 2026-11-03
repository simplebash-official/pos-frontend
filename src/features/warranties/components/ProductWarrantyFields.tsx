import { Anchor, Box, Group, Stack, Text, Textarea, ThemeIcon } from '@mantine/core';
import { IconCalendarCheck, IconShieldCheck } from '@tabler/icons-react';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatDate } from '@/shared/lib/date';
import { endsOnIfStartedToday, sameProfile } from '../lib/warrantyView';
import type { ProductWarranty, WarrantyType } from '../types';
import { CoverageEditor } from './CoverageEditor';

export interface ProductWarrantyFieldsProps {
  value: ProductWarranty;
  onChange: (value: ProductWarranty) => void;
  /** The chosen category's template, to offer it and to say when the values came from it. */
  categoryTemplate?: { categoryName: string; warranty: ProductWarranty };
  /** What is wrong with the values, from `profileProblem`, once the person tried to save. */
  error: string | null;
  disabled?: boolean;
}

const TYPES: { value: WarrantyType; label: string }[] = [
  { value: 'shop', label: 'The shop' },
  { value: 'manufacturer', label: 'The manufacturer' },
  { value: 'both', label: 'Both' },
];

/**
 * The warranty an item comes with: how long, who gives it and what it covers. Used by the
 * product form and, as a template, by the category form. Shows the end date a unit sold today
 * would get, worked out by the same rule the till uses.
 */
export const ProductWarrantyFields = ({
  value,
  onChange,
  categoryTemplate,
  error,
  disabled,
}: ProductWarrantyFieldsProps) => {
  const isMobile = useIsMobile();
  const covered = value.coverage.kind !== 'none';
  const endsOn = endsOnIfStartedToday(value.coverage);
  const fromCategory =
    categoryTemplate !== undefined && sameProfile(value, categoryTemplate.warranty);

  return (
    <Stack gap="sm">
      {categoryTemplate !== undefined && (
        <Group gap={6} wrap="wrap">
          <Text size="xs" c="dimmed">
            {fromCategory
              ? `${t('Same as the category')} ${categoryTemplate.categoryName}.`
              : `${t('The category')} ${categoryTemplate.categoryName} ${t('usually has a different warranty.')}`}
          </Text>
          {!fromCategory && (
            <Anchor
              component="button"
              type="button"
              size="xs"
              onClick={() => onChange(categoryTemplate.warranty)}
              disabled={disabled}
            >
              {t("Use the category's warranty")}
            </Anchor>
          )}
        </Group>
      )}

      <CoverageEditor
        value={value.coverage}
        allowNone
        disabled={disabled}
        onChange={(coverage) =>
          coverage.kind === 'none' ? onChange({ coverage }) : onChange({ ...value, coverage })
        }
      />

      {covered && (
        <>
          <Stack gap={4}>
            <Text size="sm" fw={500}>
              {t('Who gives this warranty?')}
            </Text>
            <SegmentedToggle
              fullWidth
              size={isMobile ? 'md' : 'sm'}
              value={value.warrantyType ?? ''}
              onChange={(type) => onChange({ ...value, warrantyType: type as WarrantyType })}
              data={TYPES.map((type) => ({ value: type.value, label: t(type.label) }))}
              disabled={disabled}
              aria-label={t('Who gives this warranty?')}
            />
          </Stack>
          <Textarea
            label={t('What is covered and what is not')}
            description={t('Printed with the warranty. You can leave this empty.')}
            placeholder={t(
              'For example: Battery 6 months. Screen and water damage are not covered.'
            )}
            autosize
            minRows={2}
            maxRows={5}
            maxLength={1000}
            value={value.terms ?? ''}
            onChange={(event) => onChange({ ...value, terms: event.currentTarget.value })}
            disabled={disabled}
          />
        </>
      )}

      {endsOn !== null && (
        <Box
          p="xs"
          style={{
            borderRadius: 'var(--mantine-radius-default)',
            background: 'var(--status-ok-bg)',
          }}
        >
          <Group gap="xs" wrap="nowrap">
            <ThemeIcon variant="light" color="green" size="sm">
              <IconCalendarCheck size={14} />
            </ThemeIcon>
            <Text size="xs" c="var(--text-secondary)">
              {t('A unit sold today is covered until')} <b>{formatDate(endsOn)}</b>.
            </Text>
          </Group>
        </Box>
      )}
      {value.coverage.kind === 'lifetime' && (
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon variant="light" color="green" size="sm">
            <IconShieldCheck size={14} />
          </ThemeIcon>
          <Text size="xs" c="dimmed">
            {t('Covered for life: the warranty never runs out.')}
          </Text>
        </Group>
      )}
      {error !== null && (
        <Text size="xs" c="red" role="alert">
          {error}
        </Text>
      )}
    </Stack>
  );
};
