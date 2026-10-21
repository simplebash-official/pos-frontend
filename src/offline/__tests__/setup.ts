import 'fake-indexeddb/auto';

/**
 * The offline engine reads a few browser globals at module scope. Providing
 * them here keeps the modules under test importable in a `node` environment
 * without each test faking them itself.
 */

if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, String(value)),
      removeItem: (key: string) => void store.delete(key),
      clear: () => store.clear(),
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      get length() {
        return store.size;
      },
    },
    writable: true,
  });
}

if (typeof globalThis.navigator === 'undefined') {
  Object.defineProperty(globalThis, 'navigator', {
    value: { onLine: true },
    writable: true,
  });
}

if (typeof (globalThis as { DOMMatrix?: unknown }).DOMMatrix === 'undefined') {
  class DOMMatrixMock {
    a = 1;
    b = 0;
    c = 0;
    d = 1;
    e = 0;
    f = 0;
    m11 = 1;
    m12 = 0;
    m13 = 0;
    m14 = 0;
    m21 = 0;
    m22 = 1;
    m23 = 0;
    m24 = 0;
    m31 = 0;
    m32 = 0;
    m33 = 1;
    m34 = 0;
    m41 = 0;
    m42 = 0;
    m43 = 0;
    m44 = 1;
    is2D = true;
    isIdentity = true;
    inverse() {
      return this;
    }
    multiply() {
      return this;
    }
    transformPoint() {
      return { x: 0, y: 0, z: 0, w: 1 };
    }
  }
  Object.defineProperty(globalThis, 'DOMMatrix', {
    value: DOMMatrixMock,
    writable: true,
  });
}
