import { cache } from 'react';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

/**
 * Where the signed-in user is in the first-run journey:
 * no organization → create one; organization but no rollout → create the
 * first rollout; both → the app proper. The (app) layout and the onboarding
 * pages both route off this, so it is React-cached per request.
 *
 * MVP scope: one organization per user, first membership wins (docs/14 —
 * roles are org-level; multi-org switching is a later concern).
 */
export type OnboardingState = {
  userId: string;
  organization: { id: string; name: string } | null;
  hasRollout: boolean;
};

export const getOnboardingState = cache(async (): Promise<OnboardingState | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const membership = await db.organizationMember.findFirst({
    where: { profileId: user.id, organization: { deletedAt: null } },
    orderBy: { createdAt: 'asc' },
    select: {
      organization: {
        select: {
          id: true,
          name: true,
          rollouts: { where: { deletedAt: null }, take: 1, select: { id: true } },
        },
      },
    },
  });

  if (!membership) return { userId: user.id, organization: null, hasRollout: false };

  const { rollouts, ...organization } = membership.organization;
  return { userId: user.id, organization, hasRollout: rollouts.length > 0 };
});
