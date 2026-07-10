'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { assertCan, type Action } from '@/lib/authz';
import { db } from '@/lib/db';
import { getRolloutContext, type RolloutContext } from '@/lib/rollout';
import {
  archiveSchema,
  createDocumentSchema,
  createMeetingSchema,
  createNoteSchema,
  createUpdateSchema,
  updateDocumentSchema,
  updateMeetingSchema,
  updateNoteSchema,
  updateUpdateSchema,
} from './schemas';

export type ActionResult = { error: string } | { success: string } | void;

/**
 * Knowledge server actions — docs/10 conventions throughout. Guards follow
 * the docs/14 matrix: creating documents and notes is contribution
 * (knowledge:contribute — engineering holds it); everything else, including
 * all edits and archives, is curation (knowledge:manage).
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
  revalidatePath('/knowledge');
  return { success: message };
}

/**
 * A phase reference must be a live phase of the caller's rollout — the FK
 * alone would accept another rollout's phase id (docs/09 §2 consistency is
 * service-layer enforced). Returns false when the reference is bad.
 */
async function phaseIsValid(phaseId: string | undefined, rolloutId: string): Promise<boolean> {
  if (!phaseId) return true;
  const phase = await db.phase.findFirst({
    where: { id: phaseId, rolloutId, deletedAt: null },
    select: { id: true },
  });
  return phase !== null;
}

// --- Documents ---

export async function createDocument(input: unknown): Promise<ActionResult> {
  const parsed = createDocumentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { rollout, userId } = await guarded('knowledge:contribute');

  await db.document.create({
    data: {
      rolloutId: rollout.id,
      name: parsed.data.name,
      description: parsed.data.description,
      url: parsed.data.url,
      documentType: parsed.data.documentType,
      version: parsed.data.version,
      createdBy: userId,
    },
  });
  return done('Document referenced.');
}

export async function updateDocument(input: unknown): Promise<ActionResult> {
  const parsed = updateDocumentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { rollout, userId } = await guarded('knowledge:manage');

  const { id, description, version, ...data } = parsed.data;
  const result = await db.document.updateMany({
    where: { id, rolloutId: rollout.id, deletedAt: null },
    data: {
      ...data,
      description: description ?? null,
      version: version ?? null,
      updatedBy: userId,
    },
  });
  if (result.count === 0) return { error: 'Document not found.' };
  return done('Saved.');
}

export async function archiveDocument(input: unknown): Promise<ActionResult> {
  const parsed = archiveSchema.safeParse(input);
  if (!parsed.success) return { error: 'Document not found.' };
  const { rollout, userId } = await guarded('knowledge:manage');

  const result = await db.document.updateMany({
    where: { id: parsed.data.id, rolloutId: rollout.id, deletedAt: null },
    data: { deletedAt: new Date(), updatedBy: userId },
  });
  if (result.count === 0) return { error: 'Document not found.' };
  return done('Archived.');
}

// --- Meetings ---

export async function createMeeting(input: unknown): Promise<ActionResult> {
  const parsed = createMeetingSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { rollout, userId } = await guarded('knowledge:manage');
  if (!(await phaseIsValid(parsed.data.phaseId, rollout.id))) return { error: 'Phase not found.' };

  await db.meeting.create({
    data: {
      rolloutId: rollout.id,
      name: parsed.data.name,
      description: parsed.data.description,
      meetingDate: toDate(parsed.data.meetingDate),
      agenda: parsed.data.agenda,
      summary: parsed.data.summary,
      recordingUrl: parsed.data.recordingUrl,
      phaseId: parsed.data.phaseId,
      createdBy: userId,
    },
  });
  return done('Meeting recorded.');
}

