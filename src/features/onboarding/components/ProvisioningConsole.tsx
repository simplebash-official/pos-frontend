import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Group,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
  Collapse,
} from '@mantine/core';
import {
  IconCopy,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconTerminal2,
  IconPlayerTrackNext,
} from '@tabler/icons-react';
import { useClipboard } from '@mantine/hooks';
import { t } from '@/shared/i18n/t';
import type { ProvisioningLogEntry } from '../hooks/useProvisioningOrchestrator';

export interface ProvisioningConsoleProps {
  logs: ProvisioningLogEntry[];
  isFinished?: boolean;
  onFastForward?: () => void;
}

export const ProvisioningConsole = ({
  logs,
  isFinished = false,
  onFastForward,
}: ProvisioningConsoleProps) => {
  const [opened, setOpened] = useState<boolean>(true);
  const clipboard = useClipboard({ timeout: 2000 });
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as new logs appear
  useEffect(() => {
    if (logContainerRef.current && opened) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, opened]);

  const handleCopy = () => {
    const textToCopy = logs
      .map((entry) => `[${entry.timestamp}] [${entry.tag}] ${entry.message}`)
      .join('\n');
    clipboard.copy(textToCopy);
  };

  return (
    <Box
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.28)',
        backgroundColor: '#0a0f1d',
      }}
    >
      {/* Terminal Title Bar */}
      <Box
        style={{
          padding: '10px 16px',
          backgroundColor: '#131b2e',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* macOS window control dots */}
        <Group gap="xs" align="center">
          <Group gap={6}>
            <Box
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#ff5f56',
              }}
            />
            <Box
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#ffbd2e',
              }}
            />
            <Box
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#27c93f',
              }}
            />
          </Group>

          <Group gap={6} ml="xs">
            <IconTerminal2 size={15} color="#94a3b8" />
            <Text
              size="xs"
              ff="monospace"
              fw={600}
              style={{ color: '#cbd5e1', letterSpacing: '0.02em' }}
            >
              jana2u-provisioning.log
            </Text>
          </Group>
        </Group>

        {/* Right Status Badges & Controls */}
        <Group gap="xs" align="center">
          <Badge
            size="xs"
            variant="dot"
            color={isFinished ? 'teal' : 'cyan'}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              textTransform: 'none',
              fontFamily: 'monospace',
              fontSize: '11px',
            }}
          >
            {isFinished ? t('STREAM COMPLETE') : t('LIVE LOGS')}
          </Badge>

          {!isFinished && onFastForward && (
            <Tooltip label={t('Fast forward to completion')} withArrow position="top">
              <ActionIcon
                size="sm"
                variant="subtle"
                color="blue"
                onClick={onFastForward}
                aria-label={t('Fast forward')}
                style={{ color: '#38bdf8' }}
              >
                <IconPlayerTrackNext size={14} />
              </ActionIcon>
            </Tooltip>
          )}

          <Tooltip
            label={clipboard.copied ? t('Copied!') : t('Copy all logs')}
            withArrow
            position="top"
          >
            <ActionIcon
              size="sm"
              variant="subtle"
              color={clipboard.copied ? 'teal' : 'gray'}
              onClick={handleCopy}
              aria-label={t('Copy logs')}
              style={{ color: clipboard.copied ? '#2dd4bf' : '#94a3b8' }}
            >
              {clipboard.copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
            </ActionIcon>
          </Tooltip>

          <ActionIcon
            size="sm"
            variant="subtle"
            color="gray"
            onClick={() => setOpened(!opened)}
            aria-label={opened ? t('Collapse terminal') : t('Expand terminal')}
            style={{ color: '#94a3b8' }}
          >
            {opened ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
          </ActionIcon>
        </Group>
      </Box>

      {/* Terminal Viewport */}
      <Collapse expanded={opened}>
        <Box
          ref={logContainerRef}
          style={{
            padding: '14px 18px',
            maxHeight: '220px',
            minHeight: '140px',
            overflowY: 'auto',
            fontFamily:
              "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, Monaco, Consolas, monospace",
            fontSize: '12px',
            lineHeight: 1.6,
            color: '#e2e8f0',
            backgroundColor: '#0a0f1d',
          }}
        >
          {logs.length === 0 ? (
            <Text size="xs" c="dimmed" ff="monospace" fs="italic">
              {t('Awaiting setup process logs...')}
            </Text>
          ) : (
            logs.map((log) => (
              <Box
                key={log.id}
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'baseline',
                  marginBottom: '4px',
                }}
              >
                {/* Timestamp */}
                <Text
                  component="span"
                  style={{
                    color: '#64748b',
                    flexShrink: 0,
                    userSelect: 'none',
                    fontSize: '11px',
                  }}
                >
                  [{log.timestamp}]
                </Text>

                {/* Colored Tag */}
                <Badge
                  size="xs"
                  variant="light"
                  color={log.tagColor}
                  radius="xs"
                  style={{
                    flexShrink: 0,
                    padding: '0 4px',
                    height: '18px',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    fontFamily: 'monospace',
                  }}
                >
                  {log.tag}
                </Badge>

                {/* Message */}
                <Text
                  component="span"
                  style={{
                    color: log.tag === 'ERROR' ? '#f87171' : '#f1f5f9',
                    wordBreak: 'break-word',
                  }}
                >
                  {log.message}
                </Text>
              </Box>
            ))
          )}

          {/* Terminal prompt with blinking cursor */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '6px',
              color: '#38bdf8',
            }}
          >
            <Text component="span" size="xs" fw={700} ff="monospace" c="cyan.4">
              jana2u@pos:~$
            </Text>
            <span className="terminal-blinking-cursor" style={{ color: '#38bdf8', fontWeight: 900 }}>
              ▋
            </span>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};
