// Undo/redo for the label designer, as pure functions over a small state so the
// rules are tested without React. A snapshot is the whole design being edited
// (size and items). Changes that carry the same tag in quick succession (one
// drag, typing into one field) are one step to undo.

/** Most steps kept to undo. */
export const HISTORY_LIMIT = 100;
/** Changes with the same tag closer together than this merge into one step. */
export const MERGE_WINDOW_MS = 1500;

export interface DesignHistory<T> {
  past: T[];
  present: T;
  future: T[];
  /** Tag and time of the last change, to merge a burst of the same change. */
  lastTag: string | null;
  lastAt: number;
}

export const startHistory = <T>(present: T): DesignHistory<T> => ({
  past: [],
  present,
  future: [],
  lastTag: null,
  lastAt: 0,
});

/** Records `next` as the design. `tag` names the change (e.g. `move:item-2`). */
export const applyChange = <T>(
  history: DesignHistory<T>,
  next: T,
  tag: string,
  now: number
): DesignHistory<T> => {
  if (next === history.present) return history;
  const merge = tag === history.lastTag && now - history.lastAt < MERGE_WINDOW_MS;
  return {
    past: merge ? history.past : [...history.past, history.present].slice(-HISTORY_LIMIT),
    present: next,
    future: [],
    lastTag: tag,
    lastAt: now,
  };
};

export const canUndo = <T>(history: DesignHistory<T>): boolean => history.past.length > 0;
export const canRedo = <T>(history: DesignHistory<T>): boolean => history.future.length > 0;

export const undo = <T>(history: DesignHistory<T>): DesignHistory<T> => {
  if (history.past.length === 0) return history;
  const previous = history.past[history.past.length - 1];
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
    lastTag: null,
    lastAt: 0,
  };
};

export const redo = <T>(history: DesignHistory<T>): DesignHistory<T> => {
  if (history.future.length === 0) return history;
  const [next, ...rest] = history.future;
  return {
    past: [...history.past, history.present],
    present: next,
    future: rest,
    lastTag: null,
    lastAt: 0,
  };
};
