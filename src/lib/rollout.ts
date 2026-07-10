import { cache } from 'react';
import { getAuthzContext, type AuthzContext } from '@/lib/authz';
import { db } from '@/lib/db';
import { getOnboardingState } from '@/lib/onboarding';

/**
 * The request's working context: the user's organization, its rollout, and
 * the caller's authz context — the triple every module page and server
 * action needs. React-cached per request. Returns null when onboarding is
 * incomplete (the (app) layout redirects before module pages ever see that,
 * but server actions must handle it).
 *
 * MVP scope: one rollout per organization, first one wins — matching the
 * onboarding flow. Multi-rollout selection is a later concern.
 */
export type RolloutContext = {
  organization: { id: string; name: string };
  rollout: { id: string; name: string };
  ctx: AuthzContext | null;
};

export const getRolloutContext = cache(async (): Promise<RolloutContext | null> => {
  const state = await getOnboardingState();
  if (!state?.organization) return null;

  const rollout = await db.rollout.findFirst({
    where: { organizationId: state.organization.id, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true },
  });
  if (!rollout) return null;

  const ctx = await getAuthzContext(state.organization.id);
  return { organization: state.organization, rollout, ctx };
});
