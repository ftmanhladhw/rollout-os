import { describe, expect, it } from 'vitest';
import { bucketKey } from './rate-limit';

describe('bucketKey', () => {
  it('is stable inside one window and rolls over at the boundary', () => {
    const windowSeconds = 300;
    const early = bucketKey('login:1.2.3.4', new Date('2026-07-10T12:00:10Z'), windowSeconds);
    const late = bucketKey('login:1.2.3.4', new Date('2026-07-10T12:04:50Z'), windowSeconds);
    const nextWindow = bucketKey('login:1.2.3.4', new Date('2026-07-10T12:05:10Z'), windowSeconds);
    expect(early).toBe(late);
    expect(nextWindow).not.toBe(early);
  });

  it('separates scopes and window sizes', () => {
    const now = new Date('2026-07-10T12:00:00Z');
    expect(bucketKey('login:a', now, 300)).not.toBe(bucketKey('login:b', now, 300));
    expect(bucketKey('login:a', now, 300)).not.toBe(bucketKey('login:a', now, 900));
  });
});
