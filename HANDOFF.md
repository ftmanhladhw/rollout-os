# HANDOFF — start here

One-file orientation for picking up **Rollout OS** in a new session, on a new machine, or with a different Claude account. If you read nothing else, read this, then [`CLAUDE.md`](./CLAUDE.md).

## What this is

Rollout OS — a generalized **rollout & delivery command center** (plan, track, and govern multi-tenant software rollouts from a single source of truth). Greenfield product. The Amazon CSR programme was the **design partner only** — never hardcode Amazon/CSR/mGrant/mForm specifics into the product; those are config/seed data.

## Current status (as of this handoff)

**Application architecture only — no product features or domain models yet.**

- ✅ Next.js 15 app architecture in place and building (`main` is green-verified).
- ✅ Product docs **01–07 populated**; **08–13 are placeholders**.
- ⬜ No features, no Prisma models, no shadcn components added yet.

## Where the context lives

| Read this                              | For                                                                              |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| [`CLAUDE.md`](./CLAUDE.md)             | Project brain: what it is, stack, structure, workflow rules                      |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Code architecture: stack, folder layout, conventions                             |
| [`docs/01`–`docs/07`](./docs)          | Product thinking: manifesto, thesis, vision, architecture spec, IA, PRD, UX spec |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Branch/PR workflow + commit conventions                                          |

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

> Read `CLAUDE.md`, `ARCHITECTURE.md`, and everything in `docs/` to load full context. This is Rollout OS — a greenfield Next.js 15 app; the application architecture is complete but no features or domain models exist yet. Summarize the current state and the intended next steps, then wait for my instruction.

## Working rules (enforced)

- **Branch → PR → merge.** No direct pushes to `main` (a safety hook blocks `git push …main/master` and force-pushes).
- **Conventional Commits** required (commit-msg hook + CI). Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.
- Before pushing: `npm run format:check && npm run lint && npm run typecheck && npm run build`.
- CI (GitHub Actions) runs lint, format, type-check, and `next build` on Node 22 & 24. Runners are often slow to start — a "queued" run is normal, not a failure.

## Likely next steps

1. **Doc 08 — Design System** (grid, spacing, type, components, states) — the UX spec (doc 07) explicitly tees this up as the next artifact.
2. Then the **Prisma domain models** from the Architecture Specification (Organization → Rollout → Programme → Workstream → Milestone → Task, plus RAID/knowledge/people), and the first shadcn/ui components.

Nothing is stranded in any past chat — this repo is the single source of truth.
