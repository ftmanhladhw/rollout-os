# Application Architecture

This document describes the **code architecture** of Rollout OS. For the _product_ architecture (domain model, operational models), see [`docs/04_architecture_specification.md`](./docs/04_architecture_specification.md).

> **Status:** MVP feature-complete — Supabase auth (email/password, magic link, password reset), the full MVP domain schema (27 tables with RLS), the authenticated app shell, onboarding, a live Command Center, and all seven lifecycle modules (Programs, Workstreams, Operations, Knowledge, Timeline, Reports, Administration) are built and wired to live data. Schema design record: [`docs/09_database_design.md`](./docs/09_database_design.md). Auth & authorization: [`docs/14`](./docs/14_auth_authorization.md). Platform setup runbook: [`SETUP.md`](./SETUP.md).

## Technology stack

| Layer            | Choice                            | Notes                                             |
| ---------------- | --------------------------------- | ------------------------------------------------- |
| Framework        | **Next.js 15** (App Router)       | React 19, Server Components by default            |
| Language         | **TypeScript** (strict)           | `@/*` path alias → `src/*`                        |
| Styling          | **Tailwind CSS v4**               | CSS-first config in `src/app/globals.css`         |
| UI components    | **shadcn/ui** (new-york, neutral) | added on demand via the shadcn CLI                |
| Icons            | **lucide-react**                  |                                                   |
| Server state     | **TanStack Query v5**             | provider in `src/app/providers.tsx`               |
| Tables           | **TanStack Table v8**             | headless; no global setup                         |
| Forms            | **React Hook Form** + **Zod**     | `@hookform/resolvers` for schema validation       |
| ORM / migrations | **Prisma**                        | `prisma/schema.prisma`, client in `src/lib/db.ts` |
| Database / Auth  | **Supabase** (Postgres + Auth)    | SSR clients in `src/lib/supabase/`                |
| Hosting          | **Vercel**                        | zero-config Next.js deployment                    |

## Directory structure

```
rollout-os/
├── src/
│   ├── app/                    # App Router: routes, layouts, pages
│   │   ├── (auth)/             # login, signup, forgot/reset password + auth actions
│   │   ├── (app)/              # authenticated shell + the seven lifecycle modules
│   │   │   ├── programs/ workstreams/ operations/ knowledge/
│   │   │   ├── timeline/ reports/ settings/          # each: page + actions + schemas (+ tests)
│   │   │   ├── page.tsx        # Command Center (live)
│   │   │   └── layout.tsx      # shell + first-run onboarding gate
│   │   ├── onboarding/         # create organization → create first rollout
│   │   ├── auth/confirm/       # email OTP verification route (signup + magic link)
│   │   ├── layout.tsx          # root layout (fonts, metadata, providers)
│   │   ├── providers.tsx       # client-side providers (TanStack Query, theme, …)
│   │   └── globals.css         # Tailwind v4 + design tokens
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── shell/              # sidebar, header, breadcrumbs, nav, user menu
│   │   ├── command-center/     # Command Center sections + derivation helpers
│   │   └── entity-drawer.tsx   # universal create/edit drawer (shared across modules)
│   ├── config/                 # static app config: site, nav, terminology, rollout defaults
│   ├── hooks/                  # shared React hooks
│   ├── lib/                    # framework-agnostic building blocks
│   │   ├── db.ts               # Prisma client singleton
│   │   ├── env.ts              # Zod-validated environment variables
│   │   ├── authz/              # permission matrix + can/assertCan/requireCan
│   │   ├── rate-limit.ts       # fixed-window auth rate limiting
│   │   ├── activity.ts         # audit-trail writer
│   │   ├── rollout-metrics.ts  # shared metric helpers (one definition, many surfaces)
│   │   ├── query/              # TanStack Query client factory
│   │   └── supabase/           # Supabase clients + storage helpers
│   ├── types/                  # shared TypeScript types
│   └── middleware.ts           # session refresh + default-deny route protection
├── prisma/
│   ├── schema.prisma           # full MVP domain schema (see docs/09)
│   └── migrations/             # SQL migrations incl. RLS policies
├── supabase/
│   └── setup.sql               # idempotent platform config (auth trigger, storage)
├── components.json             # shadcn/ui configuration
├── next.config.ts
├── postcss.config.mjs          # Tailwind v4 via @tailwindcss/postcss
├── eslint.config.mjs           # flat config: eslint-config-next + prettier
└── tsconfig.json
```

## Conventions

- **Server Components by default.** Add `'use client'` only where interactivity or browser APIs are required.
- **`src/lib` is where non-UI logic lives** — data clients, validation, and utilities. Keep it free of React where possible.
- **Data access:** Prisma is the source of truth for schema and typed queries; Supabase provides Auth and Storage. Both target the same Postgres database. Prisma migrations own the `public` schema (tables, RLS policies); Supabase-managed schemas (`auth`, `storage`) are configured by the idempotent `supabase/setup.sql` — one source of truth per config item.
- **Row Level Security** is enabled on every app table; `profiles` is the reference pattern (own-row policies via `auth.uid()`). Prisma connects as `postgres` and bypasses RLS, so server-side authorization stays explicit in application code; the policies protect the PostgREST/client roles.
- **Environment variables** are validated once in `src/lib/env.ts`. Add new variables to the Zod schema and to `.env.example`.
- **Feature code is organized by route** under `src/app`, with shared pieces promoted to `src/components`, `src/hooks`, and `src/lib`.

## Quality gates

Formatting (Prettier + Tailwind class sorting), linting (ESLint flat config with `eslint-config-next`), type-checking (`tsc`), and build (`next build`) run locally via Husky/lint-staged and again in GitHub Actions CI. Commit messages follow Conventional Commits. See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Local development

```bash
nvm use                 # Node 22 (see .nvmrc)
npm install             # installs deps + generates the Prisma client
cp .env.example .env    # then fill in Supabase/database values
npm run dev             # http://localhost:3000
```

Creating the Supabase project itself (auth settings, email templates, migrations, storage) is covered step-by-step in [`SETUP.md`](./SETUP.md).
