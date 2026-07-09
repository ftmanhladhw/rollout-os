import type { ExperienceProfile, MemberRole } from '@prisma/client';

/**
 * The static permission matrix (design record: docs/14_auth_authorization.md).
 *
 * Deliberately a code-reviewed constant, not database configuration: the MVP
 * principle is opinionated defaults, and a matrix in code cannot be corrupted
 * at runtime. Roles define what a user CAN DO; experience profiles (separate,
 * see DEFAULT_EXPERIENCE_PROFILE) only define how the UI behaves and are
 * never consulted in a permission check.
 */

export const ACTIONS = [
  /** Organization settings, members, and role assignment. */
  'org:manage',
  /** Create and archive rollouts. */
  'rollout:create',
  /** Edit rollout fields: health, readiness, phases, terminology. */
  'rollout:manage',
  /** CRUD on programmes, workstreams, milestones. */
  'structure:manage',
  /** Full operations CRUD incl. risks and decisions. */
  'operations:manage',
  /** Execution-side CRUD: tasks, issues, dependencies, deliverables. */
  'operations:execute',
  /** Update status/fields of items assigned to me. */
  'assigned:update',
  /** Full knowledge CRUD: documents, meetings, notes, updates. */
  'knowledge:manage',
  /** Create documents and notes only. */
  'knowledge:contribute',
  /** Generate and view reports. */
  'reports:generate',
  /** See internal-visibility rows. Absent → only visibility='client' rows. */
  'internal:view',
] as const;

export type Action = (typeof ACTIONS)[number];

const MATRIX: Record<MemberRole, readonly Action[]> = {
  org_admin: [
    'org:manage',
    'rollout:create',
    'rollout:manage',
    'structure:manage',
    'operations:manage',
    'operations:execute',
    'assigned:update',
    'knowledge:manage',
    'knowledge:contribute',
    'reports:generate',
    'internal:view',
  ],
  consultant: [
    'rollout:create',
    'rollout:manage',
    'structure:manage',
    'operations:manage',
    'operations:execute',
    'assigned:update',
    'knowledge:manage',
    'knowledge:contribute',
    'reports:generate',
    'internal:view',
  ],
  // Product Manager and Programme Manager are distinct roles with identical
  // permissions: doc 04 defines them as one profile, and inventing differences
  // the product docs don't specify would be guesswork.
  product_manager: [
    'rollout:manage',
    'structure:manage',
    'operations:manage',
    'operations:execute',
    'assigned:update',
    'knowledge:manage',
    'knowledge:contribute',
    'reports:generate',
    'internal:view',
  ],
  programme_manager: [
    'rollout:manage',
    'structure:manage',
    'operations:manage',
    'operations:execute',
    'assigned:update',
    'knowledge:manage',
    'knowledge:contribute',
    'reports:generate',
    'internal:view',
  ],
  engineering: ['operations:execute', 'assigned:update', 'knowledge:contribute', 'internal:view'],
  // Executives consume; they do not edit. Health/readiness are set by the
  // delivery side and read by leadership.
  executive: ['reports:generate', 'internal:view'],
  // Clients hold no actions: they read visibility='client' rows only, which
  // the query layer enforces via the absence of 'internal:view'.
  client: [],
};

export function roleCan(role: MemberRole, action: Action): boolean {
  return MATRIX[role].includes(action);
}

/**
 * Default experience profile per role. A membership's profile is initialized
 * from this and remains independently changeable — switching profile changes
 * the UI, never the permissions.
 */
export const DEFAULT_EXPERIENCE_PROFILE: Record<MemberRole, ExperienceProfile> = {
  org_admin: 'consultant',
  consultant: 'consultant',
  product_manager: 'programme_manager',
  programme_manager: 'programme_manager',
  engineering: 'engineering',
  executive: 'executive',
  client: 'client',
};
