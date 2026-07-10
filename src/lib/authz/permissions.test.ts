import { describe, expect, it } from 'vitest';
import { ACTIONS, DEFAULT_EXPERIENCE_PROFILE, roleCan } from './permissions';

/**
 * Executable spec of the docs/14 permission matrix. If a matrix edit changes
 * any of these, it must be a conscious docs/14 decision — update both.
 */

describe('permission matrix (docs/14)', () => {
  it('org:manage belongs to org_admin alone', () => {
    expect(roleCan('org_admin', 'org:manage')).toBe(true);
    for (const role of [
      'consultant',
      'product_manager',
      'programme_manager',
      'engineering',
      'executive',
      'client',
    ] as const) {
      expect(roleCan(role, 'org:manage'), role).toBe(false);
    }
  });

  it('rollout:create belongs to org_admin and consultant only', () => {
    expect(roleCan('org_admin', 'rollout:create')).toBe(true);
    expect(roleCan('consultant', 'rollout:create')).toBe(true);
    expect(roleCan('product_manager', 'rollout:create')).toBe(false);
    expect(roleCan('executive', 'rollout:create')).toBe(false);
  });

  it('structure:manage (programmes/workstreams/milestones CRUD) is held by the four delivery roles', () => {
    for (const role of [
      'org_admin',
      'consultant',
      'product_manager',
      'programme_manager',
    ] as const) {
      expect(roleCan(role, 'structure:manage'), role).toBe(true);
    }
    for (const role of ['engineering', 'executive', 'client'] as const) {
      expect(roleCan(role, 'structure:manage'), role).toBe(false);
    }
  });

  it('product_manager and programme_manager are permission-identical (doc 04: one profile)', () => {
    for (const action of ACTIONS) {
      expect(roleCan('product_manager', action), action).toBe(roleCan('programme_manager', action));
    }
  });

  it('executive reads everything and reports, writes nothing', () => {
    expect(roleCan('executive', 'internal:view')).toBe(true);
    expect(roleCan('executive', 'reports:generate')).toBe(true);
    for (const action of ACTIONS) {
      if (action === 'internal:view' || action === 'reports:generate') continue;
      expect(roleCan('executive', action), action).toBe(false);
    }
  });

  it('client holds no actions — internal:view absence drives client-only visibility filtering', () => {
    for (const action of ACTIONS) {
      expect(roleCan('client', action), action).toBe(false);
    }
  });

  it('every role has a default experience profile', () => {
    for (const role of [
      'org_admin',
      'consultant',
      'product_manager',
      'programme_manager',
      'engineering',
      'executive',
      'client',
    ] as const) {
      expect(DEFAULT_EXPERIENCE_PROFILE[role]).toBeTruthy();
    }
  });
});
