import { describe, it, expect } from 'vitest';
import {
  fromRepairJob,
  toRepairInput,
  fromPrintJob,
  toPrintJobInput,
  fromEmployee,
  toEmployeeInput,
} from '../moneyFormUtils';
import type { RepairJob } from '@/features/repairs/types';
import type { Employee } from '@/features/employees/types';

describe('moneyFormUtils conversions', () => {
  describe('Repair Job Conversions', () => {
    it('generates default empty form values when job is null/undefined', () => {
      const defaults = fromRepairJob(null);
      expect(defaults.customerName).toBe('');
      expect(defaults.status).toBe('received');
      expect(defaults.splitType).toBe('percentage');
      expect(defaults.splitValueRupeesOrPercent).toBe(30);
    });

    it('populates form from existing repair job converting cents to rupees', () => {
      const job: RepairJob = {
        id: 'rep_1',
        ticketNumber: 'REP-001',
        customerName: 'Alice',
        customerPhone: '0771234567',
        deviceModel: 'iPhone 13',
        issueDescription: 'Cracked screen',
        status: 'in_repair',
        estimatedCostCents: 15000, // Rs. 150.00
        materialCostCents: 5000, // Rs. 50.00
        assignedEmployeeId: 'emp_1',
        assignedEmployeeName: 'Bob',
        splitType: 'fixed',
        splitValue: 2000, // Rs. 20.00 in fixed cents
        createdAt: '2026-08-20T10:00:00.000Z',
      };

      const form = fromRepairJob(job);
      expect(form.customerName).toBe('Alice');
      expect(form.estimatedPriceRupees).toBe(150);
      expect(form.materialCostRupees).toBe(50);
      expect(form.splitValueRupeesOrPercent).toBe(20);
    });

    it('converts form values to repair input converting rupees to cents', () => {
      const input = toRepairInput({
        customerName: 'Alice',
        customerPhone: '0771234567',
        deviceModel: 'iPhone 13',
        issueDescription: 'Cracked screen',
        status: 'in_repair',
        estimatedPriceRupees: 150.5,
        materialCostRupees: 50.25,
        assignedEmployeeId: 'emp_1',
        assignedEmployeeName: 'Bob',
        splitType: 'fixed',
        splitValueRupeesOrPercent: 20,
      });

      expect(input.customer.customerName).toBe('Alice');
      expect(input.estimatedCostCents).toBe(15050);
      expect(input.materialCostCents).toBe(5025);
      expect(input.assignment?.splitValue).toBe(2000); // 20 rupees -> 2000 cents
    });
  });

  describe('Print Job Conversions', () => {
    it('generates default form values for new print job', () => {
      const defaults = fromPrintJob(null);
      expect(defaults.jobType).toBe('mug');
      expect(defaults.quantity).toBe(1);
      expect(defaults.splitType).toBe('fixed');
      expect(defaults.splitValueRupeesOrPercent).toBe(500);
    });

    it('converts form values to print job input with cents conversion', () => {
      const input = toPrintJobInput({
        customerName: 'Charlie',
        customerPhone: '0712345678',
        jobType: 't-shirt',
        quantity: 5,
        status: 'ready',
        estimatedPriceRupees: 1000,
        materialCostRupees: 400,
        assignedEmployeeId: 'emp_2',
        assignedEmployeeName: 'David',
        splitType: 'percentage',
        splitValueRupeesOrPercent: 15,
      });

      expect(input.customer.customerName).toBe('Charlie');
      expect(input.jobType).toBe('t-shirt');
      expect(input.quantity).toBe(5);
      expect(input.estimatedCostCents).toBe(100000);
      expect(input.materialCostCents).toBe(40000);
      expect(input.assignment?.splitValue).toBe(15);
    });
  });

  describe('Employee Conversions', () => {
    it('converts employee entity to form values', () => {
      const emp: Employee = {
        id: 'emp_1',
        key: 'emp_1',
        name: 'Eve',
        phone: '0751234567',
        role: 'technician',
        defaultSplitType: 'fixed',
        defaultSplitValue: 3500, // Rs. 35.00
        status: 'active',
        createdAt: '2026-08-20T10:00:00.000Z',
        updatedAt: '2026-08-20T10:00:00.000Z',
      };

      const form = fromEmployee(emp);
      expect(form.name).toBe('Eve');
      expect(form.defaultSplitValueRupeesOrPercent).toBe(35);
    });

    it('converts employee form values to input payload', () => {
      const input = toEmployeeInput({
        name: 'Eve',
        phone: '0751234567',
        role: 'technician',
        defaultSplitType: 'percentage',
        defaultSplitValueRupeesOrPercent: 25,
        status: 'active',
      });

      expect(input.name).toBe('Eve');
      expect(input.defaultSplitValue).toBe(25);
    });
  });
});
