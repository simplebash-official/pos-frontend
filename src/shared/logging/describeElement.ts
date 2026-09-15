/**
 * Turns a DOM event target into a stable, human-readable description for the
 * log ("button 'Complete sale'", "input 'Customer phone'"). The label comes
 * from, in order: an explicit `data-log-id`, `aria-label`, an associated
 * `<label>`, `title`, `name`, `placeholder`, then visible text.
 *
 * Add `data-log-id="billing.complete-sale"` to business-critical controls so
 * their log label survives copy and language changes; add `data-log-redact`
 * to any field (or container) whose value must never be logged.
 */

import { isSensitiveKey } from '@/shared/logging/redact';

const ACTIONABLE_SELECTOR = [
  '[data-log-id]',
  'button',
  'a[href]',
  'input',
  'select',
  'textarea',
  'label',
  'summary',
  '[role="button"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="tab"]',
  '[role="option"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
  '[role="combobox"]',
  '[role="treeitem"]',
  '[role="row"]',
  '[contenteditable="true"]',
].join(',');

const MAX_LABEL_CHARS = 80;

export interface ElementDescription {
  tag: string;
  logId: string | undefined;
  role: string | undefined;
  type: string | undefined;
  name: string | undefined;
  label: string | undefined;
  component: string | undefined;
  href: string | undefined;
  disabled: boolean;
}

const clean = (text: string | null | undefined): string | undefined => {
  if (text === null || text === undefined) {
    return undefined;
  }
  const collapsed = text.replace(/\s+/g, ' ').trim();
  if (collapsed === '') {
    return undefined;
  }
  return collapsed.length > MAX_LABEL_CHARS ? `${collapsed.slice(0, MAX_LABEL_CHARS)}…` : collapsed;
};

/** The nearest ancestor-or-self a user would think of as "the thing clicked". */
export const actionableElement = (target: EventTarget | null): Element | undefined => {
  if (!(target instanceof Element)) {
    return undefined;
  }
  const actionable = target.closest(ACTIONABLE_SELECTOR);
  return actionable ?? target;
};

const associatedLabel = (element: Element): string | undefined => {
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => element.ownerDocument.getElementById(id)?.textContent)
      .join(' ');
    const cleaned = clean(text);
    if (cleaned) {
      return cleaned;
    }
  }
  const id = element.getAttribute('id');
  if (id) {
    const escaped = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id;
    const label = element.ownerDocument.querySelector(`label[for="${escaped}"]`);
    const cleaned = clean(label?.textContent);
    if (cleaned) {
      return cleaned;
    }
  }
  return clean(element.closest('label')?.textContent);
};

const mantineComponent = (element: Element): string | undefined => {
  const withClass = element.closest('[class*="mantine-"]');
  if (!withClass) {
    return undefined;
  }
  const match = /mantine-([A-Za-z]+)-root/.exec(withClass.getAttribute('class') ?? '');
  return match ? match[1] : undefined;
};

const isFormField = (element: Element): boolean =>
  element instanceof HTMLInputElement ||
  element instanceof HTMLTextAreaElement ||
  element instanceof HTMLSelectElement;

export const describeElement = (element: Element): ElementDescription => {
  const formField = isFormField(element);
  const label =
    clean(element.getAttribute('data-log-id')) ??
    clean(element.getAttribute('aria-label')) ??
    (formField ? associatedLabel(element) : undefined) ??
    clean(element.getAttribute('title')) ??
    clean(element.getAttribute('name')) ??
    clean(element.getAttribute('placeholder')) ??
    // Visible text is only meaningful for non-field controls; a textarea's
    // textContent is its value.
    (formField ? undefined : clean((element as HTMLElement).innerText ?? element.textContent));

  const href = element instanceof HTMLAnchorElement ? element.getAttribute('href') : null;
  return {
    tag: element.tagName.toLowerCase(),
    logId: element.getAttribute('data-log-id') ?? undefined,
    role: element.getAttribute('role') ?? undefined,
    type: element.getAttribute('type') ?? undefined,
    name: element.getAttribute('name') ?? undefined,
    label,
    component: mantineComponent(element),
    href: href ?? undefined,
    disabled:
      element.hasAttribute('disabled') ||
      element.getAttribute('aria-disabled') === 'true' ||
      element.hasAttribute('data-disabled'),
  };
};

/**
 * Whether a field's value must be kept out of the log: password and payment
 * inputs, one-time codes, anything under `data-log-redact`, or a field whose
 * name/id/label looks like a secret.
 */
export const isSensitiveField = (element: Element): boolean => {
  if (element.closest('[data-log-redact]')) {
    return true;
  }
  const type = (element.getAttribute('type') ?? '').toLowerCase();
  if (type === 'password') {
    return true;
  }
  const autocomplete = (element.getAttribute('autocomplete') ?? '').toLowerCase();
  if (
    autocomplete.startsWith('cc-') ||
    autocomplete.includes('password') ||
    autocomplete === 'one-time-code'
  ) {
    return true;
  }
  return [
    element.getAttribute('name'),
    element.getAttribute('id'),
    element.getAttribute('aria-label'),
  ]
    .filter((value): value is string => value !== null)
    .some(isSensitiveKey);
};

/** One-line summary used as the entry's `msg`. */
export const summarize = (verb: string, description: ElementDescription): string => {
  const what = description.label ? `'${description.label}'` : `<${description.tag}>`;
  return `${verb} ${description.component ?? description.tag} ${what}`;
};
