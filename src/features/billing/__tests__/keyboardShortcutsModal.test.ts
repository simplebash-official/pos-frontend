import { describe, it, expect } from 'vitest';
import { KeyboardShortcutsModal } from '../components/KeyboardShortcutsModal';
import { SHORTCUT_REGISTRY, SHORTCUT_CATEGORY_TITLES } from '@/shared/lib/shortcuts';

describe('KeyboardShortcutsModal Component', () => {
  it('exports KeyboardShortcutsModal component function', () => {
    expect(typeof KeyboardShortcutsModal).toBe('function');
  });

  it('contains entries covering all registered shortcut categories', () => {
    const categories = Object.keys(SHORTCUT_CATEGORY_TITLES);
    expect(categories).toContain('cashier');
    expect(categories).toContain('cart');
    expect(categories).toContain('navigation');
    expect(categories).toContain('documents');
    expect(categories).toContain('utilities');

    const registeredCategories = new Set(Object.values(SHORTCUT_REGISTRY).map((s) => s.category));

    categories.forEach((cat) => {
      expect(registeredCategories.has(cat as keyof typeof SHORTCUT_CATEGORY_TITLES)).toBe(true);
    });
  });
});
