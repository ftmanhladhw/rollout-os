import { describe, expect, it } from 'vitest';
import {
  createDecisionSchema,
  createMilestoneSchema,
  createRiskSchema,
  createTaskSchema,
  updateIssueSchema,
  updateRiskSchema,
  updateTaskSchema,
} from './schemas';

const UUID = '4f9c2e1a-0b3d-4c5e-8f6a-7b8c9d0e1f2a';

describe('operations create schemas — parent requirements', () => {
  it('milestone requires a workstream uuid (Domain Rule 3)', () => {
    expect(createMilestoneSchema.safeParse({ workstreamId: UUID, name: 'UAT done' }).success).toBe(
      true,
    );
    expect(createMilestoneSchema.safeParse({ name: 'UAT done' }).success).toBe(false);
  });

  it('task requires a milestone uuid (Domain Rule 4)', () => {
    expect(createTaskSchema.safeParse({ milestoneId: UUID, name: 'Write checklist' }).success).toBe(
      true,
    );
    expect(createTaskSchema.safeParse({ name: 'Write checklist' }).success).toBe(false);
  });

  it('risk and decision need no parent id — owner/affects are filled server-side (Rules 6 & 7)', () => {
    expect(
      createRiskSchema.safeParse({ name: 'Vendor slippage', probability: 'high', impact: 'medium' })
        .success,
    ).toBe(true);
    expect(createDecisionSchema.safeParse({ name: 'Scope frozen' }).success).toBe(true);
  });
});

describe('risk levels', () => {
  it('accepts only low/medium/high — critical is a priority, not a risk level', () => {
    expect(
      createRiskSchema.safeParse({ name: 'Ok', probability: 'low', impact: 'high' }).success,
    ).toBe(true);
    expect(
      createRiskSchema.safeParse({ name: 'Ok', probability: 'critical', impact: 'low' }).success,
    ).toBe(false);
    expect(
      updateRiskSchema.safeParse({
        id: UUID,
        name: 'Ok',
        status: 'draft',
        priority: 'critical',
        probability: 'medium',
        impact: 'extreme',
      }).success,
    ).toBe(false);
  });
});

describe('dates and statuses', () => {
  it('accepts YYYY-MM-DD, treats empty as unset, rejects other formats', () => {
    const base = { milestoneId: UUID, name: 'Task' };
    expect(createTaskSchema.safeParse({ ...base, dueDate: '2026-08-01' }).success).toBe(true);
    const empty = createTaskSchema.safeParse({ ...base, dueDate: '' });
    expect(empty.success).toBe(true);
    if (empty.success) expect(empty.data.dueDate).toBeUndefined();
    expect(createTaskSchema.safeParse({ ...base, dueDate: '01/08/2026' }).success).toBe(false);
  });

  it('phase is optional on milestones: uuid or empty (unset), nothing else', () => {
    const base = { workstreamId: UUID, name: 'UAT done' };
    expect(createMilestoneSchema.safeParse({ ...base, phaseId: UUID }).success).toBe(true);
    const empty = createMilestoneSchema.safeParse({ ...base, phaseId: '' });
    expect(empty.success).toBe(true);
    if (empty.success) expect(empty.data.phaseId).toBeUndefined();
    expect(createMilestoneSchema.safeParse({ ...base, phaseId: 'discovery' }).success).toBe(false);
  });

  it('rejects archived as a settable status everywhere', () => {
    expect(
      updateTaskSchema.safeParse({ id: UUID, name: 'T', status: 'archived', priority: 'low' })
        .success,
    ).toBe(false);
    expect(
      updateIssueSchema.safeParse({ id: UUID, name: 'I', status: 'archived', priority: 'low' })
        .success,
    ).toBe(false);
  });
});
