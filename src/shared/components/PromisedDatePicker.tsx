import { useState } from 'react';
import { ActionIcon, Badge, Button, Chip, Group, Modal, Popover, Stack, Text } from '@mantine/core';
import { DatePicker, DatesProvider } from '@mantine/dates';
import { IconCalendar, IconX } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { formatDate } from '@/shared/lib/date';
import { describeDueDate, fromDateValue, quickDates, toDateValue } from '@/shared/lib/jobDueDate';

export interface PromisedDatePickerProps {
  label: string;
  /** The promised day as `YYYY-MM-DD`, or null when none was promised. */
  value: string | null;
  onChange: (value: string | null) => void;
  /** The calendar is open (the window around it must not close on Escape). */
  onNestedWindowChange: (open: boolean) => void;
}

/** Picks the day a job is promised: one tap for the usual choices, or a calendar for any day. */
export const PromisedDatePicker = ({
  label,
  value,
  onChange,
  onNestedWindowChange,
}: PromisedDatePickerProps) => {
  const isMobile = useIsMobile();
  const [open, setOpenState] = useState(false);
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onNestedWindowChange(next);
  };
  const note = value === null ? null : describeDueDate(value);

  const choose = (next: string | null) => {
    onChange(next);
    setOpen(false);
  };

  const calendar = (
    <Stack gap="sm" miw={isMobile ? undefined : 280}>
      <Group justify="space-between" wrap="nowrap">
        <Text fw={700} size="sm">
          {value === null ? t('Pick a date (optional)') : formatDate(value, 'ddd, DD MMM YYYY')}
        </Text>
        {note !== null && (
          <Badge color={note.color} variant="light">
            {note.label}
          </Badge>
        )}
      </Group>
      {/* Always six rows, so the card keeps one height from month to month. */}
      <DatesProvider settings={{ consistentWeeks: true }}>
        <DatePicker
          value={value}
          onChange={(next) => choose(next === null ? null : toDateValue(fromDateValue(next)))}
          minDate={toDateValue(new Date())}
          defaultDate={value ?? undefined}
          highlightToday
          size={isMobile ? 'md' : 'sm'}
          styles={{
            day: { borderRadius: '50%', fontWeight: 500 },
            calendarHeaderLevel: { fontWeight: 700, fontSize: 15 },
            weekday: { fontWeight: 600 },
          }}
        />
      </DatesProvider>
      <Group justify="space-between">
        <Button variant="subtle" color="gray" size="xs" onClick={() => choose(null)}>
          {t('Clear')}
        </Button>
        <Button variant="light" size="xs" onClick={() => choose(toDateValue(new Date()))}>
          {t('Today')}
        </Button>
      </Group>
    </Stack>
  );

  const trigger = (
    <Button
      variant="default"
      fullWidth
      justify="space-between"
      leftSection={<IconCalendar size={18} />}
      aria-label={`${label}${value === null ? '' : `, ${formatDate(value, 'ddd, DD MMM YYYY')}`}`}
      onClick={() => setOpen(!open)}
      styles={{ root: { height: 36, fontWeight: 400 }, label: { flex: 1, textAlign: 'left' } }}
      rightSection={
        note === null ? undefined : (
          <Badge color={note.color} variant="light" size="sm">
            {note.label}
          </Badge>
        )
      }
    >
      {value === null ? (
        <Text c="dimmed" size="sm" component="span">
          {t('Pick a date (optional)')}
        </Text>
      ) : (
        formatDate(value, 'ddd, DD MMM YYYY')
      )}
    </Button>
  );

  return (
    <Stack gap={6}>
      <Text size="sm" fw={500}>
        {label}
      </Text>
      <Chip.Group multiple={false} value={value ?? ''} onChange={(next) => choose(next || null)}>
        <Group gap={6}>
          {quickDates().map((quick) => (
            <Chip key={quick.label} value={quick.value} size="xs" variant="light">
              {quick.label}
            </Chip>
          ))}
        </Group>
      </Chip.Group>
      <Group gap={6} wrap="nowrap" align="center">
        {isMobile ? (
          <>
            <div style={{ flex: 1 }}>{trigger}</div>
            <Modal
              opened={open}
              onClose={() => setOpen(false)}
              title={label}
              size="sm"
              centered
              zIndex={400}
            >
              {calendar}
            </Modal>
          </>
        ) : (
          <Popover
            opened={open}
            onChange={setOpen}
            position="bottom-start"
            shadow="xl"
            radius="md"
            offset={6}
            middlewares={{ flip: true, shift: true }}
            withinPortal
          >
            <Popover.Target>
              <div style={{ flex: 1 }}>{trigger}</div>
            </Popover.Target>
            <Popover.Dropdown>{calendar}</Popover.Dropdown>
          </Popover>
        )}
        {value !== null && (
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            aria-label={t('Clear')}
            onClick={() => onChange(null)}
          >
            <IconX size={16} />
          </ActionIcon>
        )}
      </Group>
    </Stack>
  );
};
