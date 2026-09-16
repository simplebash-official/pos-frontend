/**
 * Secret masking for everything the frontend logs. Same rules as the backend,
 * document-server and the Tauri shell (which re-applies them as a backstop):
 * credentials and secrets are masked, customer data is deliberately kept.
 */

export const REDACTED = '[REDACTED]';

const SENSITIVE_KEY =
  /(password|passwd|pwd|secret|token|authorization|cookie|api[_-]?key|jwt|cvv|card_?number|otp|\bpin\b|^pin$|_pin$|pin_code|pincode)/i;

const SECRET_VALUE =
  /(bearer\s+[A-Za-z0-9\-_.=]+|eyJ[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_.+/=]*|\b[a-f0-9]{64}\b)/gi;

export const isSensitiveKey = (key: string): boolean => SENSITIVE_KEY.test(key);

export const redactText = (text: string): string => text.replace(SECRET_VALUE, REDACTED);

const MAX_DEPTH = 8;

/**
 * Deep-copies `value` with sensitive keys masked and secret-shaped strings
 * scrubbed. Never mutates the input (it is often live app state).
 */
export const redactValue = (value: unknown, depth = 0): unknown => {
  if (typeof value === 'string') {
    return redactText(value);
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (depth >= MAX_DEPTH) {
    return '[depth limit]';
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, depth + 1));
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof Blob !== 'undefined' && value instanceof Blob) {
    return { blob: true, size: value.size, type: value.type };
  }
  if (value instanceof ArrayBuffer) {
    return { binary: true, bytes: value.byteLength };
  }
  const out: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    out[key] =
      isSensitiveKey(key) && entry !== null && entry !== undefined
        ? REDACTED
        : redactValue(entry, depth + 1);
  }
  return out;
};

/** Marker key added to a capped object/array result when content was cut. */
export const TRUNCATED_KEY = '…truncated';

interface Budget {
  remaining: number;
  truncated: boolean;
}

// Rough JSON byte costs — exactness doesn't matter, only that the walk stops
// after about `capBytes` of output instead of visiting the whole payload.
const SCALAR_COST = 8;
const CONTAINER_COST = 2;

const walk = (value: unknown, budget: Budget, depth: number): unknown => {
  if (typeof value === 'string') {
    const cost = value.length + 2;
    if (cost <= budget.remaining) {
      budget.remaining -= cost;
      return redactText(value);
    }
    budget.truncated = true;
    const keep = Math.max(0, budget.remaining - 2);
    budget.remaining = 0;
    return `${redactText(value.slice(0, keep))}…[${value.length} chars]`;
  }
  if (value === null || typeof value !== 'object') {
    budget.remaining -= SCALAR_COST;
    return value;
  }
  if (depth >= MAX_DEPTH) {
    budget.remaining -= SCALAR_COST;
    return '[depth limit]';
  }
  if (value instanceof Date) {
    budget.remaining -= 26;
    return value.toISOString();
  }
  if (typeof Blob !== 'undefined' && value instanceof Blob) {
    budget.remaining -= 40;
    return { blob: true, size: value.size, type: value.type };
  }
  if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
    budget.remaining -= 30;
    return { binary: true, bytes: value.byteLength };
  }

  budget.remaining -= CONTAINER_COST;
  if (Array.isArray(value)) {
    const out: unknown[] = [];
    for (let i = 0; i < value.length; i += 1) {
      if (budget.remaining <= 0) {
        budget.truncated = true;
        out.push({ [TRUNCATED_KEY]: `${value.length - i} more items` });
        break;
      }
      out.push(walk(value[i], budget, depth + 1));
    }
    return out;
  }

  const out: Record<string, unknown> = {};
  const record = value as Record<string, unknown>;
  let seen = 0;
  // `for…in` rather than `Object.entries`: stopping early must not first
  // allocate an entry array for a huge object.
  for (const key in record) {
    if (!Object.prototype.hasOwnProperty.call(record, key)) {
      continue;
    }
    if (budget.remaining <= 0) {
      budget.truncated = true;
      out[TRUNCATED_KEY] = `${Object.keys(record).length - seen} more fields`;
      break;
    }
    seen += 1;
    budget.remaining -= key.length + 3;
    const entry = record[key];
    out[key] =
      isSensitiveKey(key) && entry !== null && entry !== undefined
        ? REDACTED
        : walk(entry, budget, depth + 1);
  }
  return out;
};

/**
 * Redacted, size-capped copy of an arbitrary payload in a single pass that
 * stops once about `capBytes` of output has been produced — the cost is
 * O(cap), never O(payload), so a multi-MB API response costs the same as a
 * small one. Cut content is marked with `TRUNCATED_KEY` / a `…[n chars]`
 * suffix. Never mutates the input.
 */
export const redactAndCap = (value: unknown, capBytes: number): unknown =>
  walk(value, { remaining: capBytes, truncated: false }, 0);
