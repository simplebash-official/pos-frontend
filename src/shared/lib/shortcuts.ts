import { platformInfo, type OperatingSystem } from './platform';

export type ShortcutCategory = 'cashier' | 'cart' | 'navigation' | 'documents' | 'utilities';

export type ShortcutActionId =
  | 'focusScan'
  | 'completeCheckout'
  | 'attachCustomer'
  | 'catalogJobs'
  | 'catalogGoods'
  | 'cyclePaymentMethod'
  | 'quickAdjustQty'
  | 'focusMode'
  | 'holdSale'
  | 'heldSalesDrawer'
  | 'orderDiscount'
  | 'lastReceipt'
  | 'lastInvoice'
  | 'quickSearch'
  | 'calculator'
  | 'keyboardShortcuts'
  | 'lineQtyArrows'
  | 'lineQtyPlusMinus'
  | 'lineDiscount'
  | 'lineDelete';

export interface ShortcutDefinition {
  id: ShortcutActionId;
  category: ShortcutCategory;
  title: string;
  description: string;
  windows: {
    primary: string;
    alias?: string;
  };
  mac: {
    primary: string;
    alias?: string;
  };
}

export const SHORTCUT_REGISTRY: Record<ShortcutActionId, ShortcutDefinition> = {
  completeCheckout: {
    id: 'completeCheckout',
    category: 'cashier',
    title: 'Proceed to payment / Complete sale',
    description: 'Trigger primary checkout or complete payment settlement',
    windows: { primary: 'F2', alias: 'Ctrl+Enter' },
    mac: { primary: 'F2', alias: 'Mod+Enter' },
  },
  quickAdjustQty: {
    id: 'quickAdjustQty',
    category: 'cart',
    title: 'Quick adjust quantity of last item',
    description: 'Snap focus to last item quantity field, type on numpad + Enter',
    windows: { primary: 'F8', alias: 'Alt+Q' },
    mac: { primary: 'F8', alias: 'Alt+Q' },
  },
  focusScan: {
    id: 'focusScan',
    category: 'navigation',
    title: 'Focus scan bar',
    description: 'Returns focus to the scan input from anywhere in the billing counter',
    windows: { primary: 'F1', alias: 'Esc' },
    mac: { primary: 'F1', alias: 'Esc' },
  },
  attachCustomer: {
    id: 'attachCustomer',
    category: 'cashier',
    title: 'Attach customer / Walk-in search',
    description: 'Open customer picker modal to link sale to profile or credit account',
    windows: { primary: 'F3', alias: 'Alt+A' },
    mac: { primary: 'F3', alias: 'Alt+A' },
  },
  catalogJobs: {
    id: 'catalogJobs',
    category: 'navigation',
    title: 'Switch catalog to Jobs',
    description: 'Switch catalog view to active repair and print jobs',
    windows: { primary: 'F4', alias: 'Alt+J' },
    mac: { primary: 'F4', alias: 'Alt+J' },
  },
  catalogGoods: {
    id: 'catalogGoods',
    category: 'navigation',
    title: 'Switch catalog to Goods',
    description: 'Switch catalog view to inventory merchandise and items',
    windows: { primary: 'Ctrl+G', alias: 'Alt+G' },
    mac: { primary: 'Mod+G', alias: 'Alt+G' },
  },
  cyclePaymentMethod: {
    id: 'cyclePaymentMethod',
    category: 'cashier',
    title: 'Cycle payment method',
    description: 'Step payment mode forward: Cash -> Card -> Split Payment',
    windows: { primary: 'F6', alias: 'Alt+M' },
    mac: { primary: 'F6', alias: 'Alt+M' },
  },
  focusMode: {
    id: 'focusMode',
    category: 'navigation',
    title: 'Toggle Focus Mode',
    description: 'Hide navigation sidebar and headers for distraction-free billing',
    windows: { primary: 'F11', alias: 'Ctrl+Shift+F' },
    mac: { primary: 'Mod+Shift+F', alias: 'F11' },
  },
  holdSale: {
    id: 'holdSale',
    category: 'cart',
    title: 'Park / Hold current sale',
    description: 'Stash active cart items to serve another walk-in customer',
    windows: { primary: 'Alt+H', alias: 'Ctrl+H' },
    mac: { primary: 'Alt+H', alias: 'Mod+Shift+H' },
  },
  heldSalesDrawer: {
    id: 'heldSalesDrawer',
    category: 'cart',
    title: 'Open held sales list',
    description: 'Review, resume, or dismiss parked carts',
    windows: { primary: 'Ctrl+Shift+H', alias: 'Alt+Shift+H' },
    mac: { primary: 'Mod+Shift+H', alias: 'Alt+Shift+H' },
  },
  orderDiscount: {
    id: 'orderDiscount',
    category: 'cart',
    title: 'Apply order-level discount',
    description: 'Open order discount modal to enter percentage or flat discount',
    windows: { primary: 'Ctrl+D', alias: 'Alt+D' },
    mac: { primary: 'Mod+D', alias: 'Alt+D' },
  },
  lastReceipt: {
    id: 'lastReceipt',
    category: 'documents',
    title: 'Preview last receipt',
    description: 'Quickly preview or reprint receipt of the most recent sale',
    windows: { primary: 'Ctrl+P', alias: 'Alt+P' },
    mac: { primary: 'Mod+P', alias: 'Alt+P' },
  },
  lastInvoice: {
    id: 'lastInvoice',
    category: 'documents',
    title: 'Preview last invoice',
    description: 'Preview or reprint full A4 invoice of the most recent sale',
    windows: { primary: 'Ctrl+Shift+P', alias: 'Alt+Shift+P' },
    mac: { primary: 'Mod+Shift+P', alias: 'Alt+Shift+P' },
  },
  quickSearch: {
    id: 'quickSearch',
    category: 'navigation',
    title: 'Global Quick Search',
    description: 'Universal command palette for items, customers, jobs, and invoices',
    windows: { primary: 'Ctrl+K' },
    mac: { primary: 'Mod+K' },
  },
  calculator: {
    id: 'calculator',
    category: 'utilities',
    title: 'Toggle Quick Calculator',
    description: 'Open quick mathematical calculator modal overlay',
    windows: { primary: 'Alt+C' },
    mac: { primary: 'Alt+C' },
  },
  keyboardShortcuts: {
    id: 'keyboardShortcuts',
    category: 'utilities',
    title: 'Open keyboard shortcuts map',
    description: 'Display interactive cashier keyboard shortcuts reference',
    windows: { primary: '?', alias: 'Ctrl+/' },
    mac: { primary: '?', alias: 'Mod+/' },
  },
  lineQtyArrows: {
    id: 'lineQtyArrows',
    category: 'cart',
    title: 'Adjust last item quantity',
    description: 'Press Up / Down arrow when search is empty to increment or decrement',
    windows: { primary: 'Up / Down' },
    mac: { primary: '↑ / ↓' },
  },
  lineQtyPlusMinus: {
    id: 'lineQtyPlusMinus',
    category: 'cart',
    title: 'Adjust selected line quantity',
    description: 'Press Plus (+) or Minus (-) to increment or decrement selected item',
    windows: { primary: '+ / -' },
    mac: { primary: '+ / -' },
  },
  lineDiscount: {
    id: 'lineDiscount',
    category: 'cart',
    title: 'Apply line item discount',
    description: 'Set discount on currently highlighted line item',
    windows: { primary: 'D' },
    mac: { primary: 'D' },
  },
  lineDelete: {
    id: 'lineDelete',
    category: 'cart',
    title: 'Remove line item',
    description: 'Delete highlighted line item from the cart',
    windows: { primary: 'Delete' },
    mac: { primary: 'Delete / Backspace' },
  },
};

