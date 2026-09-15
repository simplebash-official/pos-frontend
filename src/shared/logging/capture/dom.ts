/**
 * Global UI interaction capture: one set of capture-phase listeners on the
 * document records every click, double/right click, form submit, committed
 * field change, debounced typing (the final value, not every keystroke),
 * and non-character key presses (Enter, Esc, F-keys, shortcuts). Capture
 * phase means a handler calling `stopPropagation` can't hide an interaction.
 *
 * Field values are logged in full except for sensitive fields (passwords,
 * payment, `data-log-redact`), whose value is replaced by its length.
 * Focus/blur and scroll are high-volume and only recorded when "UI trace" is
 * enabled in Settings → Logs.
 */

import {
  actionableElement,
  describeElement,
  isSensitiveField,
  summarize,
} from '@/shared/logging/describeElement';
import { logger } from '@/shared/logging/logger';
import { REDACTED } from '@/shared/logging/redact';

const INPUT_DEBOUNCE_MS = 600;
const SCROLL_THROTTLE_MS = 1000;
const MAX_VALUE_CHARS = 500;

type FieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const isField = (target: EventTarget | null): target is FieldElement =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLSelectElement;

/** What to log for a field's current value. */
export const fieldValue = (field: FieldElement): Record<string, unknown> => {
  if (field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')) {
    return { checked: field.checked, value: field.value };
  }
  if (field instanceof HTMLInputElement && field.type === 'file') {
    return {
      files: Array.from(field.files ?? []).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    };
  }
  if (isSensitiveField(field)) {
    return { value: REDACTED, length: field.value.length };
  }
  const value = field.value;
  return value.length > MAX_VALUE_CHARS
    ? { value: `${value.slice(0, MAX_VALUE_CHARS)}…`, length: value.length }
    : { value };
};

const pointerData = (event: MouseEvent) => ({
  x: Math.round(event.clientX),
  y: Math.round(event.clientY),
  button: event.button,
  modifiers: modifierKeys(event),
});

const modifierKeys = (event: MouseEvent | KeyboardEvent): string[] => {
  const keys: string[] = [];
  if (event.ctrlKey) keys.push('ctrl');
  if (event.metaKey) keys.push('meta');
  if (event.altKey) keys.push('alt');
  if (event.shiftKey) keys.push('shift');
  return keys;
};

const NAMED_KEYS = new Set([
  'Enter',
  'Escape',
  'Tab',
  'Backspace',
  'Delete',
  'Insert',
  'Home',
  'End',
  'PageUp',
  'PageDown',
]);

/** Keys worth logging on their own: named/function keys and modifier combos. */
export const isLoggableKey = (event: KeyboardEvent): boolean => {
  if (['Control', 'Meta', 'Alt', 'Shift', 'CapsLock'].includes(event.key)) {
    return false;
  }
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return true;
  }
  return NAMED_KEYS.has(event.key) || /^F\d{1,2}$/.test(event.key);
};

export const installDomCapture = (doc: Document): (() => void) => {
  const pendingInput = new Map<Element, ReturnType<typeof setTimeout>>();
  let lastScroll = 0;

  const logPointer = (name: string, verb: string) => (event: Event) => {
    const element = actionableElement(event.target);
    if (!element) {
      return;
    }
    const description = describeElement(element);
    logger.event(
      'ui',
      name,
      { element: description, ...pointerData(event as MouseEvent) },
      {
        msg: summarize(verb, description),
      }
    );
  };

  const onInput = (event: Event) => {
    const field = event.target;
    if (!isField(field)) {
      return;
    }
    const existing = pendingInput.get(field);
    if (existing !== undefined) {
      clearTimeout(existing);
    }
    pendingInput.set(
      field,
      setTimeout(() => {
        pendingInput.delete(field);
        const description = describeElement(field);
        logger.event(
          'ui',
          'input',
          { element: description, ...fieldValue(field) },
          {
            msg: summarize('Typed in', description),
          }
        );
      }, INPUT_DEBOUNCE_MS)
    );
  };

  const onChange = (event: Event) => {
    const field = event.target;
    if (!isField(field)) {
      return;
    }
    // Text fields already produced a debounced `input`; `change` matters for
    // selects, checkboxes, radios, files and dates.
    const isText =
      field instanceof HTMLTextAreaElement ||
      (field instanceof HTMLInputElement &&
        ['text', 'search', 'email', 'tel', 'url', 'number', 'password', ''].includes(field.type));
    if (isText) {
      return;
    }
    const description = describeElement(field);
    logger.event(
      'ui',
      'change',
      { element: description, ...fieldValue(field) },
      {
        msg: summarize('Changed', description),
      }
    );
  };

  const onSubmit = (event: Event) => {
    if (!(event.target instanceof HTMLFormElement)) {
      return;
    }
    const form = event.target;
    const description = describeElement(form);
    const fields = Array.from(form.elements)
      .filter(isField)
      .map((field) => ({
        field: describeElement(field).label ?? field.name,
        ...fieldValue(field),
      }));
    logger.event(
      'ui',
      'submit',
      { element: description, fields },
      {
        msg: summarize('Submitted', description),
      }
    );
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!isLoggableKey(event)) {
      return;
    }
    const element = actionableElement(event.target);
    logger.event(
      'ui',
      'key',
      {
        key: event.key,
        code: event.code,
        modifiers: modifierKeys(event),
        repeat: event.repeat,
        element: element ? describeElement(element) : undefined,
      },
      { msg: `Pressed ${[...modifierKeys(event), event.key].join('+')}` }
    );
  };

  const onFocus = (name: 'focus' | 'blur') => (event: Event) => {
    if (!logger.config.uiTrace) {
      return;
    }
    const element = actionableElement(event.target);
    if (element) {
      logger.trace('ui', name, { element: describeElement(element) });
    }
  };

  const onScroll = () => {
    if (!logger.config.uiTrace) {
      return;
    }
    const now = Date.now();
    if (now - lastScroll < SCROLL_THROTTLE_MS) {
      return;
    }
    lastScroll = now;
    logger.trace('ui', 'scroll', {
      x: Math.round(doc.defaultView?.scrollX ?? 0),
      y: Math.round(doc.defaultView?.scrollY ?? 0),
    });
  };

  const onFocusIn = onFocus('focus');
  const onFocusOut = onFocus('blur');
  const onClick = logPointer('click', 'Clicked');
  const onDblClick = logPointer('dblclick', 'Double-clicked');
  const onContextMenu = logPointer('contextmenu', 'Right-clicked');

  const listeners: [string, EventListener][] = [
    ['click', onClick],
    ['dblclick', onDblClick],
    ['contextmenu', onContextMenu],
    ['input', onInput],
    ['change', onChange],
    ['submit', onSubmit],
    ['keydown', onKeyDown as EventListener],
    ['focusin', onFocusIn],
    ['focusout', onFocusOut],
    ['scroll', onScroll],
  ];
  for (const [type, listener] of listeners) {
    doc.addEventListener(type, listener, { capture: true, passive: true });
  }

  return () => {
    for (const [type, listener] of listeners) {
      doc.removeEventListener(type, listener, { capture: true });
    }
    pendingInput.forEach((timer) => clearTimeout(timer));
    pendingInput.clear();
  };
};
