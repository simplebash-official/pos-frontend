import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  TextInput,
  TextInputProps,
  Popover,
  Stack,
  Group,
  Text,
  UnstyledButton,
  ActionIcon,
  Button,
  ScrollArea,
  Divider,
  Center,
} from '@mantine/core';
import { IconSearch, IconHistory, IconX } from '@tabler/icons-react';
import { useSearchHistory } from '@/shared/hooks/useSearchHistory';
import { useIsMobile } from '@/shared/hooks/useResponsive';

export interface SearchHistoryInputProps extends Omit<TextInputProps, 'onChange'> {
  /** Storage namespace to partition history (e.g. 'billing', 'inventory', 'customers') */
  namespace: string;
  /** Current input value (if controlled) */
  value?: string;
  /** Change event handler compatible with standard TextInput */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Direct string value change callback */
  onValueChange?: (value: string) => void;
  /** Callback when a search query is submitted (via Enter key or selecting a history item) */
  onSearchSubmit?: (value: string) => void;
  /** Maximum number of history items to store and display */
  maxHistoryItems?: number;
  /** Whether search history dropdown is enabled (defaults to true) */
  enableHistory?: boolean;
  /** Input wrapper container style */
  wrapperStyle?: React.CSSProperties;
}

export const SearchHistoryInput = React.forwardRef<HTMLInputElement, SearchHistoryInputProps>(
  (
    {
      namespace,
      value,
      onChange,
      onValueChange,
      onSearchSubmit,
      maxHistoryItems = 8,
      enableHistory = true,
      wrapperStyle,
      placeholder = 'Search...',
      leftSection,
      onFocus,
      onKeyDown,
      onClick,
      styles,
      ...textInputProps
    },
    ref
  ) => {
    const isMobile = useIsMobile();
    const [opened, setOpened] = useState(false);
    /** -1 = nothing highlighted; the typed query stays in charge of Enter. */
    const [activeIndex, setActiveIndex] = useState(-1);
    const internalInputRef = useRef<HTMLInputElement | null>(null);
    const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

    const { history, addSearch, removeSearch, clearHistory } = useSearchHistory(namespace, {
      maxItems: maxHistoryItems,
    });

    const currentQuery = typeof value === 'string' ? value : '';

    // Automatically record search query after a short debounce when user pauses typing
    useEffect(() => {
      const trimmed = currentQuery.trim();
      if (trimmed.length >= 2) {
        const timer = setTimeout(() => {
          addSearch(trimmed);
        }, 800);
        return () => clearTimeout(timer);
      }
    }, [currentQuery, addSearch]);

    // Keep the keyboard-highlighted row visible as the user arrows past the fold.
    useEffect(() => {
      if (activeIndex < 0) return;
      itemRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    // Filter recent history based on current search text
    const displayHistory = useMemo(() => {
      if (!currentQuery.trim()) {
        return history;
      }
      const q = currentQuery.toLowerCase().trim();
      return history.filter((item) => item.toLowerCase().includes(q));
    }, [history, currentQuery]);

    // Nothing to pick from means nothing to show — an empty dropdown on every
    // focus is just noise in front of the results.
    const canOpen = enableHistory && history.length > 0;

    const openDropdown = () => {
      if (!canOpen) return;
      setActiveIndex(-1);
      setOpened(true);
    };

    const closeDropdown = () => {
      setActiveIndex(-1);
      setOpened(false);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      openDropdown();
      onFocus?.(e);
    };

    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
      openDropdown();
      onClick?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const trimmed = currentQuery.trim();
      if (trimmed.length >= 2) {
        addSearch(trimmed);
      }
      closeDropdown();
      textInputProps.onBlur?.(e);
    };

    const handleSelectHistory = (query: string) => {
      addSearch(query);

      if (onValueChange) {
        onValueChange(query);
      }

      if (onChange) {
        const syntheticEvent = {
          target: { value: query },
          currentTarget: { value: query },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }

      onSearchSubmit?.(query);
      closeDropdown();

      if (internalInputRef.current) {
        internalInputRef.current.focus();
      }
    };

    const moveActive = (delta: number) => {
      const count = displayHistory.length;
      if (count === 0) return;

      setActiveIndex((prev) => {
        const next = prev + delta;
        // Wrap through -1 so arrowing past either end hands control back to
        // whatever the user typed.
        if (next < -1) return count - 1;
        if (next >= count) return -1;
        return next;
      });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        closeDropdown();
      } else if (e.key === 'ArrowDown') {
        if (!opened && canOpen) {
          e.preventDefault();
          setOpened(true);
          setActiveIndex(0);
        } else if (opened) {
          e.preventDefault();
          moveActive(1);
        }
      } else if (e.key === 'ArrowUp') {
        if (opened) {
          e.preventDefault();
          moveActive(-1);
        }
      } else if (e.key === 'Enter') {
        const highlighted = opened && activeIndex >= 0 ? displayHistory[activeIndex] : undefined;
        if (highlighted) {
          e.preventDefault();
          handleSelectHistory(highlighted);
          // The page behind us must not also act on this Enter.
          return;
        }

        const trimmed = currentQuery.trim();
        if (trimmed) {
          addSearch(trimmed);
          onSearchSubmit?.(trimmed);
        }
        closeDropdown();
      }
      onKeyDown?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onValueChange?.(e.currentTarget.value);

      // Close, never open. Recent searches are for picking a past query before
      // you start typing — once you are typing, the dropdown just covers the
      // live results you are trying to read.
      setOpened(false);
    };

    return (
      <Popover
        opened={opened && canOpen}
        onChange={setOpened}
        width="target"
        position="bottom-start"
        shadow="md"
        withinPortal
        zIndex={300}
        offset={4}
      >
        <Popover.Target>
          <div style={{ width: '100%', ...wrapperStyle }}>
            <TextInput
              ref={(node) => {
                internalInputRef.current = node;
                if (typeof ref === 'function') {
                  ref(node);
                } else if (ref) {
                  ref.current = node;
                }
              }}
              placeholder={placeholder}
              leftSection={leftSection ?? <IconSearch size={16} />}
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onClick={handleClick}
              onKeyDown={handleKeyDown}
              size={textInputProps.size ?? 'sm'}
              styles={{
                ...styles,
                input: {
                  fontSize: isMobile ? 16 : undefined,
                  ...(typeof styles === 'object' && 'input' in styles
                    ? (styles.input as React.CSSProperties)
                    : {}),
                },
              }}
              {...textInputProps}
              onBlur={handleBlur}
            />
          </div>
        </Popover.Target>

        <Popover.Dropdown
          p="xs"
          style={{
            maxWidth: 'calc(100vw - 32px)',
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            borderRadius: 'var(--mantine-radius-default)',
          }}
          onMouseDown={(e) => {
            // Prevent input blur when clicking popover dropdown
            e.preventDefault();
          }}
        >
          <Stack gap={4}>
            <Group justify="space-between" px="xs" py={2}>
              <Group gap={6}>
                <IconHistory size={14} style={{ color: 'var(--text-secondary)' }} />
                <Text
                  size="xs"
                  fw={700}
                  c="dimmed"
                  tt="uppercase"
                  style={{ letterSpacing: '0.05em' }}
                >
                  Recent searches
                </Text>
              </Group>
              {history.length > 0 && (
                <Button
                  variant="subtle"
                  color="gray"
                  size="compact-xs"
                  style={{ fontSize: 11, height: 22 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    clearHistory();
                    setOpened(false);
                  }}
                >
                  Clear all
                </Button>
              )}
            </Group>

            <Divider color="var(--border)" my={2} />

            {displayHistory.length === 0 ? (
              <Center py="sm" px="xs">
                <Text size="xs" c="dimmed" ta="center">
                  No matching past searches for &ldquo;{currentQuery}&rdquo;.
                </Text>
              </Center>
            ) : (
              <ScrollArea.Autosize mah={220} type="auto">
                <Stack gap={2} role="listbox" aria-label="Recent searches">
                  {displayHistory.map((query, index) => (
                    <UnstyledButton
                      key={query}
                      ref={(node: HTMLButtonElement | null) => {
                        itemRefs.current[index] = node;
                      }}
                      role="option"
                      aria-selected={index === activeIndex}
                      onClick={() => handleSelectHistory(query)}
                      onMouseEnter={() => setActiveIndex(index)}
                      px="xs"
                      py={6}
                      className="search-history-item"
                      style={{
                        borderRadius: 'var(--mantine-radius-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        minHeight: isMobile ? 44 : 32,
                        cursor: 'pointer',
                        transition: 'background-color 120ms ease',
                        backgroundColor: index === activeIndex ? 'var(--bg-hover)' : undefined,
                      }}
                    >
                      <Group
                        gap="xs"
                        wrap="nowrap"
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <IconHistory
                          size={14}
                          style={{ color: 'var(--text-secondary)', flexShrink: 0 }}
                        />
                        <Text
                          size="sm"
                          style={{
                            color: 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {query}
                        </Text>
                      </Group>
                      <ActionIcon
                        size={isMobile ? 36 : 22}
                        variant="subtle"
                        color="gray"
                        aria-label={`Remove "${query}" from search history`}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          removeSearch(query);
                        }}
                        style={{ flexShrink: 0 }}
                      >
                        <IconX size={13} />
                      </ActionIcon>
                    </UnstyledButton>
                  ))}
                </Stack>
              </ScrollArea.Autosize>
            )}
          </Stack>
        </Popover.Dropdown>
      </Popover>
    );
  }
);

SearchHistoryInput.displayName = 'SearchHistoryInput';
