/**
 * What a repair or print job side panel is showing: the job's details, the form to change it,
 * or an empty form for a new one. `open` is kept apart from the rest so the title does not change
 * while the panel slides shut.
 */
export type JobPanelMode = 'view' | 'edit' | 'create';

export interface JobPanelState {
  open: boolean;
  mode: JobPanelMode;
  /** The job being shown or edited; `null` while creating. */
  key: string | null;
}

export const CLOSED_PANEL: JobPanelState = { open: false, mode: 'view', key: null };
export const viewPanel = (key: string): JobPanelState => ({ open: true, mode: 'view', key });
export const editPanel = (key: string): JobPanelState => ({ open: true, mode: 'edit', key });
export const createPanel: JobPanelState = { open: true, mode: 'create', key: null };
export const closePanel = (panel: JobPanelState): JobPanelState => ({ ...panel, open: false });

/** Stable text for comparing form values: key order never counts, `undefined` is dropped. */
export const snapshot = (value: unknown): string =>
  JSON.stringify(value, (_key, item: unknown) =>
    item !== null && typeof item === 'object' && !Array.isArray(item)
      ? Object.fromEntries(
          Object.entries(item as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : 1))
        )
      : item
  );
