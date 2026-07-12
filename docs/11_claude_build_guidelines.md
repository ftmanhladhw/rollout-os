# Claude Build Guidelines

Rollout OS is built with heavy AI assistance (Claude Code). These are the rules that keep AI-authored work at the same bar as hand-written work — so the origin of a change is invisible in the result. They apply to any contributor, human or AI.

## Principles

1. **Understanding before code.** The first job on any task is understanding the request and the surrounding code — not typing. Confirm scope and surface assumptions before changing anything non-trivial.
2. **Smallest diff that does the job.** No opportunistic refactors, no reformatting untouched code, one logical change per PR.
3. **Match the surrounding idiom.** Read the neighboring files first; follow their naming, structure, and comment density. New code should be indistinguishable from what's already there.
4. **Readable over clever.** Correct and clear beats concise and surprising. If a reviewer has to pause, simplify.
5. **No invented facts.** Don't guess a field name, a role, or a business rule — verify against the schema/docs, or leave a clearly-marked `TODO` and ask.

## Scope discipline

- **Feature code lands per module**, as its own PR: build → verify end-to-end → tests → docs update → PR. This is how every one of the seven modules shipped.
- **Config over code for anything domain-specific.** Stages, terminology, roles, and defaults are data ([`src/config`](../src/config), seed data) — never hardcoded branches. The Amazon CSR programme was a design partner, never a value in the product.
- **Stay in the app layer.** Business logic and authorization live in application code (server actions + `src/lib/authz`); the database backstops with RLS. Don't push app rules into the database or vice-versa.

## Every change carries its evidence

A change isn't done when it compiles. It's done when:

- The relevant tests exist and pass (permission matrix, schemas, and pure helpers are unit-tested with Vitest, in CI).
- It was **verified in the real app** where behavior matters (see [`.claude/skills/verify/SKILL.md`](../.claude/skills/verify/SKILL.md)).
- The design record it affects (docs/09, 10, 14, …) is updated in the same PR.
- `npm run check` (format · lint · typecheck · test · build) passes locally before the PR.

## Security is not optional

- Parameterized queries only (Prisma); never string-build SQL.
- Every mutation asserts a permission (`assertCan`); every protected view guards (`requireCan`).
- Never swallow exceptions silently — no bare `catch {}` that hides a failure.
- Never put secrets in code, commands, or output. Environment variables are validated in [`src/lib/env.ts`](../src/lib/env.ts).

## Memory lives in the repo

Knowledge must outlive any single session or operator. Durable decisions go in the [decision log](./13_decision_log.md) and design records; orientation goes in [`HANDOFF.md`](../HANDOFF.md). If it only exists in a chat, it doesn't exist.
