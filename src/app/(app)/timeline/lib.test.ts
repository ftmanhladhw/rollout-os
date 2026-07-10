import { describe, expect, it } from 'vitest';
import { daysUntil, goLiveCountdown, groupByPhase, type TimelineItem } from './lib';

const PHASES = [
  { id: 'p-discovery', name: 'Discovery' },
  { id: 'p-build', name: 'Build' },
];

function item(overrides: Partial<TimelineItem>): TimelineItem {
  return {
    id: 'x',
    kind: 'milestone',
    name: 'Item',
    status: 'planned',
    date: null,
    phaseId: null,
    context: null,
    ...overrides,
  };
}

describe('groupByPhase', () => {
  it('keeps empty phases, in the given order, and sorts items by date with undated last', () => {
    const items = [
      item({ id: 'b', phaseId: 'p-build', date: new Date('2026-09-01') }),
      item({ id: 'a', phaseId: 'p-build', date: new Date('2026-08-01') }),
      item({ id: 'c', phaseId: 'p-build', date: null }),
    ];
    const groups = groupByPhase(PHASES, items);
    expect(groups).toHaveLength(2);
    expect(groups[0]?.phase?.name).toBe('Discovery');
    expect(groups[0]?.items).toHaveLength(0);
    expect(groups[1]?.items.map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('collects unphased and unknown-phase items in a trailing group, only when non-empty', () => {
    const items = [item({ id: 'u1', phaseId: null }), item({ id: 'u2', phaseId: 'deleted-phase' })];
    const groups = groupByPhase(PHASES, items);
    expect(groups).toHaveLength(3);
    expect(groups[2]?.phase).toBeNull();
    expect(groups[2]?.items.map((i) => i.id)).toEqual(['u1', 'u2']);

    expect(groupByPhase(PHASES, [])).toHaveLength(2);
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
