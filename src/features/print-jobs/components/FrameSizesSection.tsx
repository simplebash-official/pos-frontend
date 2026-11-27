import { useState } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  Skeleton,
  Stack,
  Switch,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconAlertCircle, IconEye, IconEyeOff, IconPlus, IconSearch } from '@tabler/icons-react';
import { SectionShell } from '@/features/settings/components/SectionShell';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { getErrorMessage } from '@/shared/lib/error';
import { FadeIn } from '@/shared/motion';
import { usePrintFrameSizes, useSetPrintFrameSizeActive } from '../hooks/usePrintFrameSizes';
import { frameName, frameWidthLabel, groupFrameSizes, normalizeFrameSize } from '../lib/frameSizes';
import { FrameSizeModal } from './FrameSizeModal';

/** What the add window was opened for: a new size (`size: null`) or another width of one. */
interface Adding {
  size: string | null;
}

/** The shop's frame sizes in Settings: one card per size, one chip per frame width. */
export const FrameSizesSection = () => {
  const isMobile = useIsMobile();
  const sizes = usePrintFrameSizes(true);
  const setActive = useSetPrintFrameSizeActive();
  const [search, setSearch] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [adding, setAdding] = useState<Adding | null>(null);

  const touch = isMobile ? 44 : undefined;
  const togglingKey =
    setActive.isPending && setActive.variables !== undefined ? setActive.variables.key : null;

  const list = () => {
    if (sizes.data === undefined) {
      if (!sizes.isError) return <Skeleton h={160} />;
      return (
        <Alert
          color="red"
          icon={<IconAlertCircle size={16} />}
          title={t('Could not load the frame sizes.')}
        >
          <Group justify="space-between" gap="sm">
            <Text size="sm">{getErrorMessage(sizes.error)}</Text>
            <Button
              variant="default"
              size="xs"
              h={touch}
              loading={sizes.isFetching}
              onClick={() => void sizes.refetch()}
            >
              {t('Try again')}
            </Button>
          </Group>
        </Alert>
      );
    }
    const wanted = normalizeFrameSize(search);
    const groups = groupFrameSizes(sizes.data.filter((frame) => showHidden || frame.active)).filter(
      (group) => group.id.includes(wanted)
    );

    if (groups.length === 0) {
      let message = t('No frame size matches.');
      if (sizes.data.length === 0) {
        message = t('No frame sizes yet. Add each size you make, with its frame width.');
      } else if (wanted === '') {
        message = t('Every frame size is hidden. Turn on Show hidden to see them.');
      }
      return (
        <Text size="sm" c="dimmed">
          {message}
        </Text>
      );
    }

    return (
      <Stack gap="xs">
        {groups.map((group, index) => (
          <FadeIn key={group.id} index={index}>
            <Paper withBorder p="sm" role="group" aria-label={group.size}>
              <Stack gap="xs">
                <Text fw={700} size="sm">
                  {group.size}
                </Text>
                <Group gap="xs" wrap="wrap">
                  {group.widths.map((frame) => {
                    const action = `${frame.active ? t('Hide') : t('Show')} ${frameName(frame)}`;
                    return (
                      <Paper
                        key={frame.key}
                        withBorder
                        // The theme pads a Paper; a chip is only as tall as its button.
                        // Side by side, not `p` with `pl`: React warns when the two are mixed.
                        py={2}
                        pr={2}
                        pl="sm"
                        opacity={frame.active ? 1 : 0.6}
                      >
                        <Group gap={6} wrap="nowrap">
                          <Text size="sm">{frameWidthLabel(frame.widthHundredthsInch)}</Text>
                          {!frame.active && (
                            <Badge size="xs" color="gray" variant="light">
                              {t('Hidden')}
                            </Badge>
                          )}
                          <Tooltip label={frame.active ? t('Hide') : t('Show')}>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size={isMobile ? 44 : 32}
                              aria-label={action}
                              loading={togglingKey === frame.key}
                              // The mutation's own notification reports a failure.
                              onClick={() =>
                                setActive.mutate({ key: frame.key, active: !frame.active })
                              }
                            >
                              {frame.active ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Paper>
                    );
                  })}
                  <Button
                    variant="subtle"
                    h={touch}
                    leftSection={<IconPlus size={14} />}
                    aria-label={`${t('Add width')}: ${group.size}`}
                    onClick={() => setAdding({ size: group.size })}
                  >
                    {t('Add width')}
                  </Button>
                </Group>
              </Stack>
            </Paper>
          </FadeIn>
        ))}
      </Stack>
    );
  };

  return (
    <>
      <SectionShell
        title={t('Frame Sizes')}
        description={t(
          'The frames you make, by size and frame width. They can be picked on a Photo & Framing job.'
        )}
        isDirty={false}
        onSave={() => undefined}
        onCancel={() => undefined}
        hideActions
      >
        <Stack gap="md">
          <Group gap="sm" wrap={isMobile ? 'wrap' : 'nowrap'}>
            <TextInput
              aria-label={t('Search sizes')}
              placeholder={t('Search sizes')}
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              size={isMobile ? 'md' : 'sm'}
              style={{ flex: 1, minWidth: 0 }}
            />
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setAdding({ size: null })}
              h={touch}
              fullWidth={isMobile}
            >
              {t('Add a frame size')}
            </Button>
          </Group>
          <Switch
            label={t('Show hidden')}
            checked={showHidden}
            onChange={(event) => setShowHidden(event.currentTarget.checked)}
          />
          {list()}
        </Stack>
      </SectionShell>

      {adding !== null && <FrameSizeModal size={adding.size} onClose={() => setAdding(null)} />}
    </>
  );
};
