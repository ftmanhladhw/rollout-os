'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';
import { loginSchema, magicLinkSchema, signupSchema } from './schemas';

/**
 * Auth server actions. Each action re-validates its input with Zod (the client
 * form validation is UX only), returns `{ error }` on failure so the form can
 * display it, and redirects on success.
 */

export type ActionResult = { error: string } | { success: string } | void;

/** Where auth emails (confirmation, magic link) land after verification. */
function emailRedirectTo() {
  return `${env.NEXT_PUBLIC_SITE_URL}/auth/confirm`;
}

export async function signInWithPassword(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Enter a valid email and password.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signUpWithPassword(input: unknown): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Enter a valid email and a password of at least 8 characters.' };
  }

  const supabase = await createClient();
  const { email, password } = parsed.data;
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: emailRedirectTo() },
  });
  if (error) {
    return { error: error.message };
  }

  return { success: 'Check your email for a confirmation link.' };
}

export async function sendMagicLink(input: unknown): Promise<ActionResult> {
  const parsed = magicLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Enter a valid email address.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      // Magic link signs in existing accounts only; sign-up is the explicit path.
      shouldCreateUser: false,
      emailRedirectTo: emailRedirectTo(),
    },
  });
  if (error) {
    return { error: error.message };
  }

  return { success: 'Check your email for a sign-in link.' };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    // Sign-out failing is not user-recoverable from a form; surface loudly.
    throw new Error(`Sign-out failed: ${error.message}`);
  }

  revalidatePath('/', 'layout');
  redirect('/login');
}
