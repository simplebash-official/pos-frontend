import { describe, expect, it } from 'vitest';
import type { RepairJob } from '@/features/repairs';
import { repairCartLine } from '../repairCartLine';

const JOB: RepairJob = {
  id: 'rep_1',
  ticketNumber: 'REP-000001',
  customerName: 'Nimal Perera',
  customerPhone: '0771234567',
  deviceModel: 'Galaxy A55',
  issueDescription: 'Cracked screen',
  status: 'ready',
  kind: { kind: 'standard' },
  items: [],
  priceCents: 275_000,
  costCents: 0,
  assignedEmployeeId: 'emp_1',
  assignedEmployeeName: 'Kamal',
  createdAt: '2026-11-03T05:00:00Z',
};

describe('repairCartLine', () => {
  it('makes one line for the whole job, priced by the ticket', () => {
    expect(repairCartLine(JOB)).toEqual({
      id: expect.stringContaining('svc-repair-rep_1-'),
      productId: 'rep_1',
      name: 'REP-000001: Galaxy A55 repair',
      sku: 'REP-000001',
      unitPriceCents: 275_000,
      quantity: 1,
      discount: null,
      sourceType: 'repair',
      sourceTicketNumber: 'REP-000001',
      assignedEmployeeId: 'emp_1',
      assignedEmployeeName: 'Kamal',
    });
  });

  it('gives every line its own id', () => {
    expect(repairCartLine(JOB).id).not.toBe(repairCartLine(JOB).id);
  });
});
