import { createClient } from '@/lib/supabase/server';

/**
 * Server-side helpers for the private `attachments` bucket.
 *
 * The bucket's RLS policies (supabase/setup.sql) only allow a user to touch
 * objects under their own folder — paths must be `<userId>/...`. These helpers
 * build that prefix themselves so call sites cannot construct a path outside
 * the caller's folder.
 */

export const ATTACHMENTS_BUCKET = 'attachments';

function attachmentPath(userId: string, path: string) {
  const clean = path.replace(/^\/+/, '');
  if (!clean) {
    throw new Error('Attachment path must not be empty');
  }
  return `${userId}/${clean}`;
}

export async function uploadAttachment(
  userId: string,
  path: string,
  file: File | Blob | ArrayBuffer,
  options?: { contentType?: string; upsert?: boolean },
) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .upload(attachmentPath(userId, path), file, options);
  if (error) {
    throw new Error(`Upload failed for "${path}": ${error.message}`);
  }
  return data;
}

/** Time-limited download URL for a private object (default: 1 hour). */
export async function getAttachmentSignedUrl(
  userId: string,
  path: string,
  expiresInSeconds = 3600,
) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .createSignedUrl(attachmentPath(userId, path), expiresInSeconds);
  if (error) {
    throw new Error(`Signed URL failed for "${path}": ${error.message}`);
  }
  return data.signedUrl;
}

export async function deleteAttachment(userId: string, path: string) {
  const supabase = await createClient();
  const { error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .remove([attachmentPath(userId, path)]);
  if (error) {
    throw new Error(`Delete failed for "${path}": ${error.message}`);
  }
}
