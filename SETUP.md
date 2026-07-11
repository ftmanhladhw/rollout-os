# SETUP — Supabase & production deployment

Runbook for standing up the Supabase backend and deploying to Vercel. Everything code-side is already wired; this is the platform half. Steps 1–7 take ~15 minutes.

## 1. Create the Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Pick your organization, name it (e.g. `rollout-os`), choose a region close to your users.
3. Set a strong **database password** and save it somewhere safe (needed for `DATABASE_URL`).
4. Wait for provisioning (~2 minutes).

## 2. Configure authentication

In **Authentication → Sign In / Up → Email**:

- **Email** provider is enabled by default — this covers both email/password **and** magic links (magic links are the same provider via `signInWithOtp`).
- Keep **Confirm email** ON (users must verify before signing in).
- Minimum password length: the app enforces 8; optionally raise the dashboard setting to match.

In **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` for now; change to the production domain after the first deploy.
- **Redirect URLs**: add both `http://localhost:3000/**` and (later) `https://<your-domain>/**`.

## 3. Update email templates (required)

The app verifies email links via the `token_hash` flow (`/auth/confirm`), so the default templates must be changed. In **Authentication → Emails / Templates**:

**Confirm signup** — replace the confirmation link with:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup">Confirm your email</a>
```

**Magic Link** — replace the link with:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink">Sign in</a>
```

**Reset Password** — replace the link with:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password"
  >Reset your password</a
>
```

> Without this change, auth emails point at Supabase's `/verify` endpoint instead of the app's confirm route, and sign-in links will not establish a session in the app.

## 4. Fill in `.env`

```bash
cp .env.example .env
```

| Variable                        | Where to find it                                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                  | Dashboard → **Connect** → Connection string → **Transaction pooler** (port 6543); append `?pgbouncer=true` |
| `DIRECT_URL`                    | Same dialog → **Direct connection** (port 5432)                                                            |
| `NEXT_PUBLIC_SUPABASE_URL`      | **Settings → API** → Project URL                                                                           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Settings → API** → `anon` `public` key                                                                   |
| `SUPABASE_SERVICE_ROLE_KEY`     | **Settings → API** → `service_role` key (server-only; never expose)                                        |
| `NEXT_PUBLIC_SITE_URL`          | `http://localhost:3000` locally; production domain on Vercel                                               |

## 5. Apply the database migrations

```bash
npm run db:migrate:deploy
```

This creates the `profiles` table with its RLS policies (see `prisma/migrations/`).

## 6. Run the platform setup script

Open the Supabase **SQL Editor**, paste the contents of [`supabase/setup.sql`](./supabase/setup.sql), and run it. It is idempotent (safe to re-run) and creates:

- the `on_auth_user_created` trigger that auto-creates a `profiles` row per new user;
- the private `attachments` storage bucket;
- storage RLS policies scoping every user to their own folder.

Run it **after** step 5 (the trigger inserts into `profiles`).

## 7. Verify locally

```bash
npm run dev
```

- Visiting `http://localhost:3000` signed out → redirected to `/login`.
- Sign up → confirmation email → link lands on `/` signed in; a `profiles` row exists (Table Editor).
- Sign out → back to `/login`; sign in with password works; "Use a magic link instead" works.

> Local emails: Supabase's built-in SMTP is rate-limited (~2/hour) and for testing only. Configure custom SMTP (Settings → Auth) before real usage.

## 8. Deploy to Vercel

Everything code-side is prepared: `vercel.json` pins functions to `hnd1` (Tokyo — same region as the Supabase project, `ap-northeast-1`), security headers + report-only CSP ship from `next.config.ts`, image responses are served as AVIF/WebP, and `src/lib/env.ts` fails the boot if production configuration is missing or insecure.

### 8.1 Before the first deploy

