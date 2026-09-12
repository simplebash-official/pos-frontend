import React from 'react';
import { Group, Kbd, Text, type MantineSize } from '@mantine/core';
import { type OperatingSystem } from '../lib/platform';
import { getShortcutKeyParts, getActionShortcut, type ShortcutActionId } from '../lib/shortcuts';

export interface KbdShortcutProps {
  combo: string;
  size?: MantineSize;
  platform?: OperatingSystem;
  className?: string;
  style?: React.CSSProperties;
}

export const KbdShortcut: React.FC<KbdShortcutProps> = ({
  combo,
  size = 'xs',
  platform,
  className,
  style,
}) => {
  const parts = getShortcutKeyParts(combo, { platform });

  return (
    <Group gap={4} wrap="nowrap" align="center" className={className} style={style}>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          <Kbd
            size={size}
            style={{
              fontFamily: 'monospace',
              fontWeight: 600,
              padding: '2px 5px',
            }}
          >
            {part.text}
          </Kbd>
          {part.separatorAfter && (
            <Text
              size="xs"
              c="dimmed"
              style={{
                fontSize: 10,
                lineHeight: 1,
                userSelect: 'none',
                opacity: 0.65,
                margin: '0 1px',
              }}
            >
              {part.separatorAfter}
            </Text>
          )}
        </React.Fragment>
      ))}
    </Group>
  );
};

export interface KbdActionProps {
  actionId: ShortcutActionId;
  size?: MantineSize;
  platform?: OperatingSystem;
  showAlias?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const KbdAction: React.FC<KbdActionProps> = ({
  actionId,
  size = 'xs',
  platform,
  showAlias = true,
  className,
  style,
}) => {
  const { primary, alias } = getActionShortcut(actionId, platform);

  if (!alias || !showAlias) {
    return (
      <KbdShortcut
        combo={primary}
        size={size}
        platform={platform}
        className={className}
        style={style}
      />
    );
  }

  return (
    <Group gap={8} wrap="nowrap" align="center" className={className} style={style}>
      <KbdShortcut combo={primary} size={size} platform={platform} />
      <Text
        size="xs"
        c="dimmed"
        style={{
          fontSize: 11,
          lineHeight: 1,
          userSelect: 'none',
          opacity: 0.65,
        }}
      >
        or
      </Text>
      <KbdShortcut combo={alias} size={size} platform={platform} />
    </Group>
  );
};
