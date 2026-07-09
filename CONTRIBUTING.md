# Contributing to Rollout OS

Thanks for contributing! This guide covers the workflow and the quality gates that keep the repository consistent.

## Prerequisites

- Node.js `>= 20` (run `nvm use` to match `.nvmrc`)
- npm `>= 11`

```bash
npm install   # installs dependencies and sets up Husky git hooks
```

## Branch & PR workflow

1. Branch off `main` using a descriptive name: `feat/<short-desc>`, `fix/<short-desc>`, `chore/<short-desc>`.
2. Make your change. Keep commits focused.
3. Ensure everything passes locally:
   ```bash
   npm run format:check
   npm run lint
   npm run build
   ```
4. Open a pull request against `main`. CI must be green before merge.

Direct pushes to `main` are not part of the workflow — always go through a PR.

## Commit messages — Conventional Commits

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<optional scope>): <description>
```

Allowed **types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

Examples:

```
feat(lifecycle): add configurable stage gates
fix(tracker): correct progress rollup for skipped stages
docs(readme): clarify rollout unit grid
ci: run commitlint on pull requests
```

This is enforced two ways:

- **Locally** — a Husky `commit-msg` hook runs commitlint on every commit.
- **In CI** — commitlint validates all commits in a pull request.

## Automated quality gates

| Gate            | When            | Tool                |
| --------------- | --------------- | ------------------- |
| Format & lint   | On `git commit` | Husky + lint-staged |
| Commit message  | On `git commit` | Husky + commitlint  |
| Format check    | On PR / push    | Prettier (CI)       |
| Lint            | On PR / push    | ESLint (CI)         |
| Build           | On PR / push    | TypeScript (CI)     |
| Commit messages | On PR           | commitlint (CI)     |

If a git hook ever needs to be bypassed for a legitimate reason, use `git commit --no-verify` sparingly — CI will still enforce the same gates.
