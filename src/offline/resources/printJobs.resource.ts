import { queryKeys } from '@/api/queryKeys';
import {
  calculatePrintEarnings,
  createPrintJobRaw,
  deletePrintJobsRaw,
  fetchPrintJobs,
  toPrintJob,
  type BackendPrintJob,
  updatePrintJobRaw,
} from '@/features/print-jobs/api/printJobsApi';
import type { PrintJob, PrintJobInput } from '@/features/print-jobs/types';
import { db } from '../db/schema';
import { markDeleted, markPending, toLocalRow } from '../db/mirror';
import { defineOperation, defineSyncResource } from '../registry/registry';
import { pushOptions } from './pushOptions';
import { fetchResourceDelta } from './syncApi';

export interface UpdatePrintJobPayload {
  printJobKey: string;
  input: Partial<PrintJobInput>;
}

export interface DeletePrintJobsPayload {
  printJobKeys: string[];
}

export const printJobsResource = defineSyncResource<PrintJob>({
  id: 'printJobs',
  label: 'Print Jobs',

  table: db.printJobs,
  primaryKey: (job) => job.id,
  restId: (job) => job.id,
  serverGeneratedFields: ['id', 'ticketNumber', 'createdAt'],
  dependsOn: [],

  pull: {
    delta: async (cursor, ctx) => {
      const page = await fetchResourceDelta<BackendPrintJob>('printJobs', cursor, ctx.signal);
      return {
        ...page,
        items: page.items.map(toPrintJob),
      };
    },
    full: () => fetchPrintJobs(),
    intervalMs: 60_000,
  },

  operations: {
    create: defineOperation<PrintJobInput>({
      references: [
        { path: 'customer.customerKey', target: 'customers', kind: 'id', blocking: true },
      ],
      describe: (input) =>
        `Create print order for ${input.customer.customerName ?? 'walk-in customer'}`,
      localApply: async (input, ctx) => {
        const id = ctx.newLocalId('printJobs');
        const job: PrintJob = {
          id,
          ticketNumber: '',
          customerName: input.customer.customerName ?? '',
          customerPhone: input.customer.customerPhone,
          jobType: input.jobType,
          quantity: input.quantity,
          status: input.status,
          estimatedCostCents: input.estimatedCostCents,
          materialCostCents: input.materialCostCents,
          assignedEmployeeId: input.assignment?.assignedEmployeeId,
          assignedEmployeeName: input.assignment?.assignedEmployeeName,
          splitType: input.assignment?.splitType,
          splitValue: input.assignment?.splitValue,
          employeeEarningsCents: calculatePrintEarnings({
            estimatedCostCents: input.estimatedCostCents,
            materialCostCents: input.materialCostCents,
            splitType: input.assignment?.splitType,
            splitValue: input.assignment?.splitValue,
          }),
          createdAt: ctx.now,
        };
        await db.printJobs.put(toLocalRow(job));
        return { entity: job, entityKey: id };
      },
      push: async (input, _op, ctx) => {
        const created = await createPrintJobRaw(input, pushOptions(ctx));
        return {
          serverEntity: created,
          removesRows: false,
          identity: { serverKey: created.id, serverId: created.id },
          followUp: [],
        };
      },
    }),

    update: defineOperation<UpdatePrintJobPayload>({
      references: [{ path: 'printJobKey', target: 'printJobs', kind: 'id', blocking: true }],
      describe: () => 'Update print order',
      localApply: async (payload) => {
        const row = await db.printJobs.get(payload.printJobKey);
        if (!row) {
          throw new Error(`Print job ${payload.printJobKey} is not in the local mirror`);
        }
        const next = markPending(row, payload.input);
        await db.printJobs.put(next);
        return { entity: next, entityKey: payload.printJobKey };
      },
      push: async (payload, _op, ctx) => {
        const id = ctx.resolveId(payload.printJobKey, 'printJobs');
        const updated = await updatePrintJobRaw(id, payload.input, pushOptions(ctx));
        return { serverEntity: updated, removesRows: false, identity: null, followUp: [] };
      },
    }),

    deleteMany: defineOperation<DeletePrintJobsPayload>({
      references: [{ path: 'printJobKeys[]', target: 'printJobs', kind: 'id', blocking: true }],
      describe: (payload) => `Delete ${payload.printJobKeys.length} print order(s)`,
      localApply: async (payload, ctx) => {
        const affectedKeys: string[] = [];
        for (const key of payload.printJobKeys) {
          const row = await db.printJobs.get(key);
          if (row) {
            await db.printJobs.put(markDeleted(row, ctx.now));
            affectedKeys.push(key);
          }
        }
        return { entity: null, entityKey: affectedKeys[0] ?? null, affectedKeys };
      },
      push: async (payload, _op, ctx) => {
        const ids = payload.printJobKeys.map((key) => ctx.resolveId(key, 'printJobs'));
        await deletePrintJobsRaw(ids, pushOptions(ctx));
        return { serverEntity: null, removesRows: true, identity: null, followUp: [] };
      },
    }),
  },

  conflictPolicy: {
    onVersionConflict: { mode: 'manual' },
    onUniqueViolation: { mode: 'manual' },
    onMissing: { mode: 'server-wins', notify: true },
    onRejected: { mode: 'manual' },
  },

  invalidates: [queryKeys.printJobs.all],
  allowOfflineCreate: true,
  retention: { maxRows: null, pruneOlderThanDays: null },
});
