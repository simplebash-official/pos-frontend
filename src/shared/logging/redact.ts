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

/**
 * Serializable, redacted, size-capped form of an arbitrary payload. Oversized
 * values keep a string preview so the log still shows what it was.
 */
export const capForLog = (value: unknown, capBytes: number): unknown => {
  const redacted = redactValue(value);
  let serialized: string | undefined;
  try {
    serialized = JSON.stringify(redacted);
  } catch {
    return '[unserializable]';
  }
  if (serialized === undefined || serialized.length <= capBytes) {
    return redacted;
  }
  return {
    truncated: true,
    bytes: serialized.length,
    preview: serialized.slice(0, capBytes),
  };
};
