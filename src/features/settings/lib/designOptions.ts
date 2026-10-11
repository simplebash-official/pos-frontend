import { t } from '@/shared/i18n/t';
import type { DocumentKindSettings, DocumentTemplateOption } from '../types';

/**
 * Dropdown entries for one kind's designs: the standard design says so (with its own name, so it
 * is recognisable), every other design uses its title as the document-server publishes it.
 */
export const designSelectData = (templates: DocumentTemplateOption[]) =>
  templates.map((option) => ({
    value: option.name,
    label: option.isDefault ? `${t('Standard design')} — ${option.title}` : option.title,
  }));

/** The id of a kind's standard design. */
export const defaultDesign = (kind: DocumentKindSettings): string | null =>
  kind.templates.find((option) => option.isDefault)?.name ?? null;

/** What a kind's dropdown shows when untouched: the shop's saved choice, else the standard design. */
export const savedDesign = (kind: DocumentKindSettings): string | null =>
  kind.selected ?? defaultDesign(kind);

/** What a kind's dropdown shows right now, given the admin's unsaved `edits` (kind -> design id). */
export const shownDesign = (
  kind: DocumentKindSettings,
  edits: Record<string, string>
): string | null => edits[kind.kind] ?? savedDesign(kind);

/** The kinds whose dropdown now differs from what is saved. Picking the saved design again is no change. */
export const changedKinds = (
  kinds: DocumentKindSettings[],
  edits: Record<string, string>
): DocumentKindSettings[] => kinds.filter((kind) => shownDesign(kind, edits) !== savedDesign(kind));

/**
 * The body of the save request: only the changed kinds. The standard design is sent as `null`
 * ("nothing chosen") so a later change of the standard design still reaches shops that never
 * picked anything else.
 */
export const buildSelections = (
  kinds: DocumentKindSettings[],
  edits: Record<string, string>
): Record<string, string | null> =>
  Object.fromEntries(
    changedKinds(kinds, edits).map((kind) => {
      const design = shownDesign(kind, edits);
      return [kind.kind, design === defaultDesign(kind) ? null : design];
    })
  );
