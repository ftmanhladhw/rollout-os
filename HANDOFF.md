# HANDOFF — start here

One-file orientation for picking up **Rollout OS** in a new session, on a new machine, or with a different Claude account. If you read nothing else, read this, then [`CLAUDE.md`](./CLAUDE.md).

## What this is

Rollout OS — a generalized **rollout & delivery command center** (plan, track, and govern multi-tenant software rollouts from a single source of truth). Greenfield product. The Amazon CSR programme was the **design partner only** — never hardcode Amazon/CSR/mGrant/mForm specifics into the product; those are config/seed data.

## Current status (as of this handoff)

**Platform layer complete; product build underway — shell, onboarding, Command Center IA, and modules 1–2 of 7 (Programs, Workstreams) are live on `main`.**

- ✅ Next.js 15 app architecture in place and building (`main` is green-verified).
- ✅ Supabase auth wired end-to-end (email/password + magic link + **password reset**, default-deny middleware, private storage bucket). Platform runbook: [`SETUP.md`](./SETUP.md).
- ✅ **Supabase project live** (ref `jamxiphauthjcljyihmr`): migrations applied, `setup.sql` run, and every auth flow verified in the real app (signup → confirm → sign-out → password login → magic link → password reset; signup trigger auto-creates `profiles`).
- ✅ Full MVP domain schema: 27 tables with RLS, in `prisma/schema.prisma` + migrations. Design record: [`docs/09`](./docs/09_database_design.md).
- ✅ **Authorization model**: 7 org-scoped roles (`member_role`) + super-admin flag; static permission matrix with `can()`/`assertCan()` in `src/lib/authz/`; experience profiles kept separate from RBAC. Denied-path surfaces: `requireCan()` → `/unauthorized` page for denied views, typed `ForbiddenError` → `(app)/error.tsx` boundary for denied mutations. Design record: [`docs/14`](./docs/14_auth_authorization.md).
- ✅ Product docs **01–07, 09, 10, and 14 populated** ([`docs/10`](./docs/10_api_specification.md) is the living server-action API spec, growing per module); **08 and 11–13 are placeholders**.
- ✅ **Application shell** (`src/app/(app)` + `src/components/shell/`): responsive sidebar (mobile nav sheet), header with breadcrumbs, global-search placeholder (⌘K palette comes later), user menu (settings entry, theme light/dark/system via next-themes, sign-out), and placeholder pages for the seven lifecycle destinations + settings. Verified end-to-end in the real app (see `.claude/skills/verify/SKILL.md`).
- ✅ **Onboarding** (`src/app/onboarding/` + gate in the `(app)` layout): first login → create organization (founder becomes `org_admin` atomically) → create first rollout (seeds the 8 doc-04 phases + 7 readiness dimensions from `src/config/rollout-defaults.ts`) → Command Center. Both steps idempotent; org creation is the one deliberately unguarded mutation (matrix is org-scoped, no org exists yet — recorded in docs/14).
- ✅ **Command Center IA** (`src/components/command-center/`): vital-signs strip (Health · Progress · Readiness · Go Live) + five sections (Today's Priorities, Blockers, Upcoming Milestones, My Work, Recent Activity), each linking to its owning module. Layout/UX real; **content is placeholder** (`placeholder-data.ts`, disclosed in the UI) until each module lands. Semantic status tokens (`--status-good/warning/critical`) in globals.css — color never carries meaning without a text label (docs/07 ch.6).
- ✅ **Programs module** (first of the seven; `src/app/(app)/programs/`): list + quick-create drawer + detail page (first instance of the universal detail template) + edit + archive (soft delete). Rollout-scoped queries, client-visibility filtering, `assertCan('structure:manage')` on every mutation. **Vitest wired into CI** (`npm test`): permission matrix pinned as executable spec + schema tests per module. Server-action conventions now recorded in [`docs/10`](./docs/10_api_specification.md).
- ✅ **Workstreams module** (2 of 7; `src/app/(app)/workstreams/`): list with programme + manual progress meter, create drawer with programme picker (Domain Rule 2 validated server-side, `rollout_id` denormalized per docs/09 §2), detail/edit (incl. progress 0–100) + archive. Programme detail now embeds its live workstreams with preselected quick-create.
- ✅ **Operations module** (3 of 7; `src/app/(app)/operations/`): one tabbed daily workspace — Tasks · Milestones · Risks · Issues · Decisions (PRD §18 Release 2 set; Dependencies/Action Items marked as a later slice). Per-entity guards from the docs/14 matrix; Domain Rules 3/4/6/7 enforced server-side (risk owner via `getOrCreateSelfStakeholder`, decisions affect the rollout). Shared `EntityDrawer` powers all create/edit drawers.
- ✅ **Knowledge module** (4 of 7; `src/app/(app)/knowledge/`): one tabbed hub — Documents · Meetings · Notes · Updates (PRD §18 Release 3 set; meeting participants/actions marked as a later slice). Documents are referenced, never duplicated (Domain Rule 9): `url` required, restricted to http(s) so stored links are safe to render as hrefs. Guards split per docs/14: create doc/note = `knowledge:contribute`, everything else = `knowledge:manage`. `EntityDrawer` + universal field specs promoted to `src/components/` (shared with Operations).
- ⬜ Remaining modules in order: Timeline → Reports → Administration. Each: build → tests → docs → PR.
- ⚠️ **Supabase built-in SMTP did not deliver** during verification (auth links were verified via admin `generateLink` instead). Configure custom SMTP before any real users need auth emails. Also confirm the dashboard email templates match SETUP.md §3 (incl. the Reset Password template).

## Where the context lives

| Read this                                                                                | For                                                                              |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [`CLAUDE.md`](./CLAUDE.md)                                                               | Project brain: what it is, stack, structure, workflow rules                      |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md)                                                   | Code architecture: stack, folder layout, conventions                             |
| [`docs/01`–`docs/07`](./docs)                                                            | Product thinking: manifesto, thesis, vision, architecture spec, IA, PRD, UX spec |
| [`docs/09`](./docs/09_database_design.md) · [`docs/14`](./docs/14_auth_authorization.md) | Implemented designs: database schema · auth & authorization                      |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md)                                                   | Branch/PR workflow + commit conventions                                          |

