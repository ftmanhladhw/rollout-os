import { db } from '@/lib/db';

/**
 * Ensure the signed-in member has a stakeholder row in the rollout and
 * return its id. Stakeholders are the per-rollout people records
 * (docs/09: profiles-vs-stakeholders); some entities require one (a risk's
 * owner is NOT NULL, Domain Rule 6). Until the Administration module manages
 * stakeholders explicitly, the caller becomes one on first need.
 */
export async function getOrCreateSelfStakeholder(
  rolloutId: string,
  userId: string,
): Promise<string> {
  const existing = await db.stakeholder.findFirst({
    where: { rolloutId, profileId: userId, deletedAt: null },
    select: { id: true },
  });
  if (existing) return existing.id;

  const profile = await db.profile.findUnique({
    where: { id: userId },
    select: { displayName: true, email: true },
  });

  const created = await db.stakeholder.create({
    data: {
      rolloutId,
      profileId: userId,
      name: profile?.displayName || profile?.email || 'Member',
      email: profile?.email,
      createdBy: userId,
    },
    select: { id: true },
  });
  return created.id;
}
