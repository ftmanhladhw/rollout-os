# Database Design — Rollout OS

**Version:** 1.0 · Approved 2026-07-09
Derived from the [Architecture Specification](./04_architecture_specification.md) (domain model, universal metadata, domain rules), the [PRD](./06_prd_mvp.md) (MVP modules, release plan), and the [IA](./05_information_architecture.md) (views, search, notifications).

Implementation: `prisma/schema.prisma` (source of truth for tables/columns/indexes) + SQL migrations in `prisma/migrations/` (RLS policies, helper functions). This document records the **decisions and their reasons** — the things the schema file can't say.

---

## Cross-cutting decisions

### 1. Primary keys — `uuid` v4 (`gen_random_uuid()`) everywhere

Matches `auth.users`/`profiles`, doesn't leak row counts, safe for distributed/DB-side inserts. DB-side default (not Prisma-side) so raw SQL inserts (triggers, seeds) behave identically.

### 2. `rollout_id` denormalized onto every operational table

Domain Rule 1: everything belongs to one rollout. A task's rollout is derivable through Milestone → Workstream → Programme → Rollout, but carrying `rollout_id` directly buys: single-join RLS policies, cheap cross-cutting views (Phase / Risk / Timeline / Person), no 4-way joins on list pages. **Consistency (task.rollout_id = task.milestone.workstream.programme.rollout_id) is enforced in the service layer.** This is the schema's one deliberate denormalization.

### 3. Universal metadata — a repeated column block

Doc 04 mandates ID · Name · Description · Status · Owner · Priority · Visibility · Tags · Phase · audit fields on every entity. Each operational table repeats the block (Prisma has no mixins; repetition is explicit and greppable):

`id · name · description · status (lifecycle_status) · priority · visibility · tags text[] · owner_id → stakeholders · phase_id → phases · created_by/updated_by uuid · created_at/updated_at · deleted_at`

**Documented deviations:**

- **Task** has `assignee_id` instead of `owner_id` — a task's owner IS its assignee (PRD §7 capabilities); two person-fields would be duplicative.
- **People tables** (stakeholders, teams, partners) and **config tables** (phases, readiness_dimensions) carry a reduced block — status/priority/phase on a person or a phase is meaningless.
- **Risk `owner_id` is NOT NULL** (Domain Rule 6: every risk has an owner).
- **Decision `affects_entity_type/affects_entity_id` are NOT NULL** (Domain Rule 7).

### 4. Soft delete — `deleted_at`, distinct from `archived`

- `archived` = lifecycle end-state: visible, intentional, part of the rollout's story.
- `deleted_at IS NOT NULL` = mistake recovery: invisible everywhere.

All queries and RLS SELECT policies filter `deleted_at IS NULL`. A Prisma client extension (to be added with the first feature code) auto-filters reads and converts `delete` → `update deleted_at`. Hard deletion only via a future retention job. **Exceptions (hard delete):** pure joins (`meeting_participants`, `team_members` — nothing to recover), `organization_members` (revoking access must be immediate and unambiguous), and append-only tables (`activity_log`).

### 5. Two kinds of person — `profiles` vs `stakeholders`

A **profile** is an authentication identity. A **stakeholder** is a rollout participant who may never log in (client sponsors, partner staff). Therefore:

- `owner_id` / `assignee_id` / `approver_id` / participants → **stakeholders** (work can be owned by someone without an account).
- `created_by` / `updated_by` / `actor_id` / `recipient_id` → **profiles** (only users act in the system).
- `stakeholders.profile_id` (nullable) joins the two when the person has an account.

### 6. Audit columns without FK — deliberate

`created_by`/`updated_by` are plain uuids (from `auth.uid()`), **no FK, no Prisma relation**. They are audit metadata, not navigable domain relationships; an FK would force SET NULL on user deletion and erase history, and Prisma relations would add ~40 back-relation fields to `Profile`. Values are written server-side only.

### 7. Enums vs rows

The terminology layer relabels **display labels**, never stored values. Stable value-sets are Postgres enums (`lifecycle_status`, `priority`, `health`, `readiness_status`, `visibility`, `org_role`, `experience_profile`, `risk_level`, `document_type`, `update_type`, `dependency_type`, `entity_type`, `activity_verb`, `notification_type`). **Configurable sets are rows**: `phases` (8 doc-04 defaults seeded per rollout) and `readiness_dimensions` (7 defaults seeded per rollout) — configuration, not schema, per the design-partner hard rule.

### 8. Polymorphic references — `entity_type` enum + uuid, no FK

Used by decisions (`affects_*`), dependencies (`from_*`/`to_*`), activity_log, and notifications. The alternative — one nullable FK per possible target — is ~10 nullable columns per table plus a migration for every new entity. Trade-off accepted: **no DB-level referential integrity on these pairs; the service layer validates targets.**

### 9. Name uniqueness on soft-deleted config tables — app-enforced