export const SHORTCUT_CATEGORY_TITLES: Record<ShortcutCategory, string> = {
  cashier: 'Cashier & Checkout',
  cart: 'Cart & Quantity Adjustments',
  navigation: 'Navigation & Catalogs',
  documents: 'Documents & Receipts',
  utilities: 'Utilities & General',
};

/**
 * Formats a combo string (e.g. "Mod+Enter", "Alt+Q", "Ctrl+Shift+H")
 * according to the target platform and presentation style.
 */
export const formatShortcutCombo = (
  combo: string,
  options?: {
    platform?: OperatingSystem;
    style?: 'symbol' | 'text';
  }
): string => {
  const os = options?.platform ?? platformInfo.os;
  const isApple = os === 'macos' || os === 'ios';
  const style = options?.style ?? (isApple ? 'symbol' : 'text');

  // If combo has alternatives with " / ", format each part
  if (combo.includes(' / ')) {
    return combo
      .split(' / ')
      .map((part) => formatShortcutCombo(part, options))
      .join(' / ');
  }

  const tokens = combo.split('+').map((t) => t.trim());

  if (isApple) {
    if (style === 'symbol') {
      return tokens
        .map((tok) => {
          const lower = tok.toLowerCase();
          switch (lower) {
            case 'mod':
            case 'cmd':
            case 'meta':
              return '⌘';
            case 'alt':
            case 'opt':
            case 'option':
              return '⌥';
            case 'shift':
              return '⇧';
            case 'ctrl':
            case 'control':
              return '⌃';
            case 'enter':
            case 'return':
              return '↵';
            case 'backspace':
              return '⌫';
            case 'esc':
            case 'escape':
              return 'Esc';
            case 'up':
              return '↑';
            case 'down':
              return '↓';
            default:
              return tok.toUpperCase();
          }
        })
        .join('');
    } else {
      return tokens
        .map((tok) => {
          const lower = tok.toLowerCase();
          switch (lower) {
            case 'mod':
            case 'cmd':
            case 'meta':
              return 'Cmd';
            case 'alt':
            case 'opt':
            case 'option':
              return 'Option';
            case 'shift':
              return 'Shift';
            case 'ctrl':
            case 'control':
              return 'Control';
            case 'enter':
            case 'return':
              return 'Enter';
            default:
              return tok;
          }
        })
        .join('+');
    }
  }

  // Windows / Linux / other:
  return tokens
    .map((tok) => {
      const lower = tok.toLowerCase();
      switch (lower) {
        case 'mod':
        case 'ctrl':
        case 'control':
          return 'Ctrl';
        case 'alt':
        case 'opt':
        case 'option':
          return 'Alt';
        case 'shift':
          return 'Shift';
        case 'enter':
        case 'return':
          return 'Enter';
        default:
          return tok;
      }
    })
    .join('+');
};

