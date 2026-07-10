# API Specification

**Status:** Living document — grows one module at a time as Release 1 lands.

The MVP has no public HTTP API. The application's API is its **Next.js server
actions**, and this document records their conventions and contracts. When a
public API ships later, it inherits these semantics.

## Conventions (every server action)

1. **Zod re-validation first.** Client-side form validation is UX only; the
   action re-parses `input: unknown` with the same schema
   (`schemas.ts` beside the action). First issue message is returned as the
   form error.
2. **Authorization second.** `assertCan(ctx, action)` (docs/14) at the top of
   every mutation — except organization creation, the one documented
   exception. Denied mutation → typed `ForbiddenError` → error boundary.
3. **Rollout scoping on every write.** Mutations use
   `updateMany({ where: { id, rolloutId: <caller's rollout>, deletedAt: null } })`
   so a forged id can never touch another tenant's rows (`count === 0` →
   "not found", indistinguishable from a genuinely missing row). RLS
   backstops this at the database.
4. **Soft delete, never hard.** Archive sets `deletedAt` (docs/09); every
   read filters `deletedAt: null`. `archived` as a _lifecycle status_ is not
   user-settable — archival is the action.
5. **Visibility filtering on reads.** Callers without `internal:view`
   (client role) see `visibility = 'client'` rows only.
6. **Result contract.** Actions return `{ error: string }` for the form,
   `{ success: string }` for in-place saves, or redirect on
   create/archive/flow transitions.

## Onboarding (`src/app/onboarding/actions.ts`)

| Action                                      | Guard                                     | Effect                                                                                                                |
| ------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `createOrganization({ name })`              | authenticated only (documented exception) | Creates org + founding `org_admin` membership atomically; slug from name with collision retry → `/onboarding/rollout` |
| `createFirstRollout({ name, goLiveDate? })` | `rollout:create`                          | Creates rollout + seeds 8 phases and 7 readiness dimensions (`src/config/rollout-defaults.ts`) → `/`                  |

## Programmes (`src/app/(app)/programs/actions.ts`)

| Action                                                          | Guard              | Effect                                                                                             |
| --------------------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------- |
| `createProgramme({ name, description? })`                       | `structure:manage` | Creates programme in the caller's rollout → `/programs/[id]`                                       |
| `updateProgramme({ id, name, description?, status, priority })` | `structure:manage` | Rollout-scoped update of basics; `status` limited to `EDITABLE_LIFECYCLE_STATUSES` → `{ success }` |
| `archiveProgramme({ id })`                                      | `structure:manage` | Rollout-scoped soft delete (`deletedAt`) → `/programs`                                             |

Reads (list `/programs`, detail `/programs/[id]`) are server-component
queries: scoped to the caller's rollout, `deletedAt: null`, client-visibility
filtered; a foreign, archived, or invalid id is a 404 — never a leak.

## Testing

`npm test` (Vitest, in CI): the permission matrix is pinned as an executable
spec (`src/lib/authz/permissions.test.ts`) and every module's schemas get
validation tests beside them (`schemas.test.ts`). End-to-end flows are
exercised per the repo verify skill (`.claude/skills/verify/SKILL.md`).
