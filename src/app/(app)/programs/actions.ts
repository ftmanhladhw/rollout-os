'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { logActivity } from '@/lib/activity';
import { assertCan } from '@/lib/authz';
import { db } from '@/lib/db';
import { getRolloutContext } from '@/lib/rollout';
import { archiveProgrammeSchema, createProgrammeSchema, updateProgrammeSchema } from './schemas';

export type ActionResult = { error: string } | { success: string } | void;

/**
 * Programme CRUD (PRD §18). Every mutation: Zod re-validation → assertCan
 * ('structure:manage', docs/14) → write scoped to the caller's rollout so a
 * forged id can never touch another tenant's rows (RLS backstops this at the
 * database). Archive is soft delete (deletedAt, docs/09) — never a hard
 * DELETE.
 */

export async function createProgramme(input: unknown): Promise<ActionResult> {
  const parsed = createProgrammeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Enter a valid programme name.' };
  }

  const context = await getRolloutContext();
  if (!context) redirect('/onboarding');
  assertCan(context.ctx, 'structure:manage');

  const programme = await db.programme.create({
    data: {
      rolloutId: context.rollout.id,
      name: parsed.data.name,
      description: parsed.data.description,
      createdBy: context.ctx.userId,
    },
    select: { id: true },
  });
  await logActivity({
    rolloutId: context.rollout.id,
    actorId: context.ctx.userId,
    verb: 'created',
    entityType: 'programme',
    entityId: programme.id,
    entityName: parsed.data.name,
  });

  revalidatePath('/programs');
  redirect(`/programs/${programme.id}`);
}

export async function updateProgramme(input: unknown): Promise<ActionResult> {
  const parsed = updateProgrammeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the programme fields.' };
  }

  const context = await getRolloutContext();
  if (!context) redirect('/onboarding');
  assertCan(context.ctx, 'structure:manage');

  const { id, ...data } = parsed.data;
  const result = await db.programme.updateMany({
    where: { id, rolloutId: context.rollout.id, deletedAt: null },
    data: {
      ...data,
      description: data.description ?? null,
      updatedBy: context.ctx.userId,
    },
  });
  if (result.count === 0) {
    return { error: 'Programme not found.' };
  }
  await logActivity({
    rolloutId: context.rollout.id,
    actorId: context.ctx.userId,
    verb: 'updated',
    entityType: 'programme',
    entityId: id,
    entityName: parsed.data.name,
  });

  revalidatePath('/programs');
  revalidatePath(`/programs/${id}`);
  return { success: 'Saved.' };
}

export async function archiveProgramme(input: unknown): Promise<ActionResult> {
  const parsed = archiveProgrammeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Programme not found.' };
  }

  const context = await getRolloutContext();
  if (!context) redirect('/onboarding');
  assertCan(context.ctx, 'structure:manage');

  const result = await db.programme.updateMany({
    where: { id: parsed.data.id, rolloutId: context.rollout.id, deletedAt: null },
    data: { deletedAt: new Date(), updatedBy: context.ctx.userId },
  });
  if (result.count === 0) {
    return { error: 'Programme not found.' };
  }
  const archived = await db.programme.findUnique({
    where: { id: parsed.data.id },
    select: { name: true },
  });
  await logActivity({
    rolloutId: context.rollout.id,
    actorId: context.ctx.userId,
    verb: 'deleted',
    entityType: 'programme',
    entityId: parsed.data.id,
    entityName: archived?.name ?? 'programme',
  });

  revalidatePath('/programs');
  redirect('/programs');
}
