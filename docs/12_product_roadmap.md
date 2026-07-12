# Product Roadmap

Direction, not a dated commitment. The roadmap is intentionally short — Rollout OS ships in thin, testable slices, and each slice lands as its own PR with tests and a docs update.

> What is _deliberately deferred_ (AI, multi-tenant grid at scale, in-product lifecycle editing) and **why** is recorded in the [decision log](./13_decision_log.md) — read that alongside this.

## Now — MVP (done)

The MVP is feature-complete and running on live Supabase:

- Authentication: email/password, magic link, password reset; default-deny middleware; auth rate limiting; private storage bucket.
- Domain schema: 27 tables, Row-Level Security on every one, Prisma-owned migrations.
- Authorization: 7 org-scoped roles + super-admin, static permission matrix, experience profiles separate from RBAC.
- Onboarding: create organization → create first rollout (seeds phases + readiness dimensions) → Command Center.
- Command Center + all seven lifecycle modules (Programs, Workstreams, Operations, Knowledge, Timeline, Reports, Administration), wired to live data.
- Audit trail on every mutation; report-only CSP; Vercel deploy prep.

## Next — hardening & first deploy

Small, mostly operational, needed before real users:

1. **First Vercel deploy** — prep is code-complete; follow [SETUP.md §8](../SETUP.md) (apply the pending `rate_limits` migration first).
2. **Custom SMTP** for auth email — the built-in Supabase sender was unreliable in verification.
3. **Promote CSP** from report-only to enforcing (nonce-based `script-src`).
4. **Design-system pass** ([docs/08](./08_design_system.md)) — replace remaining shadcn defaults with committed tokens.
5. Dashboard hygiene: min password length, leaked-password protection, redirect allowlist.

## Later — product depth

- **Organization invite flow.** Today a second user can only self-signup into their _own_ org; joining an existing org needs invites.
- **In-product lifecycle & terminology editing.** Stages, gates, and labels are configuration in the schema; expose an editor so an admin can adapt the product to a new vertical without a migration.
- **The rollout-unit grid at scale** — _Workstream × Tenant_ as a first-class, filterable grid.
- **Report exports & scheduled snapshots.**
- **Governance cadence engine** — meeting rhythms, escalation tiers, exit-criteria gates as live objects.

## Exploratory

- **AI assistance** (summaries, risk surfacing, draft updates) — _intentionally excluded from v1_. The reasoning, and the bar it must clear to enter the product, are in the [decision log](./13_decision_log.md).

---

_Sequencing rule: nothing in "Later" starts until "Next" is deployed and stable. Each item is a PR, not a milestone._
