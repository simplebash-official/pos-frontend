import 'fake-indexeddb/auto';
import fs from 'node:fs';
import path from 'node:path';
import { initWasmSync } from './wasm';

// Polyfill in-memory localStorage for Node test environments
if (typeof globalThis.localStorage === 'undefined') {
  let store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
}

// Polyfill window matchMedia and ResizeObserver if running in DOM environment
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = ResizeObserverMock;
}

// Synchronously initialize WASM for tests
let wasmPath = path.resolve(process.cwd(), 'src/wasm/pos-calc/pos_calc_wasm_bg.wasm');
if (typeof __dirname !== 'undefined') {
  const localPath = path.resolve(__dirname, 'wasm/pos-calc/pos_calc_wasm_bg.wasm');
  if (fs.existsSync(localPath)) {
    wasmPath = localPath;
  }
}
if (fs.existsSync(wasmPath)) {
  const wasmBytes = fs.readFileSync(wasmPath);
  initWasmSync({ module: wasmBytes });
}
