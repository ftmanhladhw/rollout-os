# Rollout OS

> A generalized rollout & delivery command center — plan, track, and govern multi-tenant software rollouts from a single source of truth.

Rollout OS is a domain-agnostic platform for running **staggered, multi-tenant software rollouts**: standing up a product across many teams, partners, or customers, where each unit progresses independently through a defined delivery lifecycle. It generalizes the "one tracker → everything derived" operating model into a reusable product.

Core ideas the product is built around:

- **A configurable rollout lifecycle** — a definable state machine (e.g. Preparation → Onboarding → Training → Migration → Pilot → Go Live → Hypercare → Stabilization → BAU), with gates between stages.
- **A rollout unit grid** — one row per _Workstream × Tenant_, each advancing independently.
- **Single source of truth** — status lives in exactly one place; dashboards, roadmaps, and reports are pure projections of it.
- **A unified action register** — actions, issues, risks, and decisions in one place with SLA-driven prioritization.
- **A governance & cadence engine** — configurable meeting rhythms, escalation tiers, and exit criteria.
- **A terminology layer** — every label (tenant, workstream, stage) is relabelable per vertical, so no domain concept is hardcoded.

> **Status: application architecture only.** The full technology stack and project structure are in place, but no product features or domain models are built yet. See [ARCHITECTURE.md](./ARCHITECTURE.md).

## Tech stack

| Layer           | Choice                                                                                        |
| --------------- | --------------------------------------------------------------------------------------------- |
| Framework       | Next.js 15 (App Router, React 19)                                                             |
| Language        | TypeScript (strict)                                                                           |
| Styling         | Tailwind CSS v4 + shadcn/ui + lucide-react                                                    |
| Server state    | TanStack Query · TanStack Table                                                               |
| Forms           | React Hook Form + Zod                                                                         |
| ORM / DB / Auth | Prisma · Supabase (Postgres + Auth)                                                           |
| Hosting         | Vercel                                                                                        |
| Quality         | ESLint (eslint-config-next) · Prettier · Husky · lint-staged · commitlint · GitHub Actions CI |
| Node            | >= 20 (see `.nvmrc`)                                                                          |

## Getting started

```bash
nvm use                 # Node 20 (see .nvmrc)
npm install             # installs deps + generates the Prisma client
cp .env.example .env    # then fill in Supabase / database values
npm run dev             # http://localhost:3000
```

## Scripts

| Script                 | Purpose                         |
| ---------------------- | ------------------------------- |
| `npm run dev`          | Start the Next.js dev server    |
| `npm run build`        | Production build (`next build`) |
| `npm run start`        | Serve the production build      |
| `npm run lint`         | Run ESLint                      |
| `npm run typecheck`    | Type-check with `tsc`           |
| `npm run format`       | Format with Prettier            |
| `npm run format:check` | Verify formatting (used in CI)  |
| `npm run db:generate`  | Generate the Prisma client      |
| `npm run db:migrate`   | Run a Prisma dev migration      |
| `npm run db:studio`    | Open Prisma Studio              |

## Contributing

Commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification — this is enforced locally by a commit-msg hook and again in CI. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow, commit format, and quality gates.

## License

[MIT](./LICENSE) © Rollout OS Contributors
