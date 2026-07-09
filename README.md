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

> **Status: foundation only.** This repository currently contains the production tooling foundation. No application code has been written yet.

## Tech foundation

| Concern         | Tooling                                             |
| --------------- | --------------------------------------------------- |
| Language        | TypeScript (ESM, strict)                            |
| Linting         | ESLint 9 (flat config) + `typescript-eslint`        |
| Formatting      | Prettier                                            |
| Git hooks       | Husky                                               |
| Pre-commit      | lint-staged (ESLint + Prettier on staged files)     |
| Commit messages | Conventional Commits, enforced by commitlint        |
| CI              | GitHub Actions (lint, format check, build, commits) |
| Node            | >= 20 (see `.nvmrc`)                                |

## Getting started

```bash
# Use the pinned Node version
nvm use            # reads .nvmrc (Node 20)

# Install dependencies (also wires up Husky git hooks via `prepare`)
npm install
```

## Scripts

| Script                 | Purpose                               |
| ---------------------- | ------------------------------------- |
| `npm run build`        | Compile TypeScript (`tsc`) to `dist/` |
| `npm run typecheck`    | Type-check without emitting           |
| `npm run lint`         | Run ESLint over the repo              |
| `npm run lint:fix`     | ESLint with autofix                   |
| `npm run format`       | Format the repo with Prettier         |
| `npm run format:check` | Verify formatting (used in CI)        |

## Contributing

Commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification — this is enforced locally by a commit-msg hook and again in CI. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow, commit format, and quality gates.

## License

[MIT](./LICENSE) © Rollout OS Contributors
