import { z } from 'zod';

/**
 * Validated environment variables.
 *
 * Server-only secrets and public (NEXT_PUBLIC_*) values are declared here so
 * that a misconfigured environment fails fast and loudly rather than at some
 * random runtime call site.
 *
 * Variables are optional in development (the app scaffold must build without
 * credentials) but required in production — a production deploy with missing
 * Supabase configuration should fail at boot, not at the first auth call.
 *
 * Set `SKIP_ENV_VALIDATION=true` to bypass validation (e.g. for lint/CI steps
 * that do not touch the database or auth).
 */
const envSchema = z
  .object({
    // Database (Supabase Postgres). Pooled connection for the app; direct for migrations.
    DATABASE_URL: z.string().url().optional(),
    DIRECT_URL: z.string().url().optional(),

    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

    // Canonical site origin, used as the base for auth email redirects.
    NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),

    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  })
  .superRefine((vars, ctx) => {
    if (vars.NODE_ENV !== 'production') return;
    // `next build` runs with NODE_ENV=production but must succeed without
    // credentials (CI, fresh clones). Enforce only at production runtime.
    if (process.env.NEXT_PHASE === 'phase-production-build') return;
    const requiredInProduction = [
      'DATABASE_URL',
      'DIRECT_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ] as const;
    for (const key of requiredInProduction) {
      if (!vars[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: 'Required in production',
        });
      }
    }
    // Auth email links are built from SITE_URL — a production deploy still
    // pointing at localhost (or plain http) would mint broken/insecure links,
    // silently. Fail the boot instead.
    if (!vars.NEXT_PUBLIC_SITE_URL.startsWith('https://')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['NEXT_PUBLIC_SITE_URL'],
        message: 'Must be the https:// production origin in production',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  if (process.env.SKIP_ENV_VALIDATION === 'true') {
    return process.env as unknown as Env;
  }
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid environment variables:\n${JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)}`,
    );
  }
  return parsed.data;
}

export const env = loadEnv();
