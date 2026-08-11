import { SegmentedControl } from '@mantine/core';
import type { SegmentedControlProps } from '@mantine/core';

export type SegmentedToggleProps = SegmentedControlProps;

/**
 * App-wide styled `SegmentedControl`: neutral gray track with a white/card
 * active segment (see `.segmented-toggle-*` in src/styles/global.css). Pass
 * `color` to opt a specific toggle into Mantine's accent-colored indicator
 * instead (e.g. PaymentPanel's amber "Credit Sale" / red "Order Discount").
 */
export const SegmentedToggle = ({ classNames, color, ...props }: SegmentedToggleProps) => (
  <SegmentedControl
    color={color}
    classNames={{
      root: 'segmented-toggle-root',
      indicator: color ? undefined : 'segmented-toggle-indicator',
      label: 'segmented-toggle-label',
      ...classNames,
    }}
    {...props}
  />
);
