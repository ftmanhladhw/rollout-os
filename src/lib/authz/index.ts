import { cache } from 'react';
import { redirect } from 'next/navigation';
import type { MemberRole } from '@prisma/client';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { roleCan, type Action } from './permissions';

export { ACTIONS, DEFAULT_EXPERIENCE_PROFILE, roleCan, type Action } from './permissions';

/**
 * Server-side authorization context for the current request. RLS handles
 * tenant isolation at the database; these helpers are the app-layer
 * fine-grained check that every server action and data query must call.
 */

export type AuthzContext = {
  userId: string;
  isSuperAdmin: boolean;
  /** Null when the user is not a member of the given organization. */
  role: MemberRole | null;
};

/**
 * Resolve the current user's authorization context for one organization.
 * React-cached per request, so repeated calls in a render tree hit the
 * database once. Returns null when unauthenticated.
 */
export const getAuthzContext = cache(
  async (organizationId: string): Promise<AuthzContext | null> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const profile = await db.profile.findUnique({
      where: { id: user.id },
      select: {
        isSuperAdmin: true,
        memberships: {
          where: { organizationId },
          select: { role: true },
        },
      },
    });
    if (!profile) return null;

    return {
      userId: user.id,
      isSuperAdmin: profile.isSuperAdmin,
      role: profile.memberships[0]?.role ?? null,
    };
  },
);

/** Can this context perform the action? Super admins bypass the matrix. */
export function can(ctx: AuthzContext | null, action: Action): boolean {
  if (!ctx) return false;
  if (ctx.isSuperAdmin) return true;
  if (!ctx.role) return false;
  return roleCan(ctx.role, action);
}

/** Thrown by assertCan. Carries no user data — safe to log verbatim. */
export class ForbiddenError extends Error {
  constructor(action: Action) {
    super(`Forbidden: requires ${action}`);
    this.name = 'ForbiddenError';
  }
}

/**
 * Assert a permission at the top of a server action. Throwing (not returning)
 * is deliberate: a denied mutation is a bug or an attack, not a user flow.
 */
export function assertCan(ctx: AuthzContext | null, action: Action): asserts ctx is AuthzContext {
  if (!can(ctx, action)) {
    throw new ForbiddenError(action);
  }
}

/**
 * Guard a page or layout render. Unlike a denied mutation, a denied *view* is
 * an expected user flow (someone shared a link the viewer's role can't see),
 * so it lands on /unauthorized instead of an error boundary.
 */
export function requireCan(ctx: AuthzContext | null, action: Action): asserts ctx is AuthzContext {
  if (!can(ctx, action)) {
    redirect('/unauthorized');
  }
}
