import { forwardRef } from 'react';
import { AnimatePresence, motion, type useAnimationControls } from 'framer-motion';
import { ActionIcon, Box } from '@mantine/core';
import { IconBell, IconBellRinging } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { SPRING, useMotionPresets } from '@/shared/motion';

interface NotificationBellProps {
  unread: number;
  /** The bell's swing when something urgent arrives (started by the notification center). */
  ring: ReturnType<typeof useAnimationControls>;
  size: number;
  opened: boolean;
  onClick: () => void;
}

/** The header bell: a springy unread badge, and a short swing when an alert arrives. */
export const NotificationBell = forwardRef<HTMLButtonElement, NotificationBellProps>(
  ({ unread, ring, size, opened, onClick }, ref) => {
    const { reduced } = useMotionPresets();
    const Icon = unread > 0 ? IconBellRinging : IconBell;
    const label =
      unread > 0 ? `${t('Notifications')}, ${unread} ${t('not read yet')}` : t('Notifications');
    return (
      <Box className="ntf-bell" style={{ width: size, height: size }}>
        <ActionIcon
          ref={ref}
          variant={opened ? 'light' : 'subtle'}
          color={opened ? 'blue' : 'gray'}
          size={size}
          aria-label={label}
          aria-haspopup="dialog"
          aria-expanded={opened}
          onClick={onClick}
        >
          <motion.span animate={ring} className="ntf-bell-icon">
            <Icon size={size >= 44 ? 22 : 18} stroke={1.8} />
          </motion.span>
        </ActionIcon>
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="badge"
              className="ntf-badge"
              aria-hidden
              initial={reduced ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
              transition={reduced ? { duration: 0 } : SPRING}
            >
              {/* Keyed by the count so each new one gives a small pop. */}
              <motion.span
                key={unread}
                initial={reduced ? false : { scale: 1.35 }}
                animate={{ scale: 1 }}
                transition={reduced ? { duration: 0 } : SPRING}
                style={{ display: 'inline-block' }}
              >
                {unread > 99 ? '99+' : unread}
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>
      </Box>
    );
  }
);
NotificationBell.displayName = 'NotificationBell';
