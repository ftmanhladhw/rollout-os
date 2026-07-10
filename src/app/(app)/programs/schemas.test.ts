import { describe, expect, it } from 'vitest';
import { archiveProgrammeSchema, createProgrammeSchema, updateProgrammeSchema } from './schemas';

const UUID = '4f9c2e1a-0b3d-4c5e-8f6a-7b8c9d0e1f2a';

describe('createProgrammeSchema', () => {
  it('accepts a name and trims it', () => {
    const result = createProgrammeSchema.safeParse({ name: '  Partner Enablement  ' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Partner Enablement');
  });

  it('rejects names under 2 characters (after trim)', () => {
    expect(createProgrammeSchema.safeParse({ name: ' A ' }).success).toBe(false);
    expect(createProgrammeSchema.safeParse({ name: '' }).success).toBe(false);
  });

  it('rejects names over 120 characters', () => {
    expect(createProgrammeSchema.safeParse({ name: 'x'.repeat(121) }).success).toBe(false);
  });

  it('normalizes an empty description to undefined', () => {
    const result = createProgrammeSchema.safeParse({ name: 'Ok name', description: '  ' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.description).toBeUndefined();
  });

  it('rejects descriptions over 2000 characters', () => {
    expect(
      createProgrammeSchema.safeParse({ name: 'Ok name', description: 'x'.repeat(2001) }).success,
    ).toBe(false);
  });
});

describe('updateProgrammeSchema', () => {
  const valid = { id: UUID, name: 'Renamed', status: 'in_progress', priority: 'high' };

  it('accepts a full valid update', () => {
    expect(updateProgrammeSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a non-uuid id', () => {
    expect(updateProgrammeSchema.safeParse({ ...valid, id: 'nope' }).success).toBe(false);
  });

  it('rejects archived as a settable status — archival is the soft-delete action, not an edit', () => {
    expect(updateProgrammeSchema.safeParse({ ...valid, status: 'archived' }).success).toBe(false);
  });

  it('rejects unknown status and priority values', () => {
    expect(updateProgrammeSchema.safeParse({ ...valid, status: 'on_fire' }).success).toBe(false);
    expect(updateProgrammeSchema.safeParse({ ...valid, priority: 'urgent' }).success).toBe(false);
  });
});

describe('archiveProgrammeSchema', () => {
  it('requires a uuid id', () => {
    expect(archiveProgrammeSchema.safeParse({ id: UUID }).success).toBe(true);
    expect(archiveProgrammeSchema.safeParse({ id: '123' }).success).toBe(false);
  });
});
