import { Group, Radio, Stack, Text } from '@mantine/core';
import { useIsMobile } from '@/shared/hooks/useResponsive';

export interface ChoiceCardsProps<T extends string> {
  /** Read out for people using a screen reader, which cannot see what the cards are choosing. */
  groupLabel: string;
  value: T | null;
  onChange: (value: T) => void;
  options: T[];
  label: (value: T) => string;
  hint: ((value: T) => string) | null;
  /** Why an option cannot be chosen now (shown on the card), or `null` when it can. */
  unavailable: ((value: T) => string | null) | null;
}

/** Radio cards: the one "choose one" look for a few options with a line of help each. */
export const ChoiceCards = <T extends string>({
  groupLabel,
  value,
  onChange,
  options,
  label,
  hint,
  unavailable,
}: ChoiceCardsProps<T>) => {
  const isMobile = useIsMobile();
  const reasonFor = (option: T): string | null =>
    unavailable === null ? null : unavailable(option);
  return (
    <Radio.Group
      value={value}
      aria-label={groupLabel}
      onChange={(next) => {
        const option = next as T;
        if (reasonFor(option) === null) onChange(option);
      }}
    >
      <Stack gap="xs">
        {options.map((option) => {
          const chosen = option === value;
          const reason = reasonFor(option);
          return (
            <Radio.Card
              key={option}
              value={option}
              p={isMobile ? 'md' : 'sm'}
              aria-disabled={reason !== null}
              style={{
                minHeight: 44,
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: chosen
                  ? 'var(--mantine-color-blue-filled)'
                  : 'var(--mantine-color-default-border)',
                backgroundColor: chosen ? 'var(--mantine-color-blue-light)' : 'var(--bg-card)',
                opacity: reason === null ? 1 : 0.6,
                cursor: reason === null ? 'pointer' : 'not-allowed',
              }}
            >
              <Group wrap="nowrap" align="flex-start" gap="sm">
                <Radio.Indicator mt={2} disabled={reason !== null} />
                <Stack gap={2}>
                  <Text fw={700} size="sm">
                    {label(option)}
                  </Text>
                  {reason !== null ? (
                    <Text size="xs" c="dimmed">
                      {reason}
                    </Text>
                  ) : (
                    hint !== null && (
                      <Text size="xs" c="dimmed">
                        {hint(option)}
                      </Text>
                    )
                  )}
                </Stack>
              </Group>
            </Radio.Card>
          );
        })}
      </Stack>
    </Radio.Group>
  );
};
