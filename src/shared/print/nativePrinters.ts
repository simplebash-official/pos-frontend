// Bridge to the desktop shell's printer commands (`list_printers`,
// `print_label_pages` in the Tauri backend). Desktop only: callers gate on
// `isTauri()`. Errors are not swallowed: a label that did not print must say so.

export interface PrintLabelPagesArgs {
  printer: string;
  /** One lossless PNG per sticker, base64 (no `data:` prefix), already at `dpi`. */
  pagesBase64: string[];
  widthMm: number;
  heightMm: number;
  dpi: number;
  copies: number;
}

/** The printers installed on this computer, by the name the system knows them by. */
export const listPrinters = async (): Promise<string[]> => {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<string[]>('list_printers');
};

/** Sends label pages straight to a printer, with no print window. */
export const printLabelPages = async (args: PrintLabelPagesArgs): Promise<void> => {
  const { invoke } = await import('@tauri-apps/api/core');
  await invoke('print_label_pages', { ...args });
};