export interface KeyPart {
  text: string;
  separatorAfter?: string; // e.g. '+' or '/'
}

/**
 * Tokenizes a shortcut combo into individual key parts with their separator.
 * Allows rendering each key in a chord as its own distinct <Kbd> badge with
 * clean spacing between keys.
 */
export const getShortcutKeyParts = (
  combo: string,
  options?: {
    platform?: OperatingSystem;
    style?: 'symbol' | 'text';
  }
): KeyPart[] => {
  const os = options?.platform ?? platformInfo.os;
  const isApple = os === 'macos' || os === 'ios';
  const style = options?.style ?? (isApple ? 'symbol' : 'text');

  // Handle slash alternatives like "F1 / Esc" or "Up / Down" or "+ / -"
  if (combo.includes(' / ')) {
    const parts = combo.split(' / ').map((p) => p.trim());
    const result: KeyPart[] = [];
    parts.forEach((part, index) => {
      const subParts = getShortcutKeyParts(part, options);
      result.push(...subParts);
      if (index < parts.length - 1 && result.length > 0) {
        result[result.length - 1].separatorAfter = '/';
      }
    });
    return result;
  }

  const rawTokens = combo.split('+').map((t) => t.trim());

  return rawTokens.map((tok, index) => {
    const isLast = index === rawTokens.length - 1;
    const lower = tok.toLowerCase();

    let text: string;
    if (isApple && style === 'symbol') {
      switch (lower) {
        case 'mod':
        case 'cmd':
        case 'meta':
          text = '⌘';
          break;
        case 'alt':
        case 'opt':
        case 'option':
          text = '⌥';
          break;
        case 'shift':
          text = '⇧';
          break;
        case 'ctrl':
        case 'control':
          text = '⌃';
          break;
        case 'enter':
        case 'return':
          text = '↵';
          break;
        case 'backspace':
          text = '⌫';
          break;
        case 'esc':
        case 'escape':
          text = 'Esc';
          break;
        case 'up':
          text = '↑';
          break;
        case 'down':
          text = '↓';
          break;
        default:
          text = tok.toUpperCase();
          break;
      }
    } else if (isApple && style === 'text') {
      switch (lower) {
        case 'mod':
        case 'cmd':
        case 'meta':
          text = 'Cmd';
          break;
        case 'alt':
        case 'opt':
        case 'option':
          text = 'Option';
          break;
        case 'shift':
          text = 'Shift';
          break;
        case 'ctrl':
        case 'control':
          text = 'Control';
          break;
        case 'enter':
        case 'return':
          text = 'Enter';
          break;
        default:
          text = tok;
          break;
      }
    } else {
      // Windows / Linux / other:
      switch (lower) {
        case 'mod':
        case 'ctrl':
        case 'control':
          text = 'Ctrl';
          break;
        case 'alt':
        case 'opt':
        case 'option':
          text = 'Alt';
          break;
        case 'shift':
          text = 'Shift';
          break;
        case 'enter':
        case 'return':
          text = 'Enter';
          break;
        default:
          text = tok;
          break;
      }
    }

    const separatorAfter = !isLast ? (isApple && style === 'symbol' ? undefined : '+') : undefined;

    return {
      text,
      separatorAfter,
    };
  });
};

/**
 * Returns the platform-specific shortcut definition for an action.
 */
export const getActionShortcut = (
  actionId: ShortcutActionId,
  customOS?: OperatingSystem
): {
  primary: string;
  alias?: string;
  formattedPrimary: string;
  formattedAlias?: string;
} => {
  const def = SHORTCUT_REGISTRY[actionId];
  const os = customOS ?? platformInfo.os;
  const isApple = os === 'macos' || os === 'ios';
  const target = isApple ? def.mac : def.windows;

  return {
    primary: target.primary,
    alias: target.alias,
    formattedPrimary: formatShortcutCombo(target.primary, { platform: os }),
    formattedAlias: target.alias ? formatShortcutCombo(target.alias, { platform: os }) : undefined,
  };
};
