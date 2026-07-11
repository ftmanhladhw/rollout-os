'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActivityVerb, EntityType } from '@prisma/client';
import { logActivity } from '@/lib/activity';
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

/** Log the mutation to the activity feed, then revalidate and return. */
async function logged(
  message: string,
  ctx: { rollout: { id: string }; userId: string },
  verb: ActivityVerb,
  entityType: EntityType,
  entityId: string,
  entityName: string,
): Promise<ActionResult> {
  await logActivity({
    rolloutId: ctx.rollout.id,
    actorId: ctx.userId,
    verb,
    entityType,
    entityId,
    entityName,
  });
  return done(message);
}

/** Denormalized name for archive log entries (the soft-deleted row remains). */
const NAME_LOOKUP = {
  document: (id: string) => db.document.findUnique({ where: { id }, select: { name: true } }),
  meeting: (id: string) => db.meeting.findUnique({ where: { id }, select: { name: true } }),
  note: (id: string) => db.note.findUnique({ where: { id }, select: { name: true } }),
  update: (id: string) => db.update.findUnique({ where: { id }, select: { name: true } }),
} satisfies Partial<Record<EntityType, (id: string) => Promise<{ name: string } | null>>>;

async function archivedName(model: keyof typeof NAME_LOOKUP, id: string): Promise<string> {
  const row = await NAME_LOOKUP[model](id);
  return row?.name ?? model;
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

  const document = await db.document.create({
    data: {
      rolloutId: rollout.id,
      name: parsed.data.name,
      description: parsed.data.description,
      url: parsed.data.url,
      documentType: parsed.data.documentType,
      version: parsed.data.version,
      createdBy: userId,
    },
    select: { id: true },
  });
  return logged(
    'Document referenced.',
    { rollout, userId },
    'created',
    'document',
    document.id,
    parsed.data.name,
  );
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
  return logged('Saved.', { rollout, userId }, 'updated', 'document', id, parsed.data.name);
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
  return logged(
    'Archived.',
    { rollout, userId },
    'deleted',
    'document',
    parsed.data.id,
    await archivedName('document', parsed.data.id),
  );
}

// --- Meetings ---

export async function createMeeting(input: unknown): Promise<ActionResult> {
  const parsed = createMeetingSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { rollout, userId } = await guarded('knowledge:manage');
  if (!(await phaseIsValid(parsed.data.phaseId, rollout.id))) return { error: 'Phase not found.' };

  const meeting = await db.meeting.create({
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
    select: { id: true },
  });
  return logged(
    'Meeting recorded.',
    { rollout, userId },
    'created',
    'meeting',
    meeting.id,
    parsed.data.name,
  );
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
  return logged('Saved.', { rollout, userId }, 'updated', 'meeting', id, parsed.data.name);
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
  return logged(
    'Archived.',
    { rollout, userId },
    'deleted',
    'meeting',
    parsed.data.id,
    await archivedName('meeting', parsed.data.id),
  );
}

// --- Notes ---

export async function createNote(input: unknown): Promise<ActionResult> {
  const parsed = createNoteSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { rollout, userId } = await guarded('knowledge:contribute');

  const note = await db.note.create({
    data: {
      rolloutId: rollout.id,
      name: parsed.data.name,
      body: parsed.data.body,
      createdBy: userId,
    },
    select: { id: true },
  });
  return logged('Note added.', { rollout, userId }, 'created', 'note', note.id, parsed.data.name);
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
  return logged('Saved.', { rollout, userId }, 'updated', 'note', id, parsed.data.name);
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
  return logged(
    'Archived.',
    { rollout, userId },
    'deleted',
    'note',
    parsed.data.id,
    await archivedName('note', parsed.data.id),
  );
}

// --- Updates ---

export async function createUpdate(input: unknown): Promise<ActionResult> {
  const parsed = createUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the fields.' };
  const { rollout, userId } = await guarded('knowledge:manage');

  const update = await db.update.create({
    data: {
      rolloutId: rollout.id,
      name: parsed.data.name,
      updateType: parsed.data.updateType,
      body: parsed.data.body,
      createdBy: userId,
    },
    select: { id: true },
  });
  return logged(
    'Update published.',
    { rollout, userId },
    'created',
    'update',
    update.id,
    parsed.data.name,
  );
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
  return logged('Saved.', { rollout, userId }, 'updated', 'update', id, parsed.data.name);
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
  return logged(
    'Archived.',
    { rollout, userId },
    'deleted',
    'update',
    parsed.data.id,
    await archivedName('update', parsed.data.id),
  );
}
