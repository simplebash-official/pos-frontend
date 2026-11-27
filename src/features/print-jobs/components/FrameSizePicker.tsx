import { useRef, useState } from 'react';
import {
  Alert,
  Button,
  Group,
  Loader,
  Select,
  Text,
  VisuallyHidden,
  type OptionsFilter,
} from '@mantine/core';
import { IconAlertCircle, IconFrame } from '@tabler/icons-react';
import { PERMISSIONS } from '@/constants/permissions';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { getErrorMessage } from '@/shared/lib/error';
import { usePrintFrameSizes } from '../hooks/usePrintFrameSizes';
import { frameName, frameWidthLabel, groupFrameSizes, normalizeFrameSize } from '../lib/frameSizes';
import type { PrintFrameSize } from '../types';

/** Matches what is typed against "size · width", ignoring spaces, case and `×`. */
const bySizeText: OptionsFilter = ({ options, search }) => {
  const wanted = normalizeFrameSize(search);
  return options.flatMap((entry) => {
    if (!('items' in entry)) return [];
    const items = entry.items.filter((item) => normalizeFrameSize(item.label).includes(wanted));
    return items.length === 0 ? [] : [{ group: entry.group, items }];
  });
};

export interface FrameSizePickerProps {
  onPick: (frame: PrintFrameSize) => void;
}

/** One search box over the shop's frame sizes; each pick is handed over and the box clears. */
export const FrameSizePicker = ({ onPick }: FrameSizePickerProps) => {
  const isMobile = useIsMobile();
  const canManage = useHasPermission(PERMISSIONS.PRINT_FRAME_SIZES_MANAGE);
  const sizes = usePrintFrameSizes(false);
  const [search, setSearch] = useState('');
  const input = useRef<HTMLInputElement>(null);

  const label = t('Frame size');
  const size = isMobile ? 'md' : 'sm';

  if (sizes.data === undefined) {
    if (sizes.isError) {
      return (
        <Alert
          color="red"
          icon={<IconAlertCircle size={16} />}
          p="sm"
          title={t('Could not load the frame sizes.')}
        >
          <Group justify="space-between" gap="sm">
            <Text size="sm">{getErrorMessage(sizes.error)}</Text>
            <Button
              variant="default"
              size="xs"
              h={isMobile ? 44 : undefined}
              loading={sizes.isFetching}
              onClick={() => void sizes.refetch()}
            >
              {t('Try again')}
            </Button>
          </Group>
        </Alert>
      );
    }
    return (
      <Select
        label={label}
        placeholder={t('Loading frame sizes…')}
        data={[]}
        disabled
        rightSection={<Loader size="xs" />}
        size={size}
      />
    );
  }

  const list = sizes.data;
  if (list.length === 0) {
    return (
      <Alert color="blue" icon={<IconFrame size={16} />} p="sm" title={t('No frame sizes yet')}>
        <Text size="sm">
          {canManage
            ? t('Add them in Settings, under Frame Sizes.')
            : t('Ask a manager to add them in Settings, under Frame Sizes.')}
        </Text>
      </Alert>
    );
  }

  const byKey = new Map(list.map((frame) => [frame.key, frame]));

  return (
    <Select
      ref={input}
      label={label}
      placeholder={t('Search or pick a size')}
      leftSection={<IconFrame size={16} />}
      data={groupFrameSizes(list).map((group) => ({
        group: group.size,
        items: group.widths.map((frame) => ({ value: frame.key, label: frameName(frame) })),
      }))}
      // Nothing stays selected: a pick becomes a row of wanted frames.
      value={null}
      onChange={(key) => {
        if (key === null) return;
        const picked = byKey.get(key);
        if (picked === undefined) return;
        onPick(picked);
        setSearch('');
        // Puts the phone keyboard away so the new row can be seen.
        if (isMobile) input.current?.blur();
      }}
      searchable
      searchValue={search}
      onSearchChange={setSearch}
      filter={bySizeText}
      // The group heading shows the size, so a row shows its width; screen readers hear both.
      renderOption={({ option }) => {
        const frame = byKey.get(option.value);
        if (frame === undefined) return null;
        return (
          <Group mih={isMobile ? 28 : 0}>
            <Text size="sm">
              <VisuallyHidden>{`${frame.size} `}</VisuallyHidden>
              {frameWidthLabel(frame.widthHundredthsInch)}
            </Text>
          </Group>
        );
      }}
      nothingFoundMessage={t('No frame size matches. Write another size in the note.')}
      maxDropdownHeight={300}
      comboboxProps={{ zIndex: 400 }}
      size={size}
    />
  );
};
