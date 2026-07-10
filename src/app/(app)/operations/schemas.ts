import { z } from 'zod';
import { EDITABLE_LIFECYCLE_STATUSES } from '@/config/terminology';

/**
 * Operations entity schemas (Tasks · Milestones · Risks · Issues ·
 * Decisions — the PRD §18 Release 2 set). Shared shapes: 2–160 char name,
 * ≤2000 char optional description, optional YYYY-MM-DD date fields.
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

const status = z.enum(EDITABLE_LIFECYCLE_STATUSES);
const priority = z.enum(['low', 'medium', 'high', 'critical']);
const riskLevel = z.enum(['low', 'medium', 'high']);
const id = z.string().uuid();

/** Optional phase assignment (the timeline groups by it); empty = none. */
const optionalPhaseId = z
  .string()
  .uuid()
  .optional()
  .or(z.literal('').transform(() => undefined));

// --- Milestones (Domain Rule 3: belongs to a workstream) ---
export const createMilestoneSchema = z.object({
  workstreamId: z.string().uuid('Choose a workstream.'),
  name,
  description,
  dueDate: optionalDate,
  phaseId: optionalPhaseId,
});
export const updateMilestoneSchema = z.object({
  id,
  name,
  description,
  status,
  priority,
  dueDate: optionalDate,
  phaseId: optionalPhaseId,
});

// --- Tasks (Domain Rule 4: contributes to a milestone) ---
export const createTaskSchema = z.object({
  milestoneId: z.string().uuid('Choose a milestone.'),
  name,
  description,
  dueDate: optionalDate,
});
export const updateTaskSchema = z.object({
  id,
  name,
  description,
  status,
  priority,
  dueDate: optionalDate,
});

// --- Risks (Domain Rule 6: owner required — filled server-side with the
// caller's stakeholder until Administration manages stakeholders) ---
export const createRiskSchema = z.object({
  name,
  description,
  probability: riskLevel,
  impact: riskLevel,
  mitigation: optionalText(2000, 'Mitigation'),
});
export const updateRiskSchema = z.object({
  id,
  name,
  description,
  status,
  priority,
  probability: riskLevel,
  impact: riskLevel,
  mitigation: optionalText(2000, 'Mitigation'),
});

// --- Issues ---
export const createIssueSchema = z.object({
  name,
  description,
});
export const updateIssueSchema = z.object({
  id,
  name,
  description,
  status,
  priority,
  resolution: optionalText(2000, 'Resolution'),
});

// --- Decisions (Domain Rule 7: affects an entity — the rollout itself in
// this MVP slice; finer-grained targets come with later modules) ---
export const createDecisionSchema = z.object({
  name,
  description,
  reason: optionalText(2000, 'Reason'),
  decisionDate: optionalDate,
});
export const updateDecisionSchema = z.object({
  id,
  name,
  description,
  status,
  priority,
  reason: optionalText(2000, 'Reason'),
  decisionDate: optionalDate,
});

export const archiveSchema = z.object({ id });
