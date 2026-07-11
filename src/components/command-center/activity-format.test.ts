import { describe, expect, it } from 'vitest';
import { activityText, timeAgo } from './activity-format';

describe('activityText', () => {
  it('reads mid-sentence with lowercase entity labels and curly quotes', () => {
    expect(activityText('created', 'task', 'Write checklist')).toBe(
      'created task “Write checklist”',
    );
    expect(activityText('updated', 'action_item', 'Chase vendor')).toBe(
      'updated action item “Chase vendor”',
    );
  });

  it('renders soft delete as archived (docs/09 semantics)', () => {
    expect(activityText('deleted', 'risk', 'Vendor slippage')).toBe(
      'archived risk “Vendor slippage”',
    );
  });
});

describe('timeAgo', () => {
  const now = new Date('2026-07-10T12:00:00Z');

  it('scales from just-now through minutes, hours, and days', () => {
    expect(timeAgo(new Date('2026-07-10T11:59:30Z'), now)).toBe('just now');
    expect(timeAgo(new Date('2026-07-10T11:45:00Z'), now)).toBe('15m ago');
    expect(timeAgo(new Date('2026-07-10T07:00:00Z'), now)).toBe('5h ago');
    expect(timeAgo(new Date('2026-07-08T12:00:00Z'), now)).toBe('2d ago');
  });

  it('falls back to a short date beyond a week and never goes negative', () => {
    expect(timeAgo(new Date('2026-06-20T12:00:00Z'), now)).toBe('20 Jun');
    expect(timeAgo(new Date('2026-07-10T12:00:05Z'), now)).toBe('just now');
  });
});
