import { db } from '@/lib/db';

/**
 * Fixed-window rate limiter backed by Postgres (`rate_limits`, RLS-locked to
 * the service connection). Chosen over an in-memory counter because serverless
 * instances don't share memory, and over an external store to avoid a new
 * dependency for the MVP. Fail-open by design: the limiter must never take
 * auth down with it.
 */

/** Deterministic bucket id: scope + window index. Pure for testability. */
export function bucketKey(scope: string, now: Date, windowSeconds: number): string {
  const window = Math.floor(now.getTime() / (windowSeconds * 1000));
  return `${scope}:${windowSeconds}:${window}`;
}

/** True when the call is allowed; false once `limit` calls landed in the window. */
export async function rateLimit(opts: {
  scope: string;
  limit: number;
  windowSeconds: number;
}): Promise<boolean> {
  const key = bucketKey(opts.scope, new Date(), opts.windowSeconds);
  try {
    const row = await db.rateLimit.upsert({
      where: { key },
      update: { count: { increment: 1 } },
      create: { key },
      select: { count: true },
    });

    // Opportunistic cleanup: buckets are worthless once their window passed.
    if (Math.random() < 0.05) {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      db.rateLimit.deleteMany({ where: { createdAt: { lt: cutoff } } }).catch((error) => {
        console.error('[rate-limit] cleanup failed', error);
      });
    }

    return row.count <= opts.limit;
  } catch (error) {
    // Includes the rare upsert unique-violation race — fail open, never block
    // auth on limiter trouble, but never silently either.
    console.error('[rate-limit] check failed', error);
    return true;
  }
}
