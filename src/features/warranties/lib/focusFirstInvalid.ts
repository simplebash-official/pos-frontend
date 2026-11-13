/**
 * Takes the person to the first thing still missing inside `root` instead of leaving them to hunt
 * for it: the first field marked `aria-invalid` or `data-invalid` (the button inside it when the
 * mark is on a group), scrolled to the middle and focused.
 */
export const focusFirstInvalid = (root: HTMLElement | null): void => {
  requestAnimationFrame(() => {
    const field = root?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]');
    const target = field?.matches('input, textarea, button')
      ? field
      : field?.querySelector<HTMLElement>('button');
    target?.scrollIntoView({ block: 'center' });
    target?.focus({ preventScroll: true });
  });
};
