import { z } from 'zod';
import { EDITABLE_LIFECYCLE_STATUSES } from '@/config/terminology';

/**
 * Administration schemas (Members · Rollout settings — the MVP slice of
 * PRD §7 Administration; teams, templates, and invites are later slices).
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

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date.')
  .optional()
  .or(z.literal('').transform(() => undefined));

const id = z.string().uuid();

/** Every assignable org role (docs/14). Super admin is not a role — it is a
 * platform flag settable only via SQL, so it never appears here. */
export const ASSIGNABLE_ROLES = [
  'org_admin',
  'consultant',
  'product_manager',
  'programme_manager',
  'engineering',
  'executive',
  'client',
] as const;

export const EXPERIENCE_PROFILES = [
  'executive',
  'programme_manager',
  'engineering',
  'consultant',
  'client',
] as const;

// --- Members ---
export const updateMemberSchema = z.object({
  id,
  role: z.enum(ASSIGNABLE_ROLES),
  experienceProfile: z.enum(EXPERIENCE_PROFILES),
});
export const removeMemberSchema = z.object({ id });

// --- Rollout settings ---
export const updateRolloutSchema = z.object({
  name,
  description: optionalText(2000, 'Description'),
  status: z.enum(EDITABLE_LIFECYCLE_STATUSES),
  health: z.enum(['green', 'amber', 'red']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  goLiveDate: optionalDate,
});

export const updateReadinessSchema = z.object({
  id,
  status: z.enum(['not_started', 'in_progress', 'ready']),
});
