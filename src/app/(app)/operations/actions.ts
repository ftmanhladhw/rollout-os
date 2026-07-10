'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { assertCan, type Action } from '@/lib/authz';
import { db } from '@/lib/db';
import { getRolloutContext, type RolloutContext } from '@/lib/rollout';
import { getOrCreateSelfStakeholder } from '@/lib/stakeholder';
import {
  archiveSchema,
  createDecisionSchema,
  createIssueSchema,
  createMilestoneSchema,
  createRiskSchema,
  createTaskSchema,
  updateDecisionSchema,
  updateIssueSchema,
  updateMilestoneSchema,
  updateRiskSchema,
  updateTaskSchema,
} from './schemas';

export type ActionResult = { error: string } | { success: string } | void;

/**
 * Operations server actions — docs/10 conventions throughout. Guards follow
 * the docs/14 matrix precisely: milestones are structure (structure:manage),
 * tasks and issues are execution-side (operations:execute), risks and
 * decisions are operational governance (operations:manage).
 */

/** Zod → session → permission preamble shared by every action below. */
async function guarded(action: Action): Promise<RolloutContext & { userId: string }> {
  const context = await getRolloutContext();
  if (!context) redirect('/onboarding');
  assertCan(context.ctx, action);
  return { ...context, userId: context.ctx.userId };
}

function toDate(value: string | undefined): Date | null {
  return value ? new Date(`${value}T00:00:00Z`) : null;
}

function done(message: string): ActionResult {
  revalidatePath('/operations');
  return { success: message };
}

// --- Milestones ---

export async function createMilestone(input: unknown): Promise<ActionResult> {
  const parsed = createMilestoneSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { rollout, userId } = await guarded('structure:manage');

  const workstream = await db.workstream.findFirst({
    where: { id: parsed.data.workstreamId, rolloutId: rollout.id, deletedAt: null },
    select: { id: true },
  });
  if (!workstream) return { error: 'Workstream not found.' };

  await db.milestone.create({
    data: {
      rolloutId: rollout.id,
      workstreamId: workstream.id,
      name: parsed.data.name,
      description: parsed.data.description,
      dueDate: toDate(parsed.data.dueDate),
      createdBy: userId,
    },
  });
  return done('Milestone created.');
}

export async function updateMilestone(input: unknown): Promise<ActionResult> {
  const parsed = updateMilestoneSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { rollout, userId } = await guarded('structure:manage');

  const { id, dueDate, description, ...data } = parsed.data;
  const result = await db.milestone.updateMany({
    where: { id, rolloutId: rollout.id, deletedAt: null },
    data: {
      ...data,
      description: description ?? null,
      dueDate: toDate(dueDate),
      updatedBy: userId,
    },
  });
  if (result.count === 0) return { error: 'Milestone not found.' };
  return done('Saved.');
}

export async function archiveMilestone(input: unknown): Promise<ActionResult> {
  const parsed = archiveSchema.safeParse(input);
  if (!parsed.success) return { error: 'Milestone not found.' };
  const { rollout, userId } = await guarded('structure:manage');

  const result = await db.milestone.updateMany({
    where: { id: parsed.data.id, rolloutId: rollout.id, deletedAt: null },
    data: { deletedAt: new Date(), updatedBy: userId },
  });
  if (result.count === 0) return { error: 'Milestone not found.' };
  return done('Archived.');
}

// --- Tasks ---

export async function createTask(input: unknown): Promise<ActionResult> {
  const parsed = createTaskSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { rollout, userId } = await guarded('operations:execute');

  const milestone = await db.milestone.findFirst({
    where: { id: parsed.data.milestoneId, rolloutId: rollout.id, deletedAt: null },
    select: { id: true },
  });
  if (!milestone) return { error: 'Milestone not found.' };

  await db.task.create({
    data: {
      rolloutId: rollout.id,
      milestoneId: milestone.id,
      name: parsed.data.name,
      description: parsed.data.description,
      dueDate: toDate(parsed.data.dueDate),
      createdBy: userId,
    },
  });
  return done('Task created.');
}

export async function updateTask(input: unknown): Promise<ActionResult> {
  const parsed = updateTaskSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { rollout, userId } = await guarded('operations:execute');

  const { id, dueDate, description, ...data } = parsed.data;
  const result = await db.task.updateMany({
    where: { id, rolloutId: rollout.id, deletedAt: null },
    data: {
      ...data,
      description: description ?? null,
      dueDate: toDate(dueDate),
      completedAt: data.status === 'completed' ? new Date() : null,
      updatedBy: userId,
    },
  });
  if (result.count === 0) return { error: 'Task not found.' };
  return done('Saved.');
}

export async function archiveTask(input: unknown): Promise<ActionResult> {
  const parsed = archiveSchema.safeParse(input);
  if (!parsed.success) return { error: 'Task not found.' };
  const { rollout, userId } = await guarded('operations:execute');

  const result = await db.task.updateMany({
    where: { id: parsed.data.id, rolloutId: rollout.id, deletedAt: null },
    data: { deletedAt: new Date(), updatedBy: userId },
  });
  if (result.count === 0) return { error: 'Task not found.' };
  return done('Archived.');
}

