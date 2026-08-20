import { fromCents, toCents } from './money';
import { RepairJob, RepairJobInput } from '@/features/repairs/types';
import { PrintJob, PrintJobInput } from '@/features/print-jobs/types';
import { Employee, EmployeeInput } from '@/features/employees/types';

export interface RepairFormValues {
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  issueDescription: string;
  status: RepairJob['status'];
  estimatedPriceRupees: number | string;
  materialCostRupees: number | string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  splitType?: 'percentage' | 'fixed';
  splitValueRupeesOrPercent?: number | string;
}

export const fromRepairJob = (job?: RepairJob | null): RepairFormValues => {
  if (!job) {
    return {
      customerName: '',
      customerPhone: '',
      deviceModel: '',
      issueDescription: '',
      status: 'received',
      estimatedPriceRupees: '',
      materialCostRupees: '',
      splitType: 'percentage',
      splitValueRupeesOrPercent: 30,
    };
  }
  return {
    customerName: job.customerName,
    customerPhone: job.customerPhone,
    deviceModel: job.deviceModel,
    issueDescription: job.issueDescription,
    status: job.status,
    estimatedPriceRupees: fromCents(job.estimatedCostCents),
    materialCostRupees: job.materialCostCents ? fromCents(job.materialCostCents) : '',
    assignedEmployeeId: job.assignedEmployeeId,
    assignedEmployeeName: job.assignedEmployeeName,
    splitType: job.splitType,
    splitValueRupeesOrPercent:
      job.splitType === 'fixed' ? fromCents(job.splitValue || 0) : job.splitValue,
  };
};

export const toRepairInput = (form: RepairFormValues): RepairJobInput => {
  const splitValNum = Number(form.splitValueRupeesOrPercent) || 0;
  const splitValueCentsOrPercent = form.splitType === 'fixed' ? toCents(splitValNum) : splitValNum;

  return {
    customer: {
      customerName: form.customerName,
      customerPhone: form.customerPhone,
    },
    assignment: form.assignedEmployeeId
      ? {
          assignedEmployeeId: form.assignedEmployeeId,
          assignedEmployeeName: form.assignedEmployeeName,
          splitType: form.splitType,
          splitValue: splitValueCentsOrPercent,
        }
      : undefined,
    deviceModel: form.deviceModel,
    issueDescription: form.issueDescription,
    status: form.status,
    estimatedCostCents: toCents(Number(form.estimatedPriceRupees) || 0),
    materialCostCents: toCents(Number(form.materialCostRupees) || 0),
  };
};

export interface PrintJobFormValues {
  customerName: string;
  customerPhone: string;
  jobType: PrintJob['jobType'];
  quantity: number | string;
  status: PrintJob['status'];
  estimatedPriceRupees: number | string;
  materialCostRupees: number | string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  splitType?: 'percentage' | 'fixed';
  splitValueRupeesOrPercent?: number | string;
}

export const fromPrintJob = (job?: PrintJob | null): PrintJobFormValues => {
  if (!job) {
    return {
      customerName: '',
      customerPhone: '',
      jobType: 'mug',
      quantity: 1,
      status: 'received',
      estimatedPriceRupees: '',
      materialCostRupees: '',
      splitType: 'fixed',
      splitValueRupeesOrPercent: 500,
    };
  }
  return {
    customerName: job.customerName,
    customerPhone: job.customerPhone || '',
    jobType: job.jobType,
    quantity: job.quantity,
    status: job.status,
    estimatedPriceRupees: fromCents(job.estimatedCostCents),
    materialCostRupees: job.materialCostCents ? fromCents(job.materialCostCents) : '',
    assignedEmployeeId: job.assignedEmployeeId,
    assignedEmployeeName: job.assignedEmployeeName,
    splitType: job.splitType,
    splitValueRupeesOrPercent:
      job.splitType === 'fixed' ? fromCents(job.splitValue || 0) : job.splitValue,
  };
};

export const toPrintJobInput = (form: PrintJobFormValues): PrintJobInput => {
  const splitValNum = Number(form.splitValueRupeesOrPercent) || 0;
  const splitValueCentsOrPercent = form.splitType === 'fixed' ? toCents(splitValNum) : splitValNum;

  return {
    customer: {
      customerName: form.customerName,
      customerPhone: form.customerPhone,
    },
    assignment: form.assignedEmployeeId
      ? {
          assignedEmployeeId: form.assignedEmployeeId,
          assignedEmployeeName: form.assignedEmployeeName,
          splitType: form.splitType,
          splitValue: splitValueCentsOrPercent,
        }
      : undefined,
    jobType: form.jobType,
    quantity: Number(form.quantity) || 1,
    status: form.status,
    estimatedCostCents: toCents(Number(form.estimatedPriceRupees) || 0),
    materialCostCents: toCents(Number(form.materialCostRupees) || 0),
  };
};

export interface EmployeeFormValues {
  name: string;
  phone: string;
  nicOrId?: string;
  role: Employee['role'];
  defaultSplitType: 'percentage' | 'fixed';
  defaultSplitValueRupeesOrPercent: number | string;
  status: Employee['status'];
  notes?: string;
}

export const fromEmployee = (emp?: Employee | null): EmployeeFormValues => {
  if (!emp) {
    return {
      name: '',
      phone: '',
      nicOrId: '',
      role: 'technician',
      defaultSplitType: 'percentage',
      defaultSplitValueRupeesOrPercent: 30,
      status: 'active',
      notes: '',
    };
  }
  return {
    name: emp.name,
    phone: emp.phone,
    nicOrId: emp.nicOrId || '',
    role: emp.role,
    defaultSplitType: emp.defaultSplitType,
    defaultSplitValueRupeesOrPercent:
      emp.defaultSplitType === 'fixed' ? fromCents(emp.defaultSplitValue) : emp.defaultSplitValue,
    status: emp.status,
    notes: emp.notes || '',
  };
};

export const toEmployeeInput = (form: EmployeeFormValues): EmployeeInput => {
  const defaultSplitValue =
    form.defaultSplitType === 'fixed'
      ? toCents(Number(form.defaultSplitValueRupeesOrPercent) || 0)
      : Number(form.defaultSplitValueRupeesOrPercent) || 0;

  return {
    name: form.name,
    phone: form.phone,
    nicOrId: form.nicOrId,
    role: form.role,
    defaultSplitType: form.defaultSplitType,
    defaultSplitValue,
    status: form.status,
    notes: form.notes,
  };
};
