# Authentication & Authorization — Rollout OS

**Version:** 1.0 · Approved 2026-07-10
Grounded in [doc 04](./04_architecture_specification.md) Part IV (Experience Architecture, Permission Model) and [doc 06](./06_prd_mvp.md) §9/§15. Database conventions: [doc 09](./09_database_design.md).

Implementation: `src/lib/authz/` (permission matrix + helpers) · `src/app/(auth)/` (flows) · `prisma/migrations/…_auth_roles` (schema).

---

## Authentication

| Capability              | Mechanism                                                                                                                                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Email/password          | Supabase Auth; signup requires email confirmation                                                                                                                                                           |
| Magic link              | `signInWithOtp`, existing accounts only                                                                                                                                                                     |
| Password reset          | `/forgot-password` → recovery email → `/auth/confirm?type=recovery` → `/reset-password`                                                                                                                     |
| Email link verification | Single `token_hash` flow through `/auth/confirm` for all three email types (signup, magiclink, recovery) — templates in SETUP.md §3                                                                         |
| Sessions                | Cookie-based (`@supabase/ssr`): ~1h access token, rotating refresh token, refreshed every request in middleware; default-deny route protection (public: `/login`, `/signup`, `/forgot-password`, `/auth/*`) |
| Anti-enumeration        | `/forgot-password` always answers "if an account exists…"                                                                                                                                                   |

## Authorization — three separated layers

> Doc 04: _Permissions define what a user can do. Experience Profiles define how the product behaves. RBAC is an implementation detail underneath the experience layer._

```
Layer 1  RLS (database)        — tenant isolation only (private.is_org_member). Never role-aware.
Layer 2  Roles → permissions   — WHAT you can do. Checked server-side on every action/query.
Layer 3  Experience Profile    — HOW the UI behaves. Never a security boundary.
```

### Roles (Layer 2)

**Platform scope:** `profiles.is_super_admin` — operators only, settable exclusively via SQL/service role, bypasses the matrix.

**Organization scope:** `organization_members.role` (`member_role` enum):
`org_admin · consultant · product_manager · programme_manager · engineering · client · executive`

The permission matrix is a **static, code-reviewed constant** in `src/lib/authz/permissions.ts` — not database configuration (MVP principle: opinionated defaults; a matrix in code cannot be corrupted at runtime). Summary:

| Action                 | org_admin | consultant | product/programme_manager | engineering | executive | client |
| ---------------------- | :-------: | :--------: | :-----------------------: | :---------: | :-------: | :----: |
| `org:manage`           |     ✓     |     —      |             —             |      —      |     —     |   —    |
| `rollout:create`       |     ✓     |     ✓      |             —             |      —      |     —     |   —    |
| `rollout:manage`       |     ✓     |     ✓      |             ✓             |      —      |     —     |   —    |
| `structure:manage`     |     ✓     |     ✓      |             ✓             |      —      |     —     |   —    |
| `operations:manage`    |     ✓     |     ✓      |             ✓             |      —      |     —     |   —    |
| `operations:execute`   |     ✓     |     ✓      |             ✓             |      ✓      |     —     |   —    |
| `assigned:update`      |     ✓     |     ✓      |             ✓             |      ✓      |     —     |   —    |
| `knowledge:manage`     |     ✓     |     ✓      |             ✓             |      —      |     —     |   —    |
| `knowledge:contribute` |     ✓     |     ✓      |             ✓             |      ✓      |     —     |   —    |
| `reports:generate`     |     ✓     |     ✓      |             ✓             |      —      |     ✓     |   —    |
| `internal:view`        |     ✓     |     ✓      |             ✓             |      ✓      |     ✓     |   —    |

Decisions on record:

- **product_manager ≡ programme_manager in permissions** — doc 04 defines them as one profile; they are distinct roles (labels, org charts) with identical capabilities until the product docs define a difference.
- **executive = read-everything + reports, write-nothing** — health/readiness are _set_ by the delivery side, _read_ by leadership.
- **client holds no actions** — the absence of `internal:view` makes the query layer filter to `visibility = 'client'` rows (column exists on every table; pushable into RLS later without a migration).
- **Roles are org-level, not per-rollout (MVP)** — one membership, one role. Extension point: a `rollout_members` override table, checked before the org role, if multi-rollout orgs need per-rollout roles.

### Enforcement (Layer 2 mechanics)

`getAuthzContext(organizationId)` resolves `{userId, isSuperAdmin, role}` per request (React-cached). `can(ctx, action)` answers; `assertCan(ctx, action)` throws — used at the top of every mutating server action. A denied mutation throws rather than returning: it is a bug or an attack, not a user flow.

**The denied path has two surfaces**, matching the two kinds of denial:

- **Denied view → `/unauthorized`.** `requireCan(ctx, action)` guards a page/layout render and redirects to the `/unauthorized` page (inside the app shell) when the role can't view the resource. A denied view _is_ a user flow — someone opened a link their role can't see.
- **Denied mutation → error boundary.** `assertCan` throws a typed `ForbiddenError`; it surfaces at the nearest `error.tsx` (`src/app/(app)/error.tsx`). Production strips server error messages from the client (digest only), so the boundary copy is generic by design — server logs carry the real error.

Signed-out users hit neither: default-deny middleware redirects them to `/login` before any page code runs.

**One deliberately unguarded mutation: organization creation.** The matrix is org-scoped and no organization exists yet at that point — any authenticated user may found one and becomes its `org_admin` in the same atomic create (onboarding step 1). Every other mutation starts with `assertCan`.

### Experience Profiles (Layer 3)

`organization_members.experience_profile` (5 values, doc 04): `executive · programme_manager · engineering · consultant · client`. Initialized from the role via `DEFAULT_EXPERIENCE_PROFILE`, independently changeable. Controls landing page, navigation, visible modules, widgets, default filters — to be consumed by `src/config/experience-profiles.ts` when UI modules exist. **Never consulted in a permission check.**

| Role                                     | Default profile   |
| ---------------------------------------- | ----------------- |
| org_admin, consultant (and super admins) | consultant        |
| product_manager, programme_manager       | programme_manager |
| engineering                              | engineering       |
| executive                                | executive         |
| client                                   | client            |
