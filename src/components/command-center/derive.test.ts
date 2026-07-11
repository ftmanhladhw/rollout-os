import { describe, expect, it } from 'vitest';
import { dueLabel, isUrgent, milestoneSignal } from './derive';

const today = new Date('2026-07-10T09:00:00Z');

describe('dueLabel', () => {
  it('names overdue, today, and tomorrow; dates beyond that render short', () => {
    expect(dueLabel(new Date('2026-07-08'), today)).toBe('Overdue');
    expect(dueLabel(new Date('2026-07-10'), today)).toBe('Today');
    expect(dueLabel(new Date('2026-07-11'), today)).toBe('Tomorrow');
    expect(dueLabel(new Date('2026-07-20'), today)).toBe('20 Jul');
    expect(dueLabel(null, today)).toBe('—');
  });
});

describe('milestoneSignal', () => {
  it('blocked always wins, then overdue, then the seven-day warning window', () => {
    expect(milestoneSignal('blocked', new Date('2026-09-01'), today).label).toBe('Blocked');
    expect(milestoneSignal('in_progress', new Date('2026-07-01'), today)).toEqual({
      status: 'critical',
      label: 'Overdue',
    });
    expect(milestoneSignal('planned', new Date('2026-07-15'), today)).toEqual({
      status: 'warning',
      label: 'Due soon',
    });
    expect(milestoneSignal('planned', new Date('2026-08-30'), today)).toEqual({
      status: 'good',
      label: 'On track',
    });
    expect(milestoneSignal('planned', null, today).label).toBe('On track');
  });
});

describe('isUrgent', () => {
  it('flags critical priority and overdue/today items, nothing else', () => {
    expect(isUrgent('critical', null, today)).toBe(true);
    expect(isUrgent('low', new Date('2026-07-10'), today)).toBe(true);
    expect(isUrgent('high', new Date('2026-07-09'), today)).toBe(true);
    expect(isUrgent('high', new Date('2026-07-20'), today)).toBe(false);
    expect(isUrgent('medium', null, today)).toBe(false);
  });
});
