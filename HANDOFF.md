# HANDOFF — start here

One-file orientation for picking up **Rollout OS** in a new session, on a new machine, or with a different Claude account. If you read nothing else, read this, then [`CLAUDE.md`](./CLAUDE.md).

## What this is

Rollout OS — a generalized **rollout & delivery command center** (plan, track, and govern multi-tenant software rollouts from a single source of truth). Greenfield product. The Amazon CSR programme was the **design partner only** — never hardcode Amazon/CSR/mGrant/mForm specifics into the product; those are config/seed data.

## Current status (as of this handoff)

**Platform layer complete (architecture + auth + schema + authz) — no product features yet.**

- ✅ Next.js 15 app architecture in place and building (`main` is green-verified).
- ✅ Supabase auth wired end-to-end (email/password + magic link + **password reset**, default-deny middleware, private storage bucket). Platform runbook: [`SETUP.md`](./SETUP.md).
- ✅ **Supabase project live** (ref `jamxiphauthjcljyihmr`): migrations applied, `setup.sql` run, and every auth flow verified in the real app (signup → confirm → sign-out → password login → magic link → password reset; signup trigger auto-creates `profiles`).
- ✅ Full MVP domain schema: 27 tables with RLS, in `prisma/schema.prisma` + migrations. Design record: [`docs/09`](./docs/09_database_design.md).
- ✅ **Authorization model**: 7 org-scoped roles (`member_role`) + super-admin flag; static permission matrix with `can()`/`assertCan()` in `src/lib/authz/`; experience profiles kept separate from RBAC. Denied-path surfaces: `requireCan()` → `/unauthorized` page for denied views, typed `ForbiddenError` → `(app)/error.tsx` boundary for denied mutations. Design record: [`docs/14`](./docs/14_auth_authorization.md).
- ✅ Product docs **01–07, 09, and 14 populated**; **08 and 10–13 are placeholders**.
- ✅ **Application shell** (`src/app/(app)` + `src/components/shell/`): responsive sidebar (mobile nav sheet), header with breadcrumbs, global-search placeholder (⌘K palette comes later), user menu (settings entry, theme light/dark/system via next-themes, sign-out), and placeholder pages for the seven lifecycle destinations + settings. Verified end-to-end in the real app (see `.claude/skills/verify/SKILL.md`).
- ✅ **Onboarding** (`src/app/onboarding/` + gate in the `(app)` layout): first login → create organization (founder becomes `org_admin` atomically) → create first rollout (seeds the 8 doc-04 phases + 7 readiness dimensions from `src/config/rollout-defaults.ts`) → Command Center. Both steps idempotent; org creation is the one deliberately unguarded mutation (matrix is org-scoped, no org exists yet — recorded in docs/14).
- ✅ **Command Center IA** (`src/components/command-center/`): vital-signs strip (Health · Progress · Readiness · Go Live) + five sections (Today's Priorities, Blockers, Upcoming Milestones, My Work, Recent Activity), each linking to its owning module. Layout/UX real; **content is placeholder** (`placeholder-data.ts`, disclosed in the UI) until each module lands. Semantic status tokens (`--status-good/warning/critical`) in globals.css — color never carries meaning without a text label (docs/07 ch.6).
- ⬜ No further feature code — module pages beyond onboarding are empty-state placeholders; Programmes/Workstreams CRUD not started.
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

> Read `CLAUDE.md`, `ARCHITECTURE.md`, and everything in `docs/` to load full context. This is Rollout OS — a greenfield Next.js 15 app. The platform layer is complete (Supabase auth live and verified, 27-table domain schema with RLS, RBAC + experience-profile model in `src/lib/authz/`), but no product features exist yet. Summarize the current state and the intended next steps, then wait for my instruction.

## Working rules (enforced)

- **Branch → PR → merge.** No direct pushes to `main` (a safety hook blocks `git push …main/master` and force-pushes).
- **Conventional Commits** required (commit-msg hook + CI). Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.
- Before pushing: `npm run format:check && npm run lint && npm run typecheck && npm run build`.
- CI (GitHub Actions) runs lint, format, type-check, and `next build` on Node 22 & 24. Runners are often slow to start — a "queued" run is normal, not a failure.

## Likely next steps

1. **Doc 08 — Design System** (grid, spacing, type, components, states) — the UX spec (doc 07) explicitly tees this up; the shell currently leans on shadcn defaults.
2. **Release 1 feature code** (PRD §18): Organization and Rollout _creation_ shipped with onboarding (incl. per-rollout seeding). Remaining: Programmes · Workstreams CRUD, editing/archiving for orgs and rollouts, the soft-delete Prisma extension (docs/09), and `assertCan()`/`requireCan()` guards as each surface lands (docs/14).
3. **Custom SMTP** for auth emails (built-in sender unreliable) and **Vercel deployment** (SETUP.md §8) once Release 1 has something to show.

Nothing is stranded in any past chat — this repo is the single source of truth.
