import { z } from 'zod';
import { EDITABLE_LIFECYCLE_STATUSES } from '@/config/terminology';

/**
 * Programme form schemas — shared by client forms (UX validation) and
 * re-validated inside the server actions (the real gate).
 */

const programmeName = z
  .string()
  .trim()
  .min(2, 'Programme name must be at least 2 characters.')
  .max(120, 'Programme name must be at most 120 characters.');

const programmeDescription = z
  .string()
  .trim()
  .max(2000, 'Description must be at most 2000 characters.')
  .transform((value) => (value === '' ? undefined : value))
  .optional();

export const createProgrammeSchema = z.object({
  name: programmeName,
  description: programmeDescription,
});

export const updateProgrammeSchema = z.object({
  id: z.string().uuid(),
  name: programmeName,
  description: programmeDescription,
  status: z.enum(EDITABLE_LIFECYCLE_STATUSES),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
});

export const archiveProgrammeSchema = z.object({ id: z.string().uuid() });

export type CreateProgrammeValues = z.infer<typeof createProgrammeSchema>;
export type UpdateProgrammeValues = z.infer<typeof updateProgrammeSchema>;
