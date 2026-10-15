import { describe, expect, it } from 'vitest';
import { movementLabel, signedQuantity } from '../movementView';

describe('movementLabel', () => {
  it.each([
    ['sale', 'Sold'],
    ['purchase_receipt', 'Received from supplier'],
    ['repair_part_consumption', 'Used in a repair'],
    ['manual_adjustment', 'Adjusted by hand'],
    ['return', 'Returned'],
    ['opening_balance', 'Opening balance'],
    ['invoice_void_reversal', 'Sale cancelled'],
    ['return_restock', 'Returned to stock'],
    ['return_write_off', 'Returned and thrown away'],
    ['return_supplier_rma', 'Sent back to supplier'],
  ])('names %s in plain words', (type, label) => {
    expect(movementLabel(type)).toBe(label);
  });

  it('shows an unknown type as it came', () => {
    expect(movementLabel('something_new')).toBe('something_new');
  });
});

describe('signedQuantity', () => {
  it('puts a plus on gains, keeps the minus on losses, leaves zero bare', () => {
    expect(signedQuantity(30)).toBe('+30');
    expect(signedQuantity(-5)).toBe('-5');
    expect(signedQuantity(0)).toBe('0');
  });
});
