import { z } from 'zod';
import { EDITABLE_LIFECYCLE_STATUSES } from '@/config/terminology';

/**
 * Workstream form schemas — shared by client forms (UX validation) and
 * re-validated inside the server actions (the real gate).
 */

const workstreamName = z
  .string()
  .trim()
  .min(2, 'Workstream name must be at least 2 characters.')
  .max(120, 'Workstream name must be at most 120 characters.');

const workstreamDescription = z
  .string()
  .trim()
  .max(2000, 'Description must be at most 2000 characters.')
  .transform((value) => (value === '' ? undefined : value))
  .optional();

/** Manual progress (docs/09: 0–100, no automatic roll-up in the MVP). */
const workstreamProgress = z.coerce
  .number()
  .int('Progress must be a whole number.')
  .min(0, 'Progress must be between 0 and 100.')
  .max(100, 'Progress must be between 0 and 100.');

export const createWorkstreamSchema = z.object({
  programmeId: z.string().uuid('Choose a programme.'),
  name: workstreamName,
  description: workstreamDescription,
});

export const updateWorkstreamSchema = z.object({
  id: z.string().uuid(),
  name: workstreamName,
  description: workstreamDescription,
  status: z.enum(EDITABLE_LIFECYCLE_STATUSES),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  progress: workstreamProgress,
});

export const archiveWorkstreamSchema = z.object({ id: z.string().uuid() });

export type CreateWorkstreamValues = z.infer<typeof createWorkstreamSchema>;
export type UpdateWorkstreamValues = z.infer<typeof updateWorkstreamSchema>;
