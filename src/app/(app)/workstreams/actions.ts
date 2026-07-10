'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { assertCan } from '@/lib/authz';
import { db } from '@/lib/db';
import { getRolloutContext } from '@/lib/rollout';
import { archiveWorkstreamSchema, createWorkstreamSchema, updateWorkstreamSchema } from './schemas';

export type ActionResult = { error: string } | { success: string } | void;

/**
 * Workstream CRUD (PRD §18) — docs/10 conventions throughout. Extra rule
 * here: a workstream's programme must belong to the caller's rollout
 * (Domain Rule 2), and `rolloutId` is denormalized from it (docs/09 §2 —
 * consistency is a service-layer responsibility).
 */

export async function createWorkstream(input: unknown): Promise<ActionResult> {
  const parsed = createWorkstreamSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the workstream fields.' };
  }

  const context = await getRolloutContext();
  if (!context) redirect('/onboarding');
  assertCan(context.ctx, 'structure:manage');

  // The parent programme must be a live row in the caller's rollout.
  const programme = await db.programme.findFirst({
    where: { id: parsed.data.programmeId, rolloutId: context.rollout.id, deletedAt: null },
    select: { id: true },
  });
  if (!programme) {
    return { error: 'Programme not found.' };
  }

  const workstream = await db.workstream.create({
    data: {
      rolloutId: context.rollout.id,
      programmeId: programme.id,
      name: parsed.data.name,
      description: parsed.data.description,
      createdBy: context.ctx.userId,
    },
    select: { id: true },
  });

  revalidatePath('/workstreams');
  revalidatePath(`/programs/${programme.id}`);
  redirect(`/workstreams/${workstream.id}`);
}

export async function updateWorkstream(input: unknown): Promise<ActionResult> {
  const parsed = updateWorkstreamSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the workstream fields.' };
  }

  const context = await getRolloutContext();
  if (!context) redirect('/onboarding');
  assertCan(context.ctx, 'structure:manage');

  const { id, ...data } = parsed.data;
  const result = await db.workstream.updateMany({
    where: { id, rolloutId: context.rollout.id, deletedAt: null },
    data: {
      ...data,
      description: data.description ?? null,
      updatedBy: context.ctx.userId,
    },
  });
  if (result.count === 0) {
    return { error: 'Workstream not found.' };
  }

  revalidatePath('/workstreams');
  revalidatePath(`/workstreams/${id}`);
  return { success: 'Saved.' };
}

export async function archiveWorkstream(input: unknown): Promise<ActionResult> {
  const parsed = archiveWorkstreamSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Workstream not found.' };
  }

  const context = await getRolloutContext();
  if (!context) redirect('/onboarding');
  assertCan(context.ctx, 'structure:manage');

  const result = await db.workstream.updateMany({
    where: { id: parsed.data.id, rolloutId: context.rollout.id, deletedAt: null },
    data: { deletedAt: new Date(), updatedBy: context.ctx.userId },
  });
  if (result.count === 0) {
    return { error: 'Workstream not found.' };
  }

  revalidatePath('/workstreams');
  redirect('/workstreams');
}
