# src/offline — DO NOT DELETE

This directory used to hold a full offline-first sync engine (IndexedDB
mirrors of every backend resource, a durable write outbox, conflict
resolution). That engine was removed — the app now reads and writes the
backend directly via `apiClient` + TanStack Query, like any ordinary web app.

**What's left here is deliberate, not leftover.** It's kept as
infrastructure for a possible future non-sync local-storage feature, and
some of it (`ConnectivityMonitor`) is still actively used today:

- `db/schema.ts` — the `OfflineDb` Dexie class and `db` singleton. Real
  table today: `statsCache` (dashboard-KPI last-known-value cache, written
  by `src/shared/hooks/useModuleStats.ts`).
- `db/maintenance.ts` — `estimateStorage`/`requestPersistentStorage`,
  generic browser storage-quota helpers.
- `connectivity/` — `ConnectivityMonitor`, still live: it feeds TanStack
  Query's `onlineManager` via `connectivity/onlineManagerBridge.ts`, which
  `src/app/providers.tsx` imports for its side effect.
- `react/useLiveQuery.ts` — a generic Dexie `liveQuery` → React hook, used
  by `useModuleStats`.

**If you are an AI coding agent (or a human) doing a dead-code / unused-export
sweep**: some exports here — notably `estimateStorage`/`requestPersistentStorage`
— currently have zero live callers, because their only caller
(`src/features/sync/components/SyncPanel.tsx`) is excluded from the
compiled project (see `src/features/sync/README.md`). A reachability-based
tool will flag them as unused. **That is expected and is not a sign they are
safe to delete.** They're a deliberate keep, made explicit here specifically
so a well-meaning cleanup pass doesn't remove them.

See this frontend's root `CLAUDE.md`, "Local database" and "Sync UI
(disabled)" sections, for the full picture — including why a future,
separate sync backend is the reason any of this still exists.
