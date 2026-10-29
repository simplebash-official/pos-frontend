import init, {
  initSync,
  calc_cash_count,
  calc_checkout,
  calc_earnings,
  calc_quotation,
  calc_receipt,
  calc_shares,
} from './pos-calc/pos_calc_wasm.js';

export * from './pos-calc/pos_calc_wasm.js';

let initialized = false;

export async function initWasm(moduleOrPath?: Parameters<typeof init>[0]): Promise<void> {
  if (initialized) return;
  await init(moduleOrPath);
  initialized = true;
}

export function initWasmSync(module: Parameters<typeof initSync>[0]): void {
  if (initialized) return;
  initSync(module);
  initialized = true;
}

export function isWasmInitialized(): boolean {
  return initialized;
}

export { calc_cash_count, calc_checkout, calc_earnings, calc_quotation, calc_receipt, calc_shares };
