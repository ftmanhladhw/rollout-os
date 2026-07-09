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

1. Import the GitHub repo into Vercel (framework auto-detected; build command `next build`, Node 22).
2. Set all six environment variables from step 4 for the **Production** environment, with `NEXT_PUBLIC_SITE_URL` = the production URL. Missing required vars fail the deploy at boot by design (`src/lib/env.ts`).
3. Migrations do **not** run automatically. Apply them against production before (or immediately after) each deploy that includes new migrations:
   ```bash
   npm run db:migrate:deploy   # with production DATABASE_URL/DIRECT_URL in the environment
   ```
4. Back in Supabase: update **Site URL** to the production domain and add it to **Redirect URLs** (step 2).

## Security posture (already wired in code)

- RLS enabled on all app tables; policies are the reference pattern in `prisma/migrations/…_init_profiles/migration.sql`.
- Strict security headers on every route (`next.config.ts`).
- Server actions re-validate all input with Zod; auth session is refreshed and enforced in middleware (default-deny).
- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — server-only, never in `NEXT_PUBLIC_*`, never in client code.
