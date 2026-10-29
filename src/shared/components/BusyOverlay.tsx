import { Overlay, Portal } from '@mantine/core';
import { PageLoader } from './PageLoader';

export interface BusyOverlayProps {
  visible: boolean;
  title: string;
  subtitle?: string;
}

/**
 * Full-screen dark overlay with the particle orb loader, matching App and Admin frontends.
 * Covers the page so a second click cannot start a second request.
 */
export const BusyOverlay = ({ visible, title, subtitle }: BusyOverlayProps) => {
  if (!visible) return null;
  return (
    <Portal>
      <Overlay
        color="#000"
        backgroundOpacity={0.7}
        blur={5}
        zIndex={9999}
        role="status"
        aria-live="polite"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <PageLoader
          variant="orb"
          orbState="connecting"
          orbTheme="dark"
          size={88}
          title={title}
          subtitle={subtitle}
          height="auto"
        />
      </Overlay>
    </Portal>
  );
};