// --- Risks ---

export async function createRisk(input: unknown): Promise<ActionResult> {
  const parsed = createRiskSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { rollout, userId } = await guarded('operations:manage');

  // Domain Rule 6: a risk always has an owner. Until Administration manages
  // stakeholders, the creator owns the risks they raise.
  const ownerId = await getOrCreateSelfStakeholder(rollout.id, userId);

  await db.risk.create({
    data: {
      rolloutId: rollout.id,
      ownerId,
      name: parsed.data.name,
      description: parsed.data.description,
      probability: parsed.data.probability,
      impact: parsed.data.impact,
      mitigation: parsed.data.mitigation,
      createdBy: userId,
    },
  });
  return done('Risk created.');
}

export async function updateRisk(input: unknown): Promise<ActionResult> {
  const parsed = updateRiskSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { rollout, userId } = await guarded('operations:manage');

  const { id, description, mitigation, ...data } = parsed.data;
  const result = await db.risk.updateMany({
    where: { id, rolloutId: rollout.id, deletedAt: null },
    data: {
      ...data,
      description: description ?? null,
      mitigation: mitigation ?? null,
      updatedBy: userId,
    },
  });
  if (result.count === 0) return { error: 'Risk not found.' };
  return done('Saved.');
}

export async function archiveRisk(input: unknown): Promise<ActionResult> {
  const parsed = archiveSchema.safeParse(input);
  if (!parsed.success) return { error: 'Risk not found.' };
  const { rollout, userId } = await guarded('operations:manage');

  const result = await db.risk.updateMany({
    where: { id: parsed.data.id, rolloutId: rollout.id, deletedAt: null },
    data: { deletedAt: new Date(), updatedBy: userId },
  });
  if (result.count === 0) return { error: 'Risk not found.' };
  return done('Archived.');
}

// --- Issues ---

export async function createIssue(input: unknown): Promise<ActionResult> {
  const parsed = createIssueSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { rollout, userId } = await guarded('operations:execute');

  await db.issue.create({
    data: {
      rolloutId: rollout.id,
      name: parsed.data.name,
      description: parsed.data.description,
      createdBy: userId,
    },
  });
  return done('Issue created.');
}

export async function updateIssue(input: unknown): Promise<ActionResult> {
  const parsed = updateIssueSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { rollout, userId } = await guarded('operations:execute');

  const { id, description, resolution, ...data } = parsed.data;
  const result = await db.issue.updateMany({
    where: { id, rolloutId: rollout.id, deletedAt: null },
    data: {
      ...data,
      description: description ?? null,
      resolution: resolution ?? null,
      resolvedAt: data.status === 'completed' ? new Date() : null,
      updatedBy: userId,
    },
  });
  if (result.count === 0) return { error: 'Issue not found.' };
  return done('Saved.');
}

export async function archiveIssue(input: unknown): Promise<ActionResult> {
  const parsed = archiveSchema.safeParse(input);
  if (!parsed.success) return { error: 'Issue not found.' };
  const { rollout, userId } = await guarded('operations:execute');

  const result = await db.issue.updateMany({
    where: { id: parsed.data.id, rolloutId: rollout.id, deletedAt: null },
    data: { deletedAt: new Date(), updatedBy: userId },
  });
  if (result.count === 0) return { error: 'Issue not found.' };
  return done('Archived.');
}

// --- Decisions ---

export async function createDecision(input: unknown): Promise<ActionResult> {
  const parsed = createDecisionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { rollout, userId } = await guarded('operations:manage');

  // Domain Rule 7: a decision affects an entity. In this slice every
  // decision affects the rollout itself; finer targets come with later
  // modules.
  await db.decision.create({
    data: {
      rolloutId: rollout.id,
      affectsEntityType: 'rollout',
      affectsEntityId: rollout.id,
      name: parsed.data.name,
      description: parsed.data.description,
      reason: parsed.data.reason,
      decisionDate: toDate(parsed.data.decisionDate),
      createdBy: userId,
    },
  });
  return done('Decision recorded.');
}

export async function updateDecision(input: unknown): Promise<ActionResult> {
  const parsed = updateDecisionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { rollout, userId } = await guarded('operations:manage');

  const { id, description, reason, decisionDate, ...data } = parsed.data;
  const result = await db.decision.updateMany({
    where: { id, rolloutId: rollout.id, deletedAt: null },
    data: {
      ...data,
      description: description ?? null,
      reason: reason ?? null,
      decisionDate: toDate(decisionDate),
      updatedBy: userId,
    },
  });
  if (result.count === 0) return { error: 'Decision not found.' };
  return done('Saved.');
}

export async function archiveDecision(input: unknown): Promise<ActionResult> {
  const parsed = archiveSchema.safeParse(input);
  if (!parsed.success) return { error: 'Decision not found.' };
  const { rollout, userId } = await guarded('operations:manage');

  const result = await db.decision.updateMany({
    where: { id: parsed.data.id, rolloutId: rollout.id, deletedAt: null },
    data: { deletedAt: new Date(), updatedBy: userId },
  });
  if (result.count === 0) return { error: 'Decision not found.' };
  return done('Archived.');
}
