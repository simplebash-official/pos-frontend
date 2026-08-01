import { LocalStorageStore } from '@/shared/lib/localStorageStore';

export interface PrintLogEntry {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  format: 'receipt-80' | 'receipt-58' | 'a4';
  copy: string;
  printedAt: string;
  printedBy?: string;
}

export const printLogStore = new LocalStorageStore<PrintLogEntry>('pos_print_log', []);

export function recordPrintEvent(entry: Omit<PrintLogEntry, 'id' | 'printedAt'>): PrintLogEntry {
  const newEntry: PrintLogEntry = {
    ...entry,
    id: `prt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    printedAt: new Date().toISOString(),
  };
  printLogStore.add(newEntry);
  return newEntry;
}

export function getPrintLogsForInvoice(invoiceNumber: string): PrintLogEntry[] {
  printLogStore.refresh();
  return printLogStore
    .getAll()
    .filter((log) => log.invoiceNumber === invoiceNumber || log.invoiceId === invoiceNumber);
}

export function getPrintCountForInvoice(invoiceNumber: string, format?: string): number {
  const logs = getPrintLogsForInvoice(invoiceNumber);
  if (!format) return logs.length;
  return logs.filter((l) => l.format.includes(format)).length;
}
