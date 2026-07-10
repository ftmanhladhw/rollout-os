import { z } from 'zod';

/**
 * Onboarding form schemas — shared by the client forms (UX validation) and
 * re-validated inside the server actions (the real gate).
 */

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Organization name must be at least 2 characters.')
    .max(80, 'Organization name must be at most 80 characters.'),
});

export const createRolloutSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Rollout name must be at least 2 characters.')
    .max(120, 'Rollout name must be at most 120 characters.'),
  /** Optional target go-live, as the date input's YYYY-MM-DD string. */
  goLiveDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date.')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export type CreateOrganizationValues = z.infer<typeof createOrganizationSchema>;
export type CreateRolloutValues = z.infer<typeof createRolloutSchema>;