- [ ] All migrations applied to the production database (`npm run db:migrate:deploy` — includes `rate_limits`, which auth rate limiting writes to; without it the limiter fails open and logs errors).
- [ ] `supabase/setup.sql` has been run (step 6).
- [ ] **Custom SMTP configured** (Supabase → Settings → Auth). The built-in sender is unreliable — auth emails (confirm/magic-link/reset) will not reliably reach real users without it.
- [ ] Dashboard hygiene: minimum password length ≥ 8, leaked-password protection ON (Authentication → Sign In / Up).

### 8.2 Import the project

1. Vercel dashboard → **Add New → Project** → import `ftmanhladhw/rollout-os`.
2. Framework preset **Next.js** is auto-detected; keep the default build command (`next build`). Node 22 is selected automatically from `engines` in `package.json`.
3. Do **not** deploy yet — set the environment variables first (a deploy without them fails at boot by design).

### 8.3 Environment variables (Production environment)

Same six values as step 4, with production values:

| Variable                        | Production value                                                              |
| ------------------------------- | ----------------------------------------------------------------------------- |
| `DATABASE_URL`                  | Transaction-pooler string (port 6543, `?pgbouncer=true`)                      |
| `DIRECT_URL`                    | Direct connection string (port 5432)                                          |
| `NEXT_PUBLIC_SUPABASE_URL`      | Project URL                                                                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` key (safe for the browser; RLS is the boundary)                        |
| `SUPABASE_SERVICE_ROLE_KEY`     | `service_role` key — **Production scope only, never Preview**; bypasses RLS   |
| `NEXT_PUBLIC_SITE_URL`          | The deployed origin, e.g. `https://rollout-os.vercel.app` — **must be https** |

Notes:

- `NEXT_PUBLIC_SITE_URL` is enforced at boot: production refuses to start on `http://` or localhost (`src/lib/env.ts`), because auth email links are minted from it.
- Never set `SKIP_ENV_VALIDATION` on Vercel — it exists for credential-less CI builds only.
- Preview deployments: either leave the variables Production-scoped (previews then fail at boot — acceptable) or point Preview at a separate staging Supabase project. **Never point previews at the production database.**

### 8.4 Migrations are manual, always

Vercel builds do **not** run migrations. For every deploy that includes a new `prisma/migrations/` entry, apply it against production first:

```bash
npm run db:migrate:deploy   # with production DATABASE_URL/DIRECT_URL in the local environment
```

Deploy order: migrate → deploy (the schema must be ready before the new code lands).

### 8.5 Point Supabase at the deployed domain

In **Authentication → URL Configuration**:

1. **Site URL** → the production domain (this is `{{ .SiteURL }}` in the email templates from step 3).
2. **Redirect URLs** → add `https://<production-domain>/**` (keep the localhost entry for local dev).

### 8.6 Post-deploy verification

- [ ] Visiting the production URL signed out redirects to `/login`; `/programs` etc. deny unauthenticated access (default-deny middleware).
- [ ] Full auth pass: signup → confirmation email → landing signed in → sign out → password login → magic link → password reset.
- [ ] Response headers present (browser devtools or `curl -sI`): `Strict-Transport-Security`, `X-Frame-Options: DENY`, `Content-Security-Policy-Report-Only`; no `X-Powered-By`.
- [ ] Repeat a failed login ~10× quickly → rate-limit message appears (proves the `rate_limits` table is live).
- [ ] Watch the browser console for CSP violation reports for a few sessions, then promote the CSP from report-only to enforcing (`next.config.ts`).

> If the Supabase project ever moves region, update `regions` in `vercel.json` to match — functions and database should stay colocated.

## Security posture (already wired in code)

- RLS enabled on all app tables; policies are the reference pattern in `prisma/migrations/…_init_profiles/migration.sql`.
- Strict security headers on every route (`next.config.ts`).
- Server actions re-validate all input with Zod; auth session is refreshed and enforced in middleware (default-deny).
- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — server-only, never in `NEXT_PUBLIC_*`, never in client code.
