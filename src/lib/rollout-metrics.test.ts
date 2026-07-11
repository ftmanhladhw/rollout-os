import { describe, expect, it } from 'vitest';
import { averageProgress, daysUntil, goLiveCountdown, readinessSummary } from './rollout-metrics';

describe('readiness summary', () => {
  it('is ready only when every dimension is ready', () => {
    expect(readinessSummary([{ status: 'ready' }, { status: 'ready' }]).overall).toBe('ready');
    expect(readinessSummary([{ status: 'ready' }, { status: 'in_progress' }]).overall).toBe(
      'in_progress',
    );
    expect(readinessSummary([{ status: 'not_started' }]).overall).toBe('not_started');
    expect(readinessSummary([]).overall).toBe('not_started');
  });

  it('counts each status bucket', () => {
    const summary = readinessSummary([
      { status: 'ready' },
      { status: 'in_progress' },
      { status: 'not_started' },
      { status: 'not_started' },
    ]);
    expect(summary).toMatchObject({ ready: 1, inProgress: 1, notStarted: 2 });
  });
});

describe('progress', () => {
  it('averages manual workstream progress, rounded, 0 when empty', () => {
    expect(averageProgress([{ progress: 50 }, { progress: 75 }])).toBe(63);
    expect(averageProgress([])).toBe(0);
  });
});

describe('go-live countdown', () => {
  const today = new Date('2026-07-10T15:30:00Z');

  it('counts whole days regardless of time of day', () => {
    expect(daysUntil(new Date('2026-07-12T01:00:00Z'), today)).toBe(2);
    expect(daysUntil(new Date('2026-07-08T23:00:00Z'), today)).toBe(-2);
  });

  it('renders the marker copy for future, boundary, and past dates', () => {
    expect(goLiveCountdown(new Date('2026-08-28'), today)).toBe('In 49 days');
    expect(goLiveCountdown(new Date('2026-07-11'), today)).toBe('Tomorrow');
    expect(goLiveCountdown(new Date('2026-07-10'), today)).toBe('Today');
    expect(goLiveCountdown(new Date('2026-07-09'), today)).toBe('Yesterday');
    expect(goLiveCountdown(new Date('2026-07-01'), today)).toBe('9 days ago');
    expect(goLiveCountdown(null, today)).toBe('No go-live date set');
  });
});
