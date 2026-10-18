import { t } from '@/shared/i18n/t';
import type {
  DesignOption,
  DesignOptionValue,
  DocumentDesignFamily,
  DocumentKindSettings,
  UpdateDocumentTemplatesRequest,
} from '../types';

/** What the admin changed but has not saved: designs per kind, and setting values per design. */
export interface DesignEdits {
  /** Kind -> design id picked in its dropdown. */
  designs: Record<string, string>;
  /** Design id -> setting key -> value. */
  options: Record<string, Record<string, DesignOptionValue>>;
}

export const NO_EDITS: DesignEdits = { designs: {}, options: {} };

/**
 * Dropdown entries for one kind's designs: the standard design says so (with its own name, so it
 * is recognisable), every other design uses its title as the document-server publishes it.
 */
export const designSelectData = (families: DocumentDesignFamily[]) =>
  families.map((design) => ({
    value: design.family,
    label: design.isDefault ? `${t('Standard design')} — ${design.title}` : design.title,
  }));

/** The id of a kind's standard design. */
export const defaultDesign = (kind: DocumentKindSettings): string | null =>
  kind.families.find((design) => design.isDefault)?.family ?? null;

/**
 * What a kind's dropdown shows when untouched: the shop's saved choice, else the standard design.
 * A saved choice that is no longer offered shows as empty so the admin must choose again.
 */
export const savedDesign = (kind: DocumentKindSettings): string | null =>
  kind.selected === null ? defaultDesign(kind) : kind.effective;

/** What a kind's dropdown shows right now, given the admin's unsaved edits. */
export const shownDesign = (kind: DocumentKindSettings, edits: DesignEdits): string | null =>
  edits.designs[kind.kind] ?? savedDesign(kind);

/** The family shown for a kind, if it is one the kind offers. */
export const shownFamily = (
  kind: DocumentKindSettings,
  edits: DesignEdits
): DocumentDesignFamily | null => {
  const shown = shownDesign(kind, edits);
  return kind.families.find((design) => design.family === shown) ?? null;
};

/**
 * Whether a kind's saved choice is gone: nothing prints for it until the admin picks a design and
 * saves. Edits to the dropdown do not hide it — only saving does.
 */
export const hasUnavailableChoice = (kind: DocumentKindSettings): boolean =>
  kind.selected !== null && kind.effective === null;

/** The value a setting shows now: the admin's unsaved edit, else what is in force. */
export const shownOptionValue = (
  kind: DocumentKindSettings,
  family: string,
  option: DesignOption,
  edits: DesignEdits
): DesignOptionValue =>
  edits.options[family]?.[option.key] ?? kind.optionValues[family]?.[option.key] ?? option.default;

/** The designs whose settings now differ from what is in force. Typing the same value is no change. */
const changedOptionValues = (
  kinds: DocumentKindSettings[],
  edits: DesignEdits
): Record<string, Record<string, DesignOptionValue>> => {
  const changed: Record<string, Record<string, DesignOptionValue>> = {};
  for (const kind of kinds) {
    for (const design of kind.families) {
      for (const option of design.options) {
        const edited = edits.options[design.family]?.[option.key];
        if (edited === undefined) continue;
        const inForce = kind.optionValues[design.family]?.[option.key] ?? option.default;
        if (edited !== inForce) {
          changed[design.family] = { ...changed[design.family], [option.key]: edited };
        }
      }
    }
  }
  return changed;
};

/** The kinds whose dropdown now differs from what is saved. Picking the saved design again is no change. */
export const changedKinds = (
  kinds: DocumentKindSettings[],
  edits: DesignEdits
): DocumentKindSettings[] => kinds.filter((kind) => shownDesign(kind, edits) !== savedDesign(kind));

/** Whether anything at all differs from what is saved. */
export const hasChanges = (kinds: DocumentKindSettings[], edits: DesignEdits): boolean =>
  changedKinds(kinds, edits).length > 0 ||
  Object.keys(changedOptionValues(kinds, edits)).length > 0;

/**
 * The body of the save request: only the changed kinds and setting values. The standard design is
 * sent as `null` ("nothing chosen") so a later change of the standard design still reaches shops
 * that never picked anything else.
 */
export const buildRequest = (
  kinds: DocumentKindSettings[],
  edits: DesignEdits
): UpdateDocumentTemplatesRequest => ({
  selections: Object.fromEntries(
    changedKinds(kinds, edits).map((kind) => {
      const design = shownDesign(kind, edits);
      return [kind.kind, design === defaultDesign(kind) ? null : design];
    })
  ),
  options: changedOptionValues(kinds, edits),
});

/** Whether a text setting's value is acceptable (within its length limit). */
export const isOptionValueValid = (option: DesignOption, value: DesignOptionValue): boolean => {
  switch (option.type) {
    case 'toggle':
      return typeof value === 'boolean';
    case 'select':
      return (option.choices ?? []).some((choice) => choice.value === value);
    case 'color':
      return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
    case 'text':
      return typeof value === 'string' && value.length <= (option.maxLength ?? 0);
  }
};

/** Whether every setting edit is acceptable, so Save can be offered. */
export const editsAreValid = (kinds: DocumentKindSettings[], edits: DesignEdits): boolean =>
  kinds.every((kind) =>
    kind.families.every((design) =>
      design.options.every((option) => {
        const edited = edits.options[design.family]?.[option.key];
        return edited === undefined || isOptionValueValid(option, edited);
      })
    )
  );
