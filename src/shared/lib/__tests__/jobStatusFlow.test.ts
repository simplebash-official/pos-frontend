import { describe, expect, it } from 'vitest';
import { JOB_STATUS, PRINT_JOB_STATUS } from '@/constants';
import { nextPrintJobStatus, nextStatus, printJobStepLabel, stepLabel } from '../jobStatusFlow';

describe('nextStatus', () => {
  it('walks received, diagnosing, in repair, ready, delivered', () => {
    expect(nextStatus(JOB_STATUS.RECEIVED)).toBe(JOB_STATUS.DIAGNOSING);
    expect(nextStatus(JOB_STATUS.DIAGNOSING)).toBe(JOB_STATUS.IN_REPAIR);
    expect(nextStatus(JOB_STATUS.IN_REPAIR)).toBe(JOB_STATUS.READY);
    expect(nextStatus(JOB_STATUS.READY)).toBe(JOB_STATUS.DELIVERED);
  });

  it('has no step after handed back or cancelled', () => {
    expect(nextStatus(JOB_STATUS.DELIVERED)).toBeNull();
    expect(nextStatus(JOB_STATUS.CANCELLED)).toBeNull();
  });
});

describe('stepLabel', () => {
  it('words each step', () => {
    expect(stepLabel(JOB_STATUS.DIAGNOSING)).toBe('Start diagnosing');
    expect(stepLabel(JOB_STATUS.IN_REPAIR)).toBe('Start repair');
    expect(stepLabel(JOB_STATUS.READY)).toBe('Mark ready for pickup');
    expect(stepLabel(JOB_STATUS.DELIVERED)).toBe('Mark handed back');
  });

  it('refuses a status no step leads into', () => {
    expect(() => stepLabel(JOB_STATUS.RECEIVED)).toThrow();
  });
});

describe('nextPrintJobStatus', () => {
  it('walks received, in production, ready, delivered, with no diagnosing', () => {
    expect(nextPrintJobStatus(PRINT_JOB_STATUS.RECEIVED)).toBe(PRINT_JOB_STATUS.IN_PRODUCTION);
    expect(nextPrintJobStatus(PRINT_JOB_STATUS.IN_PRODUCTION)).toBe(PRINT_JOB_STATUS.READY);
    expect(nextPrintJobStatus(PRINT_JOB_STATUS.READY)).toBe(PRINT_JOB_STATUS.DELIVERED);
  });

  it('stores in production as the value the backend validates', () => {
    expect(PRINT_JOB_STATUS.IN_PRODUCTION).toBe('in_repair');
    expect(Object.values(PRINT_JOB_STATUS)).toEqual([
      'received',
      'in_repair',
      'ready',
      'delivered',
      'cancelled',
    ]);
  });

  it('has no step after handed back or cancelled', () => {
    expect(nextPrintJobStatus(PRINT_JOB_STATUS.DELIVERED)).toBeNull();
    expect(nextPrintJobStatus(PRINT_JOB_STATUS.CANCELLED)).toBeNull();
  });
});

describe('printJobStepLabel', () => {
  it('words each step', () => {
    expect(printJobStepLabel(PRINT_JOB_STATUS.IN_PRODUCTION)).toBe('Start production');
    expect(printJobStepLabel(PRINT_JOB_STATUS.READY)).toBe('Mark ready for pickup');
    expect(printJobStepLabel(PRINT_JOB_STATUS.DELIVERED)).toBe('Mark handed back');
  });

  it('refuses a status no step leads into', () => {
    expect(() => printJobStepLabel(PRINT_JOB_STATUS.RECEIVED)).toThrow();
  });
});
