import { describe, it, expect } from 'vitest';
import { alignElement, duplicateElement, moveLayer, snapToCenter } from '../labelGeometry';
import {
  HISTORY_LIMIT,
  MERGE_WINDOW_MS,
  applyChange,
  canRedo,
  canUndo,
  redo,
  startHistory,
  undo,
} from '../designHistory';
import type { LabelElement } from '../../types';

const label = { widthMm: 50, heightMm: 30 };
const box = (id: string, over: Partial<LabelElement> = {}): LabelElement =>
  ({ id, type: 'qr', xMm: 5, yMm: 5, widthMm: 10, heightMm: 10, ...over }) as LabelElement;

describe('arranging items', () => {
  it('lines an item up on each edge and the centre', () => {
    const item = box('a');
    expect(alignElement(item, label, 'left').xMm).toBe(0);
    expect(alignElement(item, label, 'center').xMm).toBe(20);
    expect(alignElement(item, label, 'right').xMm).toBe(40);
    expect(alignElement(item, label, 'top').yMm).toBe(0);
    expect(alignElement(item, label, 'middle').yMm).toBe(10);
    expect(alignElement(item, label, 'bottom').yMm).toBe(20);
    // Only the one direction moves.
    expect(alignElement(item, label, 'left').yMm).toBe(5);
  });

  it('pulls an item onto the centre lines when it comes close, and says which', () => {
    const near = snapToCenter(box('a', { xMm: 20.8, yMm: 3 }), label);
    expect(near.element.xMm).toBe(20);
    expect(near.element.yMm).toBe(3);
    expect(near.guides).toEqual({ vertical: true, horizontal: false });
    const far = snapToCenter(box('a', { xMm: 12, yMm: 9.5 }), label);
    expect(far.element.xMm).toBe(12);
    expect(far.element.yMm).toBe(10);
    expect(far.guides).toEqual({ vertical: false, horizontal: true });
  });

  it('copies an item with a new id, a little offset and still inside the label', () => {
    const items = [box('item-1'), box('item-2', { xMm: 40, yMm: 20 })];
    const copy = duplicateElement(items[1], items, label);
    expect(copy.id).toBe('item-3');
    expect(copy.xMm).toBe(40);
    expect(copy.yMm).toBe(20);
    const roomy = duplicateElement(items[0], items, label);
    expect([roomy.xMm, roomy.yMm]).toEqual([7, 7]);
  });

  it('moves an item one step in the drawing order, not past either end', () => {
    const items = [box('a'), box('b'), box('c')];
    expect(moveLayer(items, 'a', 'up').map((e) => e.id)).toEqual(['b', 'a', 'c']);
    expect(moveLayer(items, 'c', 'down').map((e) => e.id)).toEqual(['a', 'c', 'b']);
    expect(moveLayer(items, 'c', 'up')).toBe(items);
    expect(moveLayer(items, 'a', 'down')).toBe(items);
    expect(moveLayer(items, 'missing', 'up')).toBe(items);
  });
});

describe('undo and redo', () => {
  it('steps back and forward through changes', () => {
    let history = startHistory('a');
    expect(canUndo(history)).toBe(false);
    history = applyChange(history, 'b', 'edit:1', 0);
    history = applyChange(history, 'c', 'edit:2', 10);
    expect(history.present).toBe('c');
    history = undo(history);
    expect(history.present).toBe('b');
    expect(canRedo(history)).toBe(true);
    history = undo(history);
    expect(history.present).toBe('a');
    expect(undo(history)).toBe(history);
    history = redo(redo(history));
    expect(history.present).toBe('c');
    expect(redo(history)).toBe(history);
  });

  it('makes one drag (the same change in quick succession) one step', () => {
    let history = startHistory('a');
    history = applyChange(history, 'b', 'move:1', 0);
    history = applyChange(history, 'c', 'move:1', 100);
    history = applyChange(history, 'd', 'move:1', 200);
    expect(undo(history).present).toBe('a');
    // The same change after a pause is a new step.
    history = applyChange(history, 'e', 'move:1', 200 + MERGE_WINDOW_MS);
    expect(undo(history).present).toBe('d');
  });

  it('forgets what was undone once something new is changed', () => {
    let history = applyChange(startHistory('a'), 'b', 'edit', 0);
    history = undo(history);
    history = applyChange(history, 'x', 'other', 1);
    expect(canRedo(history)).toBe(false);
    expect(undo(history).present).toBe('a');
  });

  it('keeps at most the last steps', () => {
    let history = startHistory(0);
    for (let i = 1; i <= HISTORY_LIMIT + 20; i += 1) {
      history = applyChange(history, i, `edit:${i}`, i * MERGE_WINDOW_MS);
    }
    expect(history.past).toHaveLength(HISTORY_LIMIT);
  });
});