> Claude's local **memory** notes live at `~/.claude/projects/…-rollout-os/memory/` — they are machine-local, not in this repo. On the same machine they load automatically; on a new machine, this repo's docs carry the essential context.

## Get set up

```bash
nvm use                 # Node 22 (required; see .nvmrc)
npm install             # installs deps + generates the Prisma client
cp .env.example .env    # then fill in Supabase / database values
npm run dev             # http://localhost:3000
```

- Repo: `ftmanhladhw/rollout-os` (**private**). GitHub access is via the `gh` CLI (`gh auth setup-git`), independent of your Claude account.
- Node **≥ 22** is required (a Supabase dependency mandates it; `engine-strict` will fail `npm ci` on older Node).

## Kickoff prompt for a fresh session

> Read `CLAUDE.md`, `ARCHITECTURE.md`, `docs/10`, and `docs/14` to load context. This is Rollout OS — a Next.js 15 app on live Supabase. Platform layer, app shell, onboarding, Command Center IA, and the Programs + Workstreams modules are done (see HANDOFF "Current status"); modules are being built incrementally in the order Operations → Knowledge → Timeline → Reports → Administration, each with tests (Vitest, in CI), a docs/10 update, and its own PR. Summarize the current state and wait for my instruction.

## Working rules (enforced)

- **Branch → PR → merge.** No direct pushes to `main` (a safety hook blocks `git push …main/master` and force-pushes).
- **Conventional Commits** required (commit-msg hook + CI). Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.
- Before pushing: `npm run format:check && npm run lint && npm run typecheck && npm test && npm run build`.
- CI (GitHub Actions) runs lint, format, type-check, **Vitest**, and `next build` on Node 22 & 24. Runners are often slow to start — a "queued" run is normal, not a failure.
- Every module lands as its own PR: build → verify end-to-end (`.claude/skills/verify/SKILL.md`) → tests → docs/10 + HANDOFF update → PR.

## Likely next steps

1. **Remaining modules** — Timeline → Reports → Administration, one PR each (build → tests → docs/10 + HANDOFF → PR).
2. **Wire the Command Center** sections to live data as their owning modules land (placeholder data is disclosed in the UI until then).
3. **Doc 08 — Design System** (grid, spacing, type, components, states) — the shell currently leans on shadcn defaults.
4. Later platform chores: org/rollout editing + soft-delete Prisma extension (docs/09), **custom SMTP** for auth emails (built-in sender unreliable), **Vercel deployment** (SETUP.md §8).

Nothing is stranded in any past chat — this repo is the single source of truth.
