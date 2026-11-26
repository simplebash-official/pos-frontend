import { describe, expect, it } from 'vitest';
import type { PrintJob } from '@/features/print-jobs';
import { printCartLine, printJobTitle } from '../printCartLine';

const JOB: PrintJob = {
  id: 'prn_1',
  ticketNumber: 'PRN-000001',
  customerKey: 'cus_nimal',
  customerName: 'Nimal Perera',
  customerPhone: '0771234567',
  jobType: 'mug',
  quantity: 50,
  status: 'ready',
  kind: { kind: 'standard' },
  items: [],
  priceCents: 4_750_000,
  costCents: 1_200_000,
  assignedEmployeeId: 'emp_1',
  assignedEmployeeName: 'Kamal',
  createdAt: '2026-11-03T05:00:00Z',
};

describe('printCartLine', () => {
  it('makes one line for the whole job, priced by the ticket and not by its cost', () => {
    expect(printCartLine(JOB)).toEqual({
      id: expect.stringContaining('svc-print-prn_1-'),
      productId: 'prn_1',
      name: 'PRN-000001: Mug printing (50 units)',
      sku: 'PRN-000001',
      unitPriceCents: 4_750_000,
      quantity: 1,
      discount: null,
      sourceType: 'print',
      sourceTicketNumber: 'PRN-000001',
      assignedEmployeeId: 'emp_1',
      assignedEmployeeName: 'Kamal',
    });
  });

  it('gives every line its own id', () => {
    expect(printCartLine(JOB).id).not.toBe(printCartLine(JOB).id);
  });

  it('names the job after its type and how many units it is', () => {
    expect(printJobTitle({ jobType: 't-shirt', quantity: 1 })).toBe('T-shirt printing (1 units)');
  });
});
