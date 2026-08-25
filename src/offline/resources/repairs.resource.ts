import { queryKeys } from '@/api/queryKeys';
import {
  calculateRepairEarnings,
  createRepairJobRaw,
  deleteRepairsRaw,
  fetchRepairs,
  toRepairJob,
  type BackendRepair,
  updateRepairJobRaw,
} from '@/features/repairs/api/repairsApi';
import type { RepairJob, RepairJobInput } from '@/features/repairs/types';
import { db } from '../db/schema';
import { markDeleted, markPending, toLocalRow } from '../db/mirror';
import { defineOperation, defineSyncResource } from '../registry/registry';
import { pushOptions } from './pushOptions';
import { fetchResourceDelta } from './syncApi';

export interface UpdateRepairPayload {
  repairKey: string;
  input: Partial<RepairJobInput>;
}

export interface DeleteRepairsPayload {
  repairKeys: string[];
}

export const repairsResource = defineSyncResource<RepairJob>({
  id: 'repairs',
  label: 'Repair Jobs',

  table: db.repairs,
  primaryKey: (job) => job.id,
  restId: (job) => job.id,
  // `ticketNumber` is server-issued via `reserve_sequence` at create time —
  // an offline-created job renders it as `''` (the "Pending" affordance,
  // same pattern as an unsynced product's empty `sku`) until the push
  // resolves. `employeeEarningsCents` is a derived client-side value, never
  // sent to or received from the server directly.
  serverGeneratedFields: ['id', 'ticketNumber', 'createdAt'],
  dependsOn: [],

  pull: {
    delta: async (cursor, ctx) => {
      const page = await fetchResourceDelta<BackendRepair>('repairs', cursor, ctx.signal);
      return {
        ...page,
        items: page.items.map(toRepairJob),
      };
    },
    full: () => fetchRepairs(),
    intervalMs: 60_000,
  },

  operations: {
    create: defineOperation<RepairJobInput>({
      references: [
        { path: 'customer.customerKey', target: 'customers', kind: 'id', blocking: true },
      ],
      describe: (input) =>
        `Create repair ticket for ${input.customer.customerName ?? 'walk-in customer'}`,
      localApply: async (input, ctx) => {
        const id = ctx.newLocalId('repairs');
        const job: RepairJob = {
          id,
          ticketNumber: '',
          customerName: input.customer.customerName ?? '',
          customerPhone: input.customer.customerPhone ?? '',
          deviceModel: input.deviceModel,
          serialNumber: input.serialNumber,
          issueDescription: input.issueDescription,
          status: input.status,
          estimatedCostCents: input.estimatedCostCents,
          materialCostCents: input.materialCostCents,
          assignedEmployeeId: input.assignment?.assignedEmployeeId,
          assignedEmployeeName: input.assignment?.assignedEmployeeName,
          splitType: input.assignment?.splitType,
          splitValue: input.assignment?.splitValue,
          employeeEarningsCents: calculateRepairEarnings({
            estimatedCostCents: input.estimatedCostCents,
            materialCostCents: input.materialCostCents,
            splitType: input.assignment?.splitType,
            splitValue: input.assignment?.splitValue,
          }),
          createdAt: ctx.now,
        };
        await db.repairs.put(toLocalRow(job));
        return { entity: job, entityKey: id };
      },
      push: async (input, _op, ctx) => {
        const created = await createRepairJobRaw(input, pushOptions(ctx));
        return {
          serverEntity: created,
          removesRows: false,
          identity: { serverKey: created.id, serverId: created.id },
          followUp: [],
        };
      },
    }),

    update: defineOperation<UpdateRepairPayload>({
      references: [{ path: 'repairKey', target: 'repairs', kind: 'id', blocking: true }],
      describe: () => 'Update repair ticket',
      localApply: async (payload) => {
        const row = await db.repairs.get(payload.repairKey);
        if (!row) {
          throw new Error(`Repair ${payload.repairKey} is not in the local mirror`);
        }
        const next = markPending(row, payload.input);
        await db.repairs.put(next);
        return { entity: next, entityKey: payload.repairKey };
      },
      push: async (payload, _op, ctx) => {
        const id = ctx.resolveId(payload.repairKey, 'repairs');
        const updated = await updateRepairJobRaw(id, payload.input, pushOptions(ctx));
        return { serverEntity: updated, removesRows: false, identity: null, followUp: [] };
      },
    }),

    deleteMany: defineOperation<DeleteRepairsPayload>({
      references: [{ path: 'repairKeys[]', target: 'repairs', kind: 'id', blocking: true }],
      describe: (payload) => `Delete ${payload.repairKeys.length} repair ticket(s)`,
      localApply: async (payload, ctx) => {
        const affectedKeys: string[] = [];
        for (const key of payload.repairKeys) {
          const row = await db.repairs.get(key);
          if (row) {
            await db.repairs.put(markDeleted(row, ctx.now));
            affectedKeys.push(key);
          }
        }
        return { entity: null, entityKey: affectedKeys[0] ?? null, affectedKeys };
      },
      push: async (payload, _op, ctx) => {
        const ids = payload.repairKeys.map((key) => ctx.resolveId(key, 'repairs'));
        await deleteRepairsRaw(ids, pushOptions(ctx));
        return { serverEntity: null, removesRows: true, identity: null, followUp: [] };
      },
    }),
  },

  conflictPolicy: {
    // Ticket status/cost/assignment fields have no safe auto-merge.
    onVersionConflict: { mode: 'manual' },
    onUniqueViolation: { mode: 'manual' },
    onMissing: { mode: 'server-wins', notify: true },
    onRejected: { mode: 'manual' },
  },

  invalidates: [queryKeys.repairs.all],
  allowOfflineCreate: true,
  retention: { maxRows: null, pruneOlderThanDays: null },
});
