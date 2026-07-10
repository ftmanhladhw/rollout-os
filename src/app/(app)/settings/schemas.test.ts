import { describe, expect, it } from 'vitest';
import {
  removeMemberSchema,
  updateMemberSchema,
  updateReadinessSchema,
  updateRolloutSchema,
} from './schemas';

const UUID = '4f9c2e1a-0b3d-4c5e-8f6a-7b8c9d0e1f2a';

describe('member management', () => {
  it('accepts every docs/14 role and rejects invented ones', () => {
    for (const role of ['org_admin', 'consultant', 'engineering', 'client'] as const) {
      expect(
        updateMemberSchema.safeParse({ id: UUID, role, experienceProfile: 'consultant' }).success,
      ).toBe(true);
    }
    expect(
      updateMemberSchema.safeParse({ id: UUID, role: 'super_admin', experienceProfile: 'client' })
        .success,
    ).toBe(false);
    expect(
      updateMemberSchema.safeParse({ id: UUID, role: 'owner', experienceProfile: 'client' })
        .success,
    ).toBe(false);
  });

  it('experience profile is its own five-value set, not the role set', () => {
    expect(
      updateMemberSchema.safeParse({ id: UUID, role: 'client', experienceProfile: 'org_admin' })
        .success,
    ).toBe(false);
  });

  it('removal takes a uuid only', () => {
    expect(removeMemberSchema.safeParse({ id: UUID }).success).toBe(true);
    expect(removeMemberSchema.safeParse({ id: 'me' }).success).toBe(false);
  });
});

describe('rollout settings', () => {
  const base = { name: 'CSR 2026', status: 'in_progress', health: 'amber', priority: 'high' };

  it('health is the manual green/amber/red field', () => {
    expect(updateRolloutSchema.safeParse(base).success).toBe(true);
    expect(updateRolloutSchema.safeParse({ ...base, health: 'blue' }).success).toBe(false);
  });

  it('archived is not a settable rollout status (archival is an action)', () => {
    expect(updateRolloutSchema.safeParse({ ...base, status: 'archived' }).success).toBe(false);
  });

  it('go-live accepts YYYY-MM-DD or empty (unset)', () => {
    expect(updateRolloutSchema.safeParse({ ...base, goLiveDate: '2026-08-28' }).success).toBe(true);
    const empty = updateRolloutSchema.safeParse({ ...base, goLiveDate: '' });
    expect(empty.success).toBe(true);
    if (empty.success) expect(empty.data.goLiveDate).toBeUndefined();
    expect(updateRolloutSchema.safeParse({ ...base, goLiveDate: '28/08/2026' }).success).toBe(
      false,
    );
  });
});

describe('readiness assessment', () => {
  it('accepts only the manual three-state readiness statuses', () => {
    expect(updateReadinessSchema.safeParse({ id: UUID, status: 'ready' }).success).toBe(true);
    expect(updateReadinessSchema.safeParse({ id: UUID, status: 'in_progress' }).success).toBe(true);
    expect(updateReadinessSchema.safeParse({ id: UUID, status: 'done' }).success).toBe(false);
  });
});
