import { z } from 'zod';
import { EDITABLE_LIFECYCLE_STATUSES } from '@/config/terminology';

/**
 * Knowledge entity schemas (Documents · Meetings · Notes · Updates — the
 * PRD §18 Release 3 set). Shared shapes match Operations: 2–160 char name,
 * ≤2000 char optional description, optional YYYY-MM-DD dates.
 */

const name = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters.')
  .max(160, 'Name must be at most 160 characters.');

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be at most ${max} characters.`)
    .transform((value) => (value === '' ? undefined : value))
    .optional();

const description = optionalText(2000, 'Description');

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date.')
  .optional()
  .or(z.literal('').transform(() => undefined));

// Stored links render as clickable hrefs, so only http(s) may validate —
// a bare .url() would accept javascript: and data: schemes (stored XSS).
const httpUrl = z
  .string()
  .trim()
  .max(2048, 'Link must be at most 2048 characters.')
  .url('Enter a valid link (https://…).')
  .refine((value) => value.startsWith('https://') || value.startsWith('http://'), {
    message: 'Link must start with http:// or https://.',
  });

const optionalHttpUrl = httpUrl.optional().or(z.literal('').transform(() => undefined));

const status = z.enum(EDITABLE_LIFECYCLE_STATUSES);
const priority = z.enum(['low', 'medium', 'high', 'critical']);
const documentType = z.enum([
  'prd',
  'architecture',
  'design',
  'meeting_notes',
  'kt',
  'recording',
  'presentation',
  'spreadsheet',
  'release_notes',
  'contract',
  'other',
]);
const updateType = z.enum(['daily', 'weekly', 'executive']);
const id = z.string().uuid();

/** Optional phase assignment (the timeline groups by it); empty = none. */
const optionalPhaseId = z
  .string()
  .uuid()
  .optional()
  .or(z.literal('').transform(() => undefined));

// --- Documents (Domain Rule 9: referenced, never duplicated — url required) ---
export const createDocumentSchema = z.object({
  name,
  description,
  url: httpUrl,
  documentType,
  version: optionalText(40, 'Version'),
});
export const updateDocumentSchema = z.object({
  id,
  name,
  description,
  status,
  priority,
  url: httpUrl,
  documentType,
  version: optionalText(40, 'Version'),
});

// --- Meetings (participants & meeting actions are a later slice) ---
export const createMeetingSchema = z.object({
  name,
  description,
  meetingDate: optionalDate,
  agenda: optionalText(4000, 'Agenda'),
  summary: optionalText(4000, 'Summary'),
  recordingUrl: optionalHttpUrl,
  phaseId: optionalPhaseId,
});
export const updateMeetingSchema = z.object({
  id,
  name,
  description,
  status,
  priority,
  meetingDate: optionalDate,
  agenda: optionalText(4000, 'Agenda'),
  summary: optionalText(4000, 'Summary'),
  recordingUrl: optionalHttpUrl,
  phaseId: optionalPhaseId,
});

// --- Notes (simple markdown body) ---
export const createNoteSchema = z.object({
  name,
  body: optionalText(10000, 'Body'),
});
export const updateNoteSchema = z.object({
  id,
  name,
  status,
  priority,
  body: optionalText(10000, 'Body'),
});

// --- Updates (daily · weekly · executive) ---
export const createUpdateSchema = z.object({
  name,
  updateType,
  body: optionalText(10000, 'Body'),
});
export const updateUpdateSchema = z.object({
  id,
  name,
  status,
  priority,
  updateType,
  body: optionalText(10000, 'Body'),
});

export const archiveSchema = z.object({ id });
