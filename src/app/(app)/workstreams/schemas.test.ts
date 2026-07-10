import { describe, expect, it } from 'vitest';
import { archiveWorkstreamSchema, createWorkstreamSchema, updateWorkstreamSchema } from './schemas';

const UUID = '4f9c2e1a-0b3d-4c5e-8f6a-7b8c9d0e1f2a';

describe('createWorkstreamSchema', () => {
  it('requires a programme uuid (Domain Rule 2)', () => {
    expect(
      createWorkstreamSchema.safeParse({ programmeId: UUID, name: 'Engineering' }).success,
    ).toBe(true);
    expect(createWorkstreamSchema.safeParse({ name: 'Engineering' }).success).toBe(false);
    expect(createWorkstreamSchema.safeParse({ programmeId: '', name: 'Engineering' }).success).toBe(
      false,
    );
  });

  it('trims the name and rejects under 2 / over 120 characters', () => {
    const ok = createWorkstreamSchema.safeParse({ programmeId: UUID, name: '  QA  ' });
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data.name).toBe('QA');
    expect(createWorkstreamSchema.safeParse({ programmeId: UUID, name: 'A' }).success).toBe(false);
    expect(
      createWorkstreamSchema.safeParse({ programmeId: UUID, name: 'x'.repeat(121) }).success,
    ).toBe(false);
  });
});

describe('updateWorkstreamSchema — progress bounds', () => {
  const valid = { id: UUID, name: 'Engineering', status: 'in_progress', priority: 'high' };

  it('accepts 0, 100, and coerces numeric strings from the form', () => {
    expect(updateWorkstreamSchema.safeParse({ ...valid, progress: 0 }).success).toBe(true);
    expect(updateWorkstreamSchema.safeParse({ ...valid, progress: 100 }).success).toBe(true);
    const coerced = updateWorkstreamSchema.safeParse({ ...valid, progress: '62' });
    expect(coerced.success).toBe(true);
    if (coerced.success) expect(coerced.data.progress).toBe(62);
  });

  it('rejects out-of-range and non-integer progress', () => {
    expect(updateWorkstreamSchema.safeParse({ ...valid, progress: -1 }).success).toBe(false);
    expect(updateWorkstreamSchema.safeParse({ ...valid, progress: 101 }).success).toBe(false);
    expect(updateWorkstreamSchema.safeParse({ ...valid, progress: 33.5 }).success).toBe(false);
    expect(updateWorkstreamSchema.safeParse({ ...valid, progress: 'lots' }).success).toBe(false);
  });

  it('rejects archived as a settable status', () => {
    expect(
      updateWorkstreamSchema.safeParse({ ...valid, progress: 10, status: 'archived' }).success,
    ).toBe(false);
  });
});

describe('archiveWorkstreamSchema', () => {
  it('requires a uuid id', () => {
    expect(archiveWorkstreamSchema.safeParse({ id: UUID }).success).toBe(true);
    expect(archiveWorkstreamSchema.safeParse({ id: 'nope' }).success).toBe(false);
  });
});
