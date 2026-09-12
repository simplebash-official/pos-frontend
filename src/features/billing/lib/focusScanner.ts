/**
 * Shared helper functions for managing cashier focus state in the billing workflow.
 */

/**
 * Forces cursor focus back to the billing barcode scanner / product search input.
 * On mobile devices, autofocus is suppressed to avoid popping up the soft keyboard
 * over the catalog (per CLAUDE.md guidelines).
 *
 * @param force If true, ignores whether an input inside a dialog is currently active.
 */
export const focusBarcodeScanner = (force = false): void => {
  if (typeof window === 'undefined') return;

  // Suppress autofocus on mobile tier (below sm breakpoint / 768px)
  if (window.innerWidth < 768) return;

  const activeEl = document.activeElement as HTMLElement | null;

  // Don't steal focus if the user is actively typing in a modal, drawer, or dialog
  if (
    !force &&
    activeEl &&
    activeEl.closest('.mantine-Modal-root, .mantine-Drawer-root, [role="dialog"]')
  ) {
    return;
  }

  const scanBar = document.querySelector<HTMLInputElement>(
    'input[data-barcode-scanner="true"], input[placeholder*="Scan barcode"], input[placeholder*="Scan or search"]'
  );

  if (scanBar && document.activeElement !== scanBar) {
    scanBar.focus();
  }
};

/**
 * Focuses and highlights (selects all text in) the quantity input field of
 * the most recently added item in the cart.
 *
 * @returns true if an editable quantity input was found and focused, false otherwise.
 */
export const focusQuickAdjustQuantity = (): boolean => {
  if (typeof window === 'undefined') return false;

  const qtyInput = document.querySelector<HTMLInputElement>(
    'input[data-cart-newest-qty="true"], [data-cart-newest-qty="true"] input'
  );

  if (qtyInput) {
    qtyInput.focus();
    qtyInput.select();
    return true;
  }

  return false;
};
