/** What a job line's price box and cost box share, so the two sit level side by side. */
export const lineMoneyProps = (isMobile: boolean) =>
  ({
    size: 'sm',
    prefix: 'Rs. ',
    min: 0,
    thousandSeparator: ',',
    // Nobody steps an amount of money one rupee at a time.
    hideControls: true,
    styles: {
      // The same look as the "Quantity" caption beside them.
      label: {
        // Inline would sit in a taller line box and drop the input below the quantity stepper.
        display: 'block',
        fontSize: 'var(--mantine-font-size-xs)',
        lineHeight: 'var(--mantine-line-height-xs)',
        fontWeight: 500,
        color: 'var(--mantine-color-dimmed)',
        marginBottom: 4,
      },
      input: {
        fontVariantNumeric: 'tabular-nums',
        height: isMobile ? 44 : 36,
        fontSize: isMobile ? 16 : undefined,
      },
    },
  }) as const;
