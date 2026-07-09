# CLAUDE.md — Rollout OS

Project guide for Claude Code sessions in this repo. Read this first.

## What this is

**Rollout OS** is a greenfield, domain-agnostic product for running **staggered, multi-tenant software rollouts** — standing up a product across many teams, partners, or customers, where each unit advances independently through a defined delivery lifecycle. It generalizes the "one tracker → everything derived" operating model into a reusable platform.

> **Status: architecture + auth infrastructure.** The Next.js app scaffold, tooling, and Supabase auth (email/password + magic link, RLS reference pattern via `profiles`, private storage bucket) are in place. No product features or **domain** models exist yet; `src/app/page.tsx` is still a placeholder (now auth-protected). Do not add feature code unless the task explicitly asks for it. Platform setup runbook: [SETUP.md](./SETUP.md).

## Core product concepts (the reusable model)

These are the pillars the product is built around. They are domain-agnostic by design:

- **Configurable rollout lifecycle** — a definable state machine (e.g. Preparation → Onboarding → Training → Migration → Pilot → Go Live → Hypercare → Stabilization → BAU), with gates between stages. Stages are configuration, not hardcoded.
- **Rollout unit grid** — one row per _Workstream × Tenant_, each advancing independently.
- **Single source of truth** — status lives in exactly one place; dashboards, roadmaps, and reports are pure projections of it.
- **Unified action register** — actions, issues, risks, and decisions in one place with SLA-driven prioritization.
- **Governance & cadence engine** — configurable meeting rhythms, escalation tiers, and exit criteria.
- **Terminology layer** — every label (tenant, workstream, stage) is relabelable per vertical, so no domain concept is hardcoded.

## Design partner ≠ product (hard rule)

The **Amazon CSR** implementation was the **design partner only** — the source we reverse-engineered the reusable rollout model from. **Never hardcode** Amazon / CSR / mGrant / mForm / specific programmes / partners / dates into the product. Anything domain-specific is **config or seed data**, not schema or code.

## Tech stack

**Next.js 15** (App Router, React 19) · **TypeScript** (strict) · **Tailwind CSS v4** + **shadcn/ui** + **lucide-react** · **TanStack Query** + **TanStack Table** · **React Hook Form** + **Zod** · **Prisma** + **Supabase** (Postgres + Auth) · **Vercel**. Quality: ESLint (`eslint-config-next`) · Prettier · Husky · lint-staged · commitlint · GitHub Actions CI. Node `>= 22` (see `.nvmrc`). Full detail in [ARCHITECTURE.md](./ARCHITECTURE.md).

**Status: auth infrastructure wired; no product features or domain models yet.** `prisma/schema.prisma` has only the `Profile` auth-companion model.

| Script                 | Purpose                              |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Next.js dev server                   |
| `npm run build`        | Production build (`next build`)      |
| `npm run typecheck`    | Type-check with `tsc`                |
| `npm run lint`         | ESLint                               |
| `npm run format`       | Prettier write                       |
| `npm run format:check` | Prettier check (CI)                  |
| `npm run db:*`         | Prisma: generate/push/migrate/studio |
| `db:migrate:deploy`    | Apply migrations (prod/CI)           |

### Where things live (see ARCHITECTURE.md)

`src/app` routes & layouts · `src/components/ui` shadcn primitives · `src/lib` non-UI logic (`db.ts` Prisma, `env.ts` Zod env, `supabase/` clients, `query/` TanStack) · `src/config` app config · `src/middleware.ts` Supabase session refresh · `prisma/schema.prisma` datasource (no models yet).

## Workflow & conventions (enforced)

- **Branch → PR → green CI → merge.** No direct pushes to `main`.
- Branch names: `feat/…`, `fix/…`, `docs/…`, `chore/…`.
- Commit messages **must** follow [Conventional Commits](https://www.conventionalcommits.org/) — enforced by the `commit-msg` hook locally and by commitlint in CI. Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Before pushing: `npm run format:check && npm run lint && npm run build` all pass.
- See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow.

## Environment notes

- A global safety-guard hook blocks literal `git push …main/master` and force-pushes — always work on a feature branch and merge via PR.
- `.next/` and `next-env.d.ts` are git-ignored; `package-lock.json` is committed.
- Environment variables are validated in `src/lib/env.ts` and documented in `.env.example`; never commit real secrets. CI builds with `SKIP_ENV_VALIDATION=true`.
- Repo: https://github.com/ftmanhladhw/rollout-os (private).
