import { describe, expect, it } from 'vitest';
import {
  createDocumentSchema,
  createMeetingSchema,
  createNoteSchema,
  createUpdateSchema,
  updateDocumentSchema,
  updateNoteSchema,
  updateUpdateSchema,
} from './schemas';

const UUID = '4f9c2e1a-0b3d-4c5e-8f6a-7b8c9d0e1f2a';

describe('document links (Domain Rule 9: referenced, never duplicated)', () => {
  it('requires a url on create', () => {
    expect(
      createDocumentSchema.safeParse({
        name: 'PRD',
        url: 'https://drive.example/prd',
        documentType: 'prd',
      }).success,
    ).toBe(true);
    expect(createDocumentSchema.safeParse({ name: 'PRD', documentType: 'prd' }).success).toBe(
      false,
    );
  });

  it('accepts only http(s) urls — javascript:/data: schemes never validate', () => {
    const base = { name: 'Doc', documentType: 'other' };
    expect(createDocumentSchema.safeParse({ ...base, url: 'http://intranet/doc' }).success).toBe(
      true,
    );
    expect(createDocumentSchema.safeParse({ ...base, url: 'javascript:alert(1)' }).success).toBe(
      false,
    );
    expect(
      createDocumentSchema.safeParse({ ...base, url: 'data:text/html,<script>' }).success,
    ).toBe(false);
    expect(createDocumentSchema.safeParse({ ...base, url: 'not a url' }).success).toBe(false);
  });

  it('accepts only known document types', () => {
    const base = { name: 'Doc', url: 'https://x.example/d' };
    expect(createDocumentSchema.safeParse({ ...base, documentType: 'kt' }).success).toBe(true);
    expect(createDocumentSchema.safeParse({ ...base, documentType: 'memo' }).success).toBe(false);
  });
});

describe('meeting recording link', () => {
  it('is optional, empty means unset, and must be http(s) when present', () => {
    expect(createMeetingSchema.safeParse({ name: 'Weekly sync' }).success).toBe(true);
    const empty = createMeetingSchema.safeParse({ name: 'Weekly sync', recordingUrl: '' });
    expect(empty.success).toBe(true);
    if (empty.success) expect(empty.data.recordingUrl).toBeUndefined();
    expect(
      createMeetingSchema.safeParse({ name: 'Sync', recordingUrl: 'javascript:alert(1)' }).success,
    ).toBe(false);
  });

  it('phase is optional on meetings: uuid or empty (unset), nothing else', () => {
    expect(createMeetingSchema.safeParse({ name: 'Sync', phaseId: UUID }).success).toBe(true);
    const empty = createMeetingSchema.safeParse({ name: 'Sync', phaseId: '' });
    expect(empty.success).toBe(true);
    if (empty.success) expect(empty.data.phaseId).toBeUndefined();
    expect(createMeetingSchema.safeParse({ name: 'Sync', phaseId: 'uat' }).success).toBe(false);
  });

  it('accepts YYYY-MM-DD meeting dates and rejects other formats', () => {
    expect(createMeetingSchema.safeParse({ name: 'Sync', meetingDate: '2026-07-10' }).success).toBe(
      true,
    );
    expect(createMeetingSchema.safeParse({ name: 'Sync', meetingDate: '10/07/2026' }).success).toBe(
      false,
    );
  });
});

describe('notes and updates', () => {
  it('note needs only a name; body is optional and empty means unset', () => {
    expect(createNoteSchema.safeParse({ name: 'Access details' }).success).toBe(true);
    const empty = createNoteSchema.safeParse({ name: 'Access details', body: '' });
    expect(empty.success).toBe(true);
    if (empty.success) expect(empty.data.body).toBeUndefined();
  });

  it('update accepts only daily/weekly/executive types', () => {
    expect(createUpdateSchema.safeParse({ name: 'W27', updateType: 'weekly' }).success).toBe(true);
    expect(createUpdateSchema.safeParse({ name: 'W27', updateType: 'monthly' }).success).toBe(
      false,
    );
  });
});

describe('statuses', () => {
  it('rejects archived as a settable status everywhere', () => {
    expect(
      updateDocumentSchema.safeParse({
        id: UUID,
        name: 'Doc',
        status: 'archived',
        priority: 'low',
        url: 'https://x.example/d',
        documentType: 'other',
      }).success,
    ).toBe(false);
    expect(
      updateNoteSchema.safeParse({ id: UUID, name: 'N', status: 'archived', priority: 'low' })
        .success,
    ).toBe(false);
    expect(
      updateUpdateSchema.safeParse({
        id: UUID,
        name: 'U',
        status: 'archived',
        priority: 'low',
        updateType: 'weekly',
      }).success,
    ).toBe(false);
  });
});
