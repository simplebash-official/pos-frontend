import { queryKeys } from '@/api/queryKeys';
import {
  createCategory,
  createSubcategory,
  deleteCategory,
  deleteSubcategory,
  fetchCategories,
  updateCategory,
} from '@/features/inventory/api/categoriesApi';
import type { Category, CategoryInput } from '@/features/inventory/types';
import { db } from '../db/schema';
import { markDeleted, markPending, toLocalRow } from '../db/mirror';
import { defineOperation, defineSyncResource } from '../registry/registry';
import { pushOptions } from './pushOptions';
import { fetchResourceDelta } from './syncApi';

export interface UpdateCategoryPayload {
  categoryKey: string;
  updates: Partial<Omit<CategoryInput, 'subcategories'>>;
}
export interface DeleteCategoryPayload {
  categoryKey: string;
}
export interface AddSubcategoryPayload {
  categoryKey: string;
  name: string;
}
export interface RemoveSubcategoryPayload {
  categoryKey: string;
  subcategoryKey: string;
}

/**
 * Categories are the root of the dependency graph — products reference them,
 * nothing they reference is synced.
 *
 * The sync unit is the whole `Category` including its nested subcategories,
 * because every subcategory endpoint already returns the complete parent.
 */
export const categoriesResource = defineSyncResource<Category>({
  id: 'categories',
  label: 'Categories',

  table: db.categories,
  primaryKey: (category) => category.key,
  restId: () => null,
  serverGeneratedFields: ['key', 'createdAt', 'updatedAt'],
  dependsOn: [],

  pull: {
    delta: (cursor, ctx) => fetchResourceDelta<Category>('categories', cursor, ctx.signal),
    full: () => fetchCategories(),
    intervalMs: 5 * 60_000,
  },

  operations: {
    create: defineOperation<CategoryInput>({
      references: [],
      describe: (input) => `Create category "${input.name}"`,
      localApply: async (input, ctx) => {
        const key = ctx.newLocalId('categories');
        const category: Category = {
          key,
          name: input.name,
          icon: input.icon,
          color: input.color,
          subcategories: input.subcategories.map((name) => ({
            key: ctx.newLocalId('categories'),
            categoryKey: key,
            name,
            createdAt: ctx.now,
            updatedAt: ctx.now,
          })),
          createdAt: ctx.now,
          updatedAt: ctx.now,
        };
        await db.categories.put(toLocalRow(category));
        return { entity: category, entityKey: key };
      },
      push: async (input, _op, ctx) => {
        const created = await createCategory(input, pushOptions(ctx));
        return {
          serverEntity: created,
          removesRows: false,
          identity: { serverKey: created.key, serverId: null },
          followUp: [],
        };
      },
    }),

    update: defineOperation<UpdateCategoryPayload>({
      references: [{ path: 'categoryKey', target: 'categories', kind: 'key', blocking: true }],
      describe: () => 'Update category',
      localApply: async (payload) => {
        const row = await db.categories.get(payload.categoryKey);
        if (!row) {
          throw new Error(`Category ${payload.categoryKey} is not in the local mirror`);
        }
        const next = markPending(row, payload.updates);
        await db.categories.put(next);
        return { entity: next, entityKey: payload.categoryKey };
      },
      push: async (payload, _op, ctx) => {
        const key = ctx.resolveKey(payload.categoryKey, 'categories');
        const updated = await updateCategory(key, payload.updates, pushOptions(ctx));
        return { serverEntity: updated, removesRows: false, identity: null, followUp: [] };
      },
    }),

    delete: defineOperation<DeleteCategoryPayload>({
      references: [{ path: 'categoryKey', target: 'categories', kind: 'key', blocking: true }],
      describe: () => 'Delete category',
      localApply: async (payload, ctx) => {
        const row = await db.categories.get(payload.categoryKey);
        if (!row) {
          throw new Error(`Category ${payload.categoryKey} is not in the local mirror`);
        }
        // See `suppliers.delete` — return the tombstoned row, not the
        // pre-delete one.
        const deleted = markDeleted(row, ctx.now);
        await db.categories.put(deleted);
        return { entity: deleted, entityKey: payload.categoryKey };
      },
      push: async (payload, _op, ctx) => {
        const key = ctx.resolveKey(payload.categoryKey, 'categories');
        await deleteCategory(key, pushOptions(ctx));
        return { serverEntity: null, removesRows: true, identity: null, followUp: [] };
      },
    }),

    addSubcategory: defineOperation<AddSubcategoryPayload>({
      references: [{ path: 'categoryKey', target: 'categories', kind: 'key', blocking: true }],
      describe: (payload) => `Add subcategory "${payload.name}"`,
      localApply: async (payload, ctx) => {
        const row = await db.categories.get(payload.categoryKey);
        if (!row) {
          throw new Error(`Category ${payload.categoryKey} is not in the local mirror`);
        }
        const next = markPending(row, {
          subcategories: [
            ...row.subcategories,
            {
              key: ctx.newLocalId('categories'),
              categoryKey: payload.categoryKey,
              name: payload.name,
              createdAt: ctx.now,
              updatedAt: ctx.now,
            },
          ],
        });
        await db.categories.put(next);
        return { entity: next, entityKey: payload.categoryKey };
      },
      push: async (payload, _op, ctx) => {
        const key = ctx.resolveKey(payload.categoryKey, 'categories');
        // Returns the whole parent category, so the mirror is refreshed wholesale.
        const category = await createSubcategory(key, payload.name, {
          idempotencyKey: ctx.idempotencyKey,
        });
        return { serverEntity: category, removesRows: false, identity: null, followUp: [] };
      },
    }),

    removeSubcategory: defineOperation<RemoveSubcategoryPayload>({
      references: [{ path: 'categoryKey', target: 'categories', kind: 'key', blocking: true }],
      describe: () => 'Remove subcategory',
      localApply: async (payload) => {
        const row = await db.categories.get(payload.categoryKey);
        if (!row) {
          throw new Error(`Category ${payload.categoryKey} is not in the local mirror`);
        }
        const next = markPending(row, {
          subcategories: row.subcategories.filter(
            (subcategory) => subcategory.key !== payload.subcategoryKey
          ),
        });
        await db.categories.put(next);
        return { entity: next, entityKey: payload.categoryKey };
      },
      push: async (payload, _op, ctx) => {
        const key = ctx.resolveKey(payload.categoryKey, 'categories');
        const category = await deleteSubcategory(key, payload.subcategoryKey, {
          idempotencyKey: ctx.idempotencyKey,
        });
        return { serverEntity: category, removesRows: false, identity: null, followUp: [] };
      },
    }),
  },

  conflictPolicy: {
    // A renamed or recoloured category is a low-value edit; losing one silently
    // is acceptable so long as the user is told it happened.
    onVersionConflict: { mode: 'server-wins', notify: true },
    // CATEGORY_ALREADY_EXISTS — the user has to choose a name or merge.
    onUniqueViolation: { mode: 'manual' },
    onMissing: { mode: 'server-wins', notify: true },
    onRejected: { mode: 'manual' },
  },

  invalidates: [queryKeys.categories.all, queryKeys.inventory.all],
  allowOfflineCreate: true,
  retention: { maxRows: null, pruneOlderThanDays: null },
});
