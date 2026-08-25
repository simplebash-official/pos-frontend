import { queryKeys } from '@/api/queryKeys';
import {
  createEmployee,
  deleteEmployee,
  deleteEmployees,
  fetchEmployees,
  updateEmployee,
} from '@/features/employees/api/employeesApi';
import type { Employee, EmployeeInput } from '@/features/employees/types';
import { db } from '../db/schema';
import { markDeleted, markPending, toLocalRow } from '../db/mirror';
import { defineOperation, defineSyncResource } from '../registry/registry';
import { pushOptions } from './pushOptions';
import { fetchResourceDelta } from './syncApi';

export interface UpdateEmployeePayload {
  employeeKey: string;
  input: Partial<EmployeeInput>;
}
export interface DeleteEmployeePayload {
  employeeKey: string;
}
export interface DeleteEmployeesPayload {
  employeeKeys: string[];
}

/**
 * Employee HR/commission profiles. Unlike login accounts (`users`, which are
 * never synced — see `frontend/CLAUDE.md`'s Offline & sync section), an
 * Employee carries no credentials, so it's safe to create/edit offline the
 * same way a product or supplier is — `allowOfflineCreate: true`.
 */
export const employeesResource = defineSyncResource<Employee>({
  id: 'employees',
  label: 'Employees',

  table: db.employees,
  primaryKey: (employee) => employee.id,
  restId: (employee) => employee.id,
  serverGeneratedFields: ['id', 'key', 'login', 'createdAt', 'updatedAt'],
  dependsOn: [],

  pull: {
    delta: (cursor, ctx) => fetchResourceDelta<Employee>('employees', cursor, ctx.signal),
    full: () => fetchEmployees(),
    intervalMs: 5 * 60_000,
  },

  operations: {
    create: defineOperation<EmployeeInput>({
      references: [],
      describe: (input) => `Add employee "${input.name}"`,
      localApply: async (input, ctx) => {
        const id = ctx.newLocalId('employees');
        const employee: Employee = {
          ...input,
          id,
          key: id,
          createdAt: ctx.now,
          updatedAt: ctx.now,
        };
        await db.employees.put(toLocalRow(employee));
        return { entity: employee, entityKey: id };
      },
      push: async (input, _op, ctx) => {
        const created = await createEmployee(input, pushOptions(ctx));
        return {
          serverEntity: created,
          removesRows: false,
          identity: { serverKey: created.key, serverId: created.id },
          followUp: [],
        };
      },
    }),

    update: defineOperation<UpdateEmployeePayload>({
      references: [{ path: 'employeeKey', target: 'employees', kind: 'id', blocking: true }],
      describe: () => 'Update employee profile',
      localApply: async (payload) => {
        const row = await db.employees.get(payload.employeeKey);
        if (!row) {
          throw new Error(`Employee ${payload.employeeKey} is not in the local mirror`);
        }
        const next = markPending(row, payload.input);
        await db.employees.put(next);
        return { entity: next, entityKey: payload.employeeKey };
      },
      push: async (payload, _op, ctx) => {
        const id = ctx.resolveId(payload.employeeKey, 'employees');
        const updated = await updateEmployee(id, payload.input, pushOptions(ctx));
        return { serverEntity: updated, removesRows: false, identity: null, followUp: [] };
      },
    }),

    delete: defineOperation<DeleteEmployeePayload>({
      references: [{ path: 'employeeKey', target: 'employees', kind: 'id', blocking: true }],
      describe: () => 'Remove employee',
      localApply: async (payload, ctx) => {
        const row = await db.employees.get(payload.employeeKey);
        if (!row) {
          throw new Error(`Employee ${payload.employeeKey} is not in the local mirror`);
        }
        const deleted = markDeleted(row, ctx.now);
        await db.employees.put(deleted);
        return { entity: deleted, entityKey: payload.employeeKey };
      },
      push: async (payload, _op, ctx) => {
        const id = ctx.resolveId(payload.employeeKey, 'employees');
        await deleteEmployee(id, pushOptions(ctx));
        return { serverEntity: null, removesRows: true, identity: null, followUp: [] };
      },
    }),

    deleteMany: defineOperation<DeleteEmployeesPayload>({
      references: [{ path: 'employeeKeys[]', target: 'employees', kind: 'id', blocking: true }],
      describe: (payload) => `Delete ${payload.employeeKeys.length} employee(s)`,
      localApply: async (payload, ctx) => {
        const affectedKeys: string[] = [];
        for (const key of payload.employeeKeys) {
          const row = await db.employees.get(key);
          if (row) {
            await db.employees.put(markDeleted(row, ctx.now));
            affectedKeys.push(key);
          }
        }
        return { entity: null, entityKey: affectedKeys[0] ?? null, affectedKeys };
      },
      push: async (payload, _op, ctx) => {
        const ids = payload.employeeKeys.map((key) => ctx.resolveId(key, 'employees'));
        await deleteEmployees(ids, pushOptions(ctx));
        return { serverEntity: null, removesRows: true, identity: null, followUp: [] };
      },
    }),
  },

  conflictPolicy: {
    // Commission-split edits have no safe auto-merge — always ask.
    onVersionConflict: { mode: 'manual' },
    onUniqueViolation: { mode: 'manual' },
    onMissing: { mode: 'server-wins', notify: true },
    onRejected: { mode: 'manual' },
  },

  invalidates: [queryKeys.employees.all],
  allowOfflineCreate: true,
  retention: { maxRows: null, pruneOlderThanDays: null },
});
