'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { assertCan, type Action } from '@/lib/authz';
import { db } from '@/lib/db';
import { getRolloutContext, type RolloutContext } from '@/lib/rollout';
import {
  removeMemberSchema,
  updateMemberSchema,
  updateReadinessSchema,
  updateRolloutSchema,
} from './schemas';

export type ActionResult = { error: string } | { success: string } | void;

/**
 * Administration server actions — docs/10 conventions. Member management is
 * org:manage (org_admin only); rollout settings are rollout:manage. The one
 * extra invariant here: an organization must never lose its last org_admin —
 * demotion and removal both check it, so the admin surface can't lock itself
 * out.
 */

async function guarded(action: Action): Promise<RolloutContext & { userId: string }> {
  const context = await getRolloutContext();
  if (!context) redirect('/onboarding');
  assertCan(context.ctx, action);
  return { ...context, userId: context.ctx.userId };
}

function done(message: string): ActionResult {
  revalidatePath('/settings');
  return { success: message };
}

/** True when at least one *other* membership of this org is org_admin. */
async function anotherAdminExists(organizationId: string, memberId: string): Promise<boolean> {
  const count = await db.organizationMember.count({
    where: { organizationId, role: 'org_admin', id: { not: memberId } },
  });
  return count > 0;
}

// --- Members ---

export async function updateMember(input: unknown): Promise<ActionResult> {
  const parsed = updateMemberSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { organization } = await guarded('org:manage');

  const member = await db.organizationMember.findFirst({
    where: { id: parsed.data.id, organizationId: organization.id },
    select: { id: true, role: true },
  });
  if (!member) return { error: 'Member not found.' };

  if (
    member.role === 'org_admin' &&
    parsed.data.role !== 'org_admin' &&
    !(await anotherAdminExists(organization.id, member.id))
  ) {
    return { error: 'An organization needs at least one admin — promote someone else first.' };
  }

  await db.organizationMember.update({
    where: { id: member.id },
    data: { role: parsed.data.role, experienceProfile: parsed.data.experienceProfile },
  });
  return done('Saved.');
}

export async function removeMember(input: unknown): Promise<ActionResult> {
  const parsed = removeMemberSchema.safeParse(input);
  if (!parsed.success) return { error: 'Member not found.' };
  const { organization } = await guarded('org:manage');

  const member = await db.organizationMember.findFirst({
    where: { id: parsed.data.id, organizationId: organization.id },
    select: { id: true, role: true },
  });
  if (!member) return { error: 'Member not found.' };

  if (member.role === 'org_admin' && !(await anotherAdminExists(organization.id, member.id))) {
    return { error: 'An organization needs at least one admin — promote someone else first.' };
  }

  // Hard delete by design (docs/09): revoking access must be immediate and
  // unambiguous. The activity log keeps the audit trail.
  await db.organizationMember.delete({ where: { id: member.id } });
  return done('Member removed.');
}

// --- Rollout settings ---

export async function updateRollout(input: unknown): Promise<ActionResult> {
  const parsed = updateRolloutSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { organization, rollout, userId } = await guarded('rollout:manage');

  const { description, goLiveDate, ...data } = parsed.data;
  const result = await db.rollout.updateMany({
    where: { id: rollout.id, organizationId: organization.id, deletedAt: null },
    data: {
      ...data,
      description: description ?? null,
      goLiveDate: goLiveDate ? new Date(`${goLiveDate}T00:00:00Z`) : null,
      updatedBy: userId,
    },
  });
  if (result.count === 0) return { error: 'Rollout not found.' };
  revalidatePath('/', 'layout');
  return { success: 'Saved.' };
}

export async function updateReadiness(input: unknown): Promise<ActionResult> {
  const parsed = updateReadinessSchema.safeParse(input);
  if (!parsed.success) return { error: 'Check the fields.' };
  const { rollout, userId } = await guarded('rollout:manage');

  const result = await db.readinessDimension.updateMany({
    where: { id: parsed.data.id, rolloutId: rollout.id, deletedAt: null },
    data: { status: parsed.data.status, updatedBy: userId },
  });
  if (result.count === 0) return { error: 'Dimension not found.' };
  return done('Saved.');
}
