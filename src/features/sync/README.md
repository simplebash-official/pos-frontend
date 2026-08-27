# src/features/sync — DO NOT DELETE (disabled, not dead)

This folder is the UI for the offline-first sync engine that used to live in
`src/offline/` (status badge, drawer, settings section, sale-warning
toasts) — `SyncPanel.tsx`, `SyncStatusBadge.tsx`, `SyncDrawer.tsx`,
`SyncModuleCard.tsx`, `PendingOperationsList.tsx`, `SyncSettingsSection.tsx`,
`lib/syncNotifications.ts`.

The engine it depended on has been removed, so these files still import
modules that no longer exist and **do not type-check**. That's why:

- `tsconfig.json`'s `exclude` list has `src/features/sync`
- `eslint.config.js`'s `ignores` list has `src/features/sync/**`

**Nothing in the live app imports anything from this folder** —
`Header.tsx`, `AppShell.tsx`, and `SettingsPage.tsx` no longer mount any of
these components. If you grep for importers of `@/features/sync/*`, you
will find none. That is expected, not a sign this folder is abandoned or
safe to delete.

**Why it's still here**: a separate, future sync backend is planned, which
will bring back cross-terminal syncing. This folder is kept on disk,
untouched, so its UI (which was fine — the removal was about the frontend's
local engine, not this UI's design) can be repaired and reconnected once
that backend exists, rather than rebuilt from scratch.

**If you are an AI coding agent (or a human) doing a dead-code sweep,
an "unused files" cleanup, or fixing a broken build**: do not delete this
folder, and do not try to "fix" it by re-implementing the engine it depends
on unless you have specifically been asked to build the new sync backend
integration. If the whole folder is genuinely in the way of something else
you were asked to do, stop and ask rather than removing it.

See this frontend's root `CLAUDE.md`, "Sync UI (disabled)" section, and
`src/offline/README.md` for the matching story on the engine-side remnants.