export async function updateMeeting(input: unknown): Promise<ActionResult> {
  const parsed = updateMeetingSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { rollout, userId } = await guarded('knowledge:manage');

  const { id, description, meetingDate, agenda, summary, recordingUrl, phaseId, ...data } =
    parsed.data;
  if (!(await phaseIsValid(phaseId, rollout.id))) return { error: 'Phase not found.' };
  const result = await db.meeting.updateMany({
    where: { id, rolloutId: rollout.id, deletedAt: null },
    data: {
      ...data,
      description: description ?? null,
      meetingDate: toDate(meetingDate),
      agenda: agenda ?? null,
      summary: summary ?? null,
      recordingUrl: recordingUrl ?? null,
      phaseId: phaseId ?? null,
      updatedBy: userId,
    },
  });
  if (result.count === 0) return { error: 'Meeting not found.' };
  return done('Saved.');
}

export async function archiveMeeting(input: unknown): Promise<ActionResult> {
  const parsed = archiveSchema.safeParse(input);
  if (!parsed.success) return { error: 'Meeting not found.' };
  const { rollout, userId } = await guarded('knowledge:manage');

  const result = await db.meeting.updateMany({
    where: { id: parsed.data.id, rolloutId: rollout.id, deletedAt: null },
    data: { deletedAt: new Date(), updatedBy: userId },
  });
  if (result.count === 0) return { error: 'Meeting not found.' };
  return done('Archived.');
}

// --- Notes ---

export async function createNote(input: unknown): Promise<ActionResult> {
  const parsed = createNoteSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { rollout, userId } = await guarded('knowledge:contribute');

  await db.note.create({
    data: {
      rolloutId: rollout.id,
      name: parsed.data.name,
      body: parsed.data.body,
      createdBy: userId,
    },
  });
  return done('Note added.');
}

export async function updateNote(input: unknown): Promise<ActionResult> {
  const parsed = updateNoteSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { rollout, userId } = await guarded('knowledge:manage');

  const { id, body, ...data } = parsed.data;
  const result = await db.note.updateMany({
    where: { id, rolloutId: rollout.id, deletedAt: null },
    data: {
      ...data,
      body: body ?? null,
      updatedBy: userId,
    },
  });
  if (result.count === 0) return { error: 'Note not found.' };
  return done('Saved.');
}

export async function archiveNote(input: unknown): Promise<ActionResult> {
  const parsed = archiveSchema.safeParse(input);
  if (!parsed.success) return { error: 'Note not found.' };
  const { rollout, userId } = await guarded('knowledge:manage');

  const result = await db.note.updateMany({
    where: { id: parsed.data.id, rolloutId: rollout.id, deletedAt: null },
    data: { deletedAt: new Date(), updatedBy: userId },
  });
  if (result.count === 0) return { error: 'Note not found.' };
  return done('Archived.');
}

// --- Updates ---

export async function createUpdate(input: unknown): Promise<ActionResult> {
  const parsed = createUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { rollout, userId } = await guarded('knowledge:manage');

  await db.update.create({
    data: {
      rolloutId: rollout.id,
      name: parsed.data.name,
      updateType: parsed.data.updateType,
      body: parsed.data.body,
      createdBy: userId,
    },
  });
  return done('Update published.');
}

export async function updateUpdate(input: unknown): Promise<ActionResult> {
  const parsed = updateUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { rollout, userId } = await guarded('knowledge:manage');

  const { id, body, ...data } = parsed.data;
  const result = await db.update.updateMany({
    where: { id, rolloutId: rollout.id, deletedAt: null },
    data: {
      ...data,
      body: body ?? null,
      updatedBy: userId,
    },
  });
  if (result.count === 0) return { error: 'Update not found.' };
  return done('Saved.');
}

export async function archiveUpdate(input: unknown): Promise<ActionResult> {
  const parsed = archiveSchema.safeParse(input);
  if (!parsed.success) return { error: 'Update not found.' };
  const { rollout, userId } = await guarded('knowledge:manage');

  const result = await db.update.updateMany({
    where: { id: parsed.data.id, rolloutId: rollout.id, deletedAt: null },
    data: { deletedAt: new Date(), updatedBy: userId },
  });
  if (result.count === 0) return { error: 'Update not found.' };
  return done('Archived.');
}
