/**
 * Opinionated defaults seeded per rollout at creation (docs/09 §7: phases and
 * readiness dimensions are configurable rows, not schema — this is the one
 * place the doc-04 defaults live in code). Editing them later is per-rollout
 * configuration; changing these arrays only affects new rollouts.
 */

/** The eight doc-04 lifecycle phases, in order. */
export const DEFAULT_PHASES = [
  'Discovery',
  'Planning',
  'Build',
  'Testing',
  'UAT',
  'Go Live',
  'Hypercare',
  'Closure',
] as const;

/** The seven doc-04 readiness dimensions, in order. */
export const DEFAULT_READINESS_DIMENSIONS = [
  'Engineering',
  'Documentation',
  'Data',
  'Security',
  'Training',
  'Partner',
  'Go Live',
] as const;
