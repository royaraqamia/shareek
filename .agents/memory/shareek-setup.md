---
name: Shareek app setup
description: Architecture and key decisions for the Shareek Arabic ERP app.
---

## Stack
Next.js 15 App Router, Supabase (auth + RLS), Tailwind CSS v4, Zustand, pnpm workspace at `artifacts/shareek/`.
Workflow: "Shareek App" (port via $PORT). DB schema in Supabase, pushed via `pnpm --filter @workspace/db run push`.

## Auth pattern
- `getApprovedUser()` in `features/auth/actions.ts` — use this in every Server Action. Returns `{ success, user, organizationId, role, ... }`.
- `createAdminClient()` — only for admin panel ops and signup bootstrap. Regular session client for all per-user queries.
- Profile fetch in `getUser()` uses regular (session-scoped) Supabase client, not admin, so RLS applies.

## Offline sync
`useOfflineSync` hook in `utils/hooks/useOfflineSync.ts` handles online/offline detection and queue replay. Called from `AppInitializer.tsx`. Already implemented — do not re-implement.

## Key decisions
- All Server Actions scope queries with `.eq('organization_id', user.organizationId)` — no cross-org data leaks.
- `bulkDeleteTransactionsAction` fetches items first, computes stock delta, updates products, then deletes. Not fully atomic (no custom RPC) but correct.
- `revalidatePath` added to all mutation actions.
- `package-lock.json` removed from `artifacts/shareek/` — pnpm workspace uses `pnpm-lock.yaml` only.
