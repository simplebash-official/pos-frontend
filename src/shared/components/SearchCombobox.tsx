import { useMemo, useRef, useState } from 'react';
import {
  Combobox,
  Group,
  InputBase,
  Loader,
  Stack,
  Text,
  UnstyledButton,
  useCombobox,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { compactText } from '@/shared/lib/compactText';
import { t } from '@/shared/i18n/t';

export interface SearchComboboxItem {
  value: string;
  label: string;
  /** A second line under the name, e.g. a phone number. */
  description?: string;
  /** Text on the right, e.g. "Rs. 45,000 due". */
  meta?: string;
  /** Extra words that should also match, e.g. the Sinhala name. */
  searchText?: string;
}

/** What the footer offers when the person can add a new entry from here. */
export interface SearchComboboxCreate {
  /** Footer text while something is typed, e.g. `+ Create "Generator diesel"`. */
  labelFor: (typed: string) => string;
  /** Footer text while nothing is typed, e.g. `+ Create new supplier`. */
  emptyLabel: string;
  /** Called with the trimmed text (empty when nothing was typed). */
  onCreate: (typed: string) => void;
}

export interface SearchComboboxProps {
  label: string;
  description?: string;
  placeholder?: string;
  items: SearchComboboxItem[];
  value: string | null;
  onChange: (value: string | null) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string | null;
  loading?: boolean;
  clearable?: boolean;
  autoFocus?: boolean;
  /** Present when the current person may add new entries from this list. */
  create?: SearchComboboxCreate;
  /**
   * For a field that takes a free name: called with the text left in the box when the list
   * closes without a choice (clicking or tabbing away), so a typed name is never lost.
   */
  onTypedCommit?: (typed: string) => void;
  /** Shown in place of the create footer for a person who may not add entries. */
  noCreateHint?: string;
  emptyText: string;
  'data-testid'?: string;
}

const MAX_VISIBLE = 50;

/**
 * One searchable list for every "pick one of these, or add a new one" field in the cash
 * forms (category, supplier, vendor, staff, bank account, payee). Search ignores case and
 * spacing; the create footer is pinned under the list so it is always in reach, and Enter on
 * a typed name that matches nothing creates it so the keyboard never has to leave the field.
 */
export const SearchCombobox = ({
  label,
  description,
  placeholder,
  items,
  value,
  onChange,
  required,
  disabled,
  error,
  loading,
  clearable,
  autoFocus,
  create,
  onTypedCommit,
  noCreateHint,
  emptyText,
  'data-testid': testId,
}: SearchComboboxProps) => {
  const isMobile = useIsMobile();
  const selected = items.find((item) => item.value === value) ?? null;
  const [search, setSearch] = useState('');
  const [typing, setTyping] = useState(false);

  // The close handler runs from Mantine's store, so it reads the latest text from this ref,
  // which the input's change handler keeps current.
  const latest = useRef({ search: '', typing: false, chose: false });

  const combobox = useCombobox({
    onDropdownClose: () => {
      const { search: text, typing: wasTyping, chose } = latest.current;
      if (onTypedCommit && wasTyping && !chose && text.trim()) onTypedCommit(text.trim());
      latest.current = { search: '', typing: false, chose: false };
      combobox.resetSelectedOption();
      setTyping(false);
      setSearch('');
    },
    onDropdownOpen: () => combobox.selectFirstOption(),
  });

  const typed = search.trim();
  const visible = useMemo(() => {
    const needle = compactText(search);
    if (!needle) return items.slice(0, MAX_VISIBLE);
    return items
      .filter((item) => compactText(`${item.label} ${item.searchText ?? ''}`).includes(needle))
      .slice(0, MAX_VISIBLE);
  }, [items, search]);

  const choose = (next: string | null) => {
    latest.current.chose = true;
    onChange(next);
    combobox.closeDropdown();
  };

  const startCreate = () => {
    if (!create) return;
    latest.current.chose = true;
    create.onCreate(typed);
    combobox.closeDropdown();
  };

  const optionHeight = isMobile ? 44 : undefined;

  return (
    <Combobox
      store={combobox}
      withinPortal
      onOptionSubmit={(val) => choose(val)}
      position="bottom-start"
      width="target"
    >
      <Combobox.Target>
        <InputBase
          data-testid={testId}
          label={label}
          description={description}
          placeholder={selected ? undefined : placeholder}
          required={required}
          disabled={disabled}
          error={error ?? undefined}
          autoFocus={autoFocus}
          autoComplete="off"
          value={typing ? search : (selected?.label ?? '')}
          rightSection={
            loading ? (
              <Loader size={16} />
            ) : clearable && selected ? (
              <Combobox.ClearButton onClear={() => choose(null)} aria-label={t('Clear')} />
            ) : (
              <Combobox.Chevron />
            )
          }
          rightSectionPointerEvents={clearable && selected && !loading ? 'all' : 'none'}
          onChange={(event) => {
            latest.current.search = event.currentTarget.value;
            latest.current.typing = true;
            setSearch(event.currentTarget.value);
            setTyping(true);
            combobox.openDropdown();
            combobox.selectFirstOption();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
          onKeyDown={(event) => {
            // Nothing matches what was typed: Enter adds it instead of submitting the form.
            if (event.key === 'Enter' && create && typed && visible.length === 0) {
              event.preventDefault();
              startCreate();
            }
          }}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options mah={isMobile ? '40dvh' : 260} style={{ overflowY: 'auto' }}>
          {visible.map((item) => (
            <Combobox.Option
              key={item.value}
              value={item.value}
              active={item.value === value}
              mih={optionHeight}
            >
              <Group justify="space-between" gap="sm" wrap="nowrap">
                <Stack gap={0} style={{ minWidth: 0 }}>
                  <Text size="sm" truncate>
                    {item.label}
                  </Text>
                  {item.description && (
                    <Text size="xs" c="dimmed" truncate className="search-combobox-sub">
                      {item.description}
                    </Text>
                  )}
                </Stack>
                {item.meta && (
                  <Text
                    size="xs"
                    c="dimmed"
                    className="search-combobox-sub"
                    style={{ flexShrink: 0 }}
                  >
                    {item.meta}
                  </Text>
                )}
              </Group>
            </Combobox.Option>
          ))}
          {visible.length === 0 && <Combobox.Empty>{emptyText}</Combobox.Empty>}
        </Combobox.Options>

        {(create || noCreateHint) && (
          <Combobox.Footer>
            {create ? (
              <UnstyledButton
                // Keep the field focused so the list does not close before the click lands.
                onMouseDown={(event) => event.preventDefault()}
                onClick={startCreate}
                w="100%"
                mih={isMobile ? 44 : 32}
                data-testid="combobox-create"
              >
                <Group gap="xs" wrap="nowrap">
                  <IconPlus size={16} />
                  <Text size="sm" fw={600} c="blue" truncate>
                    {typed ? create.labelFor(typed) : create.emptyLabel}
                  </Text>
                </Group>
              </UnstyledButton>
            ) : (
              <Text size="xs" c="dimmed">
                {noCreateHint}
              </Text>
            )}
          </Combobox.Footer>
        )}
      </Combobox.Dropdown>
    </Combobox>
  );
};