A DB `UNIQUE (rollout_id, name)` on `phases`/`readiness_dimensions` would collide with soft-deleted rows (a partial unique index can't be expressed in Prisma and would drift). The app enforces live-row uniqueness.

## Entity inventory (27 tables)

| Group               | Tables                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| Identity & tenancy  | `profiles` (pre-existing) · `organizations` · `organization_members`                                         |
| Structural backbone | `rollouts` · `programmes` · `workstreams` · `phases` · `readiness_dimensions`                                |
| Operations          | `milestones` · `tasks` · `risks` · `issues` · `decisions` · `dependencies` · `action_items` · `deliverables` |
| Knowledge           | `documents` · `meetings` · `meeting_participants` · `notes` · `updates`                                      |
| People              | `stakeholders` · `teams` · `team_members` · `partners`                                                       |
| System surfaces     | `activity_log` · `notifications`                                                                             |

Approved scope calls (2026-07-09): **deliverables in** (doc 04 entity; PRD §7 omission treated as oversight) · **notifications in** (produced from Release 4) · **templates out** (undefined in the docs; post-MVP).

Field-level detail lives in `prisma/schema.prisma` — it is the single source of truth for columns, types, and indexes; this doc does not duplicate it.

## Relationship map

```
organizations 1─* organization_members *─1 profiles 1─0..1 stakeholders
organizations 1─* rollouts 1─* programmes 1─* workstreams 1─* milestones 1─* tasks
rollouts 1─* phases                     (dimension: operational rows may reference one)
rollouts 1─* readiness_dimensions
rollouts 1─* {risks, issues, decisions, dependencies, action_items, deliverables,
              documents, meetings, notes, updates, stakeholders, teams, partners,
              activity_log, notifications}
meetings *─* stakeholders   (meeting_participants)
teams    *─* stakeholders   (team_members)
action_items *─0..1 tasks   (conversion keeps the audit trail)
decisions / dependencies ─(polymorphic)→ any operational entity
```

**FK delete behavior:** structure chain `RESTRICT` (deletion is soft anyway; a hard delete must be deliberate, bottom-up) · joins `CASCADE` · optional refs (`phase_id`, `workstream_id`, `assignee_id`, …) `SET NULL` · `activity_log`/`notifications` → rollout `CASCADE` (derived data may die with the workspace).

## Index strategy

1. Every FK column is indexed (Postgres does not auto-index FKs).
2. Composites for known hot paths: `tasks (assignee_id, status, due_date)` (My Tasks) · `tasks/risks/issues (rollout_id, status)` (Operations lists, Overview widgets) · `milestones (rollout_id, due_date)` (Timeline) · `activity_log (rollout_id, created_at DESC)` (feed) · `notifications (recipient_id, read_at)` (unread).
3. GIN on every `tags` column.
4. Uniques: `organizations.slug` · `organization_members (organization_id, profile_id)` · `meeting_participants` / `team_members` pairs · `action_items.converted_task_id`.
5. **Search** (PRD target <1s): deferred — rollout-scoped `ILIKE` over indexed names is fine at MVP volume; add `pg_trgm`/tsvector when real data shows it's needed.

All indexes are declared in the Prisma schema (no hand-added SQL indexes) so future `prisma migrate dev` runs never see drift.

## RLS strategy

**Tenant isolation is the database's job; fine-grained permissions are the app's job** (doc 04: RBAC is an implementation detail under the experience layer).

- Helper `private.is_org_member(org_id)` — SECURITY DEFINER, checks `organization_members` for `auth.uid()`.
- `organizations` / `organization_members` / `rollouts`: SELECT for org members.
- Every rollout-scoped table: one policy shape, reused —
  `deleted_at IS NULL AND EXISTS (SELECT 1 FROM rollouts r WHERE r.id = rollout_id AND private.is_org_member(r.organization_id))`.
- `notifications`: recipient-only (`recipient_id = auth.uid()`).
- **SELECT-only policies.** All mutations go through the app layer (server actions → Prisma as `postgres`, which bypasses RLS); client roles (PostgREST `anon`/`authenticated`) get no INSERT/UPDATE/DELETE policies at all. This keeps the write path single and auditable.
- Client-profile hiding (`visibility = 'client'`) is app-layer in MVP; the column exists so it can be pushed into RLS later without a migration.

## Migration approach

A single migration (`init_domain_schema`) creates all 27 tables, sectioned by release in comments. The originally proposed four-per-release split was dropped for a concrete reason: **cross-release FKs** (`action_items` (R2) → `meetings` (R3)) would force either forward-references or awkward `ALTER TABLE` add-ons, and since no database is deployed yet, all four would apply in one `migrate deploy` anyway. Release phasing governs **feature code**, not empty tables.

## Future extensions (kept open, not built)

Portfolio (doc 04) → `rollouts` already hang off `organizations`; a `portfolios` grouping table slots in without breaking anything. OKRs/KPIs/budget → new tables referencing `rollouts`. Health/readiness engines → the manual fields become computed columns/materialized views; the stored shape doesn't change.
