import type { ActivityVerb, EntityType } from '@prisma/client';
import { db } from '@/lib/db';

/**
 * Append a row to the activity log (docs/09: append-only, no updates, no
 * soft delete). Called by every mutating server action after its write
 * succeeds — the log is the audit trail and feeds the Command Center
 * activity section. `entityName` is denormalized so entries stay readable
 * after the entity is archived.
 */
export async function logActivity(entry: {
  rolloutId: string;
  actorId: string;
  verb: ActivityVerb;
  entityType: EntityType;
  entityId: string;
  entityName: string;
}): Promise<void> {
  try {
    await db.activityLog.create({
      data: {
        rolloutId: entry.rolloutId,
        actorId: entry.actorId,
        verb: entry.verb,
        entityType: entry.entityType,
        entityId: entry.entityId,
        entityName: entry.entityName,
      },
    });
  } catch (error) {
    // The feed is derived data: a failed log line must never fail the
    // user's mutation — but it is never swallowed silently either.
    console.error('[activity] failed to write activity_log entry', error);
  }
}
