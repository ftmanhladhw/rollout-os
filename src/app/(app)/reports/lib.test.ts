import { describe, expect, it } from 'vitest';
import { averageProgress, rankRisks, readinessSummary, riskSeverity, windowStart } from './lib';

describe('risk ranking', () => {
  it('scores probability × impact on a 1–9 scale', () => {
    expect(riskSeverity('high', 'high')).toBe(9);
    expect(riskSeverity('low', 'high')).toBe(3);
    expect(riskSeverity('low', 'low')).toBe(1);
  });

  it('ranks worst-first and keeps input order on ties', () => {
    const ranked = rankRisks([
      { id: 'tie-1', probability: 'medium', impact: 'medium' } as const,
      { id: 'worst', probability: 'high', impact: 'high' } as const,
      { id: 'tie-2', probability: 'high', impact: 'low' } as const, // 3
      { id: 'mild', probability: 'low', impact: 'low' } as const,
    ]);
    expect(ranked.map((r) => r.id)).toEqual(['worst', 'tie-1', 'tie-2', 'mild']);
  });
});

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

describe('progress and windows', () => {
  it('averages manual workstream progress, rounded, 0 when empty', () => {
    expect(averageProgress([{ progress: 50 }, { progress: 75 }])).toBe(63);
    expect(averageProgress([])).toBe(0);
  });

  it('computes the reporting window start', () => {
    expect(windowStart(new Date('2026-07-10T12:00:00Z'), 7).toISOString()).toBe(
      '2026-07-03T12:00:00.000Z',
    );
  });
});
