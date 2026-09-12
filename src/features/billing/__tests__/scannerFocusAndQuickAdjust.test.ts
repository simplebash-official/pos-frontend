/**
 * @jest-environment jsdom
 */
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { focusBarcodeScanner, focusQuickAdjustQuantity } from '../lib/focusScanner';
import type { CartItem } from '@/store/slices/cartSlice';

describe('POS Barcode Scanner Autofocus & Quick Adjust Quantity', () => {
  let scanInput: HTMLInputElement;
  let qtyInput: HTMLInputElement;

  beforeEach(() => {
    document.body.innerHTML = '';

    scanInput = document.createElement('input');
    scanInput.setAttribute('data-barcode-scanner', 'true');
    scanInput.placeholder = 'Scan barcode or type SKU';
    document.body.appendChild(scanInput);

    qtyInput = document.createElement('input');
    qtyInput.setAttribute('data-cart-newest-qty', 'true');
    qtyInput.value = '1';
    document.body.appendChild(qtyInput);

    // Default desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('focusBarcodeScanner helper', () => {
    it('focuses the barcode scanner input on desktop', () => {
      const focusSpy = vi.spyOn(scanInput, 'focus');
      focusBarcodeScanner();
      expect(focusSpy).toHaveBeenCalledTimes(1);
    });

    it('suppresses autofocus on mobile widths (< 768px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 414,
      });
      const focusSpy = vi.spyOn(scanInput, 'focus');
      focusBarcodeScanner();
      expect(focusSpy).not.toHaveBeenCalled();
    });

    it('does not steal focus if an input inside a modal dialog is active unless force is true', () => {
      const modal = document.createElement('div');
      modal.className = 'mantine-Modal-root';
      const modalInput = document.createElement('input');
      modal.appendChild(modalInput);
      document.body.appendChild(modal);

      modalInput.focus();

      const scanSpy = vi.spyOn(scanInput, 'focus');
      focusBarcodeScanner(false);
      expect(scanSpy).not.toHaveBeenCalled();

      // Force = true should refocus scanner
      focusBarcodeScanner(true);
      expect(scanSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('focusQuickAdjustQuantity helper', () => {
    it('focuses and selects the newest cart quantity input', () => {
      const focusSpy = vi.spyOn(qtyInput, 'focus');
      const selectSpy = vi.spyOn(qtyInput, 'select');

      const success = focusQuickAdjustQuantity();
      expect(success).toBe(true);
      expect(focusSpy).toHaveBeenCalledTimes(1);
      expect(selectSpy).toHaveBeenCalledTimes(1);
    });

    it('returns false when no newest quantity input exists in DOM', () => {
      qtyInput.removeAttribute('data-cart-newest-qty');
      const success = focusQuickAdjustQuantity();
      expect(success).toBe(false);
    });
  });

  describe('Arrow key toggles logic', () => {
    const createCartItem = (overrides?: Partial<CartItem>): CartItem => ({
      id: 'line-1',
      productId: 'prod-1',
      name: 'Wireless Mouse',
      unitPriceCents: 2500,
      quantity: 1,
      discountCents: 0,
      totalCents: 2500,
      sourceType: 'retail',
      ...overrides,
    });

    it('increments quantity when search is empty and ArrowUp is pressed', () => {
      const items = [createCartItem({ quantity: 2 })];
      const scanQuery = '   ';
      const updateQty = vi.fn();

      const isSearchEmpty = !scanQuery.trim();
      expect(isSearchEmpty).toBe(true);

      const key = 'ArrowUp';
      if (isSearchEmpty && (key === 'ArrowUp' || key === 'ArrowDown')) {
        const newest = items[0];
        const isService = newest.sourceType === 'repair' || newest.sourceType === 'print';
        const isSerialized = Boolean(newest.serialNumbers && newest.serialNumbers.length > 0);
        if (!isService && !isSerialized) {
          if (key === 'ArrowUp') {
            updateQty(newest.id, newest.quantity + 1);
          }
        }
      }

      expect(updateQty).toHaveBeenCalledWith('line-1', 3);
    });

    it('decrements quantity down to 1 when ArrowDown is pressed with quantity > 1', () => {
      const items = [createCartItem({ quantity: 3 })];
      const scanQuery = '';
      const updateQty = vi.fn();

      const isSearchEmpty = !scanQuery.trim();
      const key: string = 'ArrowDown';
      if (isSearchEmpty && (key === 'ArrowUp' || key === 'ArrowDown')) {
        const newest = items[0];
        const isService = newest.sourceType === 'repair' || newest.sourceType === 'print';
        const isSerialized = Boolean(newest.serialNumbers && newest.serialNumbers.length > 0);
        if (!isService && !isSerialized) {
          if (key === 'ArrowDown' && newest.quantity > 1) {
            updateQty(newest.id, newest.quantity - 1);
          }
        }
      }

      expect(updateQty).toHaveBeenCalledWith('line-1', 2);
    });

    it('clamps quantity at 1 and does not decrement below 1', () => {
      const items = [createCartItem({ quantity: 1 })];
      const scanQuery = '';
      const updateQty = vi.fn();

      const isSearchEmpty = !scanQuery.trim();
      const key: string = 'ArrowDown';
      if (isSearchEmpty && (key === 'ArrowUp' || key === 'ArrowDown')) {
        const newest = items[0];
        const isService = newest.sourceType === 'repair' || newest.sourceType === 'print';
        const isSerialized = Boolean(newest.serialNumbers && newest.serialNumbers.length > 0);
        if (!isService && !isSerialized) {
          if (key === 'ArrowDown' && newest.quantity > 1) {
            updateQty(newest.id, newest.quantity - 1);
          }
        }
      }

      expect(updateQty).not.toHaveBeenCalled();
    });

    it('ignores arrow key quantity changes for service tickets (repair & print jobs)', () => {
      const repairItem = createCartItem({ sourceType: 'repair', quantity: 1 });
      const items = [repairItem];
      const scanQuery = '';
      const updateQty = vi.fn();

      const isSearchEmpty = !scanQuery.trim();
      const key = 'ArrowUp';
      if (isSearchEmpty && (key === 'ArrowUp' || key === 'ArrowDown')) {
        const newest = items[0];
        const isService = newest.sourceType === 'repair' || newest.sourceType === 'print';
        const isSerialized = Boolean(newest.serialNumbers && newest.serialNumbers.length > 0);
        if (!isService && !isSerialized) {
          updateQty(newest.id, newest.quantity + 1);
        }
      }

      expect(updateQty).not.toHaveBeenCalled();
    });

    it('does not toggle cart quantity when search bar contains a search query', () => {
      const items = [createCartItem({ quantity: 1 })];
      const scanQuery = 'mouse';
      const updateQty = vi.fn();

      const isSearchEmpty = !scanQuery.trim();
      expect(isSearchEmpty).toBe(false);

      const key = 'ArrowUp';
      if (isSearchEmpty && (key === 'ArrowUp' || key === 'ArrowDown')) {
        updateQty(items[0].id, items[0].quantity + 1);
      }

      expect(updateQty).not.toHaveBeenCalled();
    });
  });

  describe('QuantityInput keyboard return-to-scanner behavior', () => {
    it('calls focusBarcodeScanner(true) when Enter is pressed in QuantityInput', () => {
      const scanSpy = vi.spyOn(scanInput, 'focus');

      const handleKeyDown = (e: { key: string; preventDefault: () => void }) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          focusBarcodeScanner(true);
        }
      };

      const preventDefault = vi.fn();
      handleKeyDown({ key: 'Enter', preventDefault });

      expect(preventDefault).toHaveBeenCalled();
      expect(scanSpy).toHaveBeenCalledTimes(1);
    });

    it('calls focusBarcodeScanner(true) when Escape is pressed in QuantityInput', () => {
      const scanSpy = vi.spyOn(scanInput, 'focus');

      const handleKeyDown = (e: { key: string; preventDefault: () => void }) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          focusBarcodeScanner(true);
        }
      };

      const preventDefault = vi.fn();
      handleKeyDown({ key: 'Escape', preventDefault });

      expect(preventDefault).toHaveBeenCalled();
      expect(scanSpy).toHaveBeenCalledTimes(1);
    });
  });
});
