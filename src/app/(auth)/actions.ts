'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { rateLimit } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';
import {
  forgotPasswordSchema,
  loginSchema,
  magicLinkSchema,
  resetPasswordSchema,
  signupSchema,
} from './schemas';

/**
 * Auth server actions. Each action re-validates its input with Zod (the client
 * form validation is UX only), rate-limits by client IP (+ email where it
 * matters), returns `{ error }` on failure so the form can display it, and
 * redirects on success. Supabase error messages are mapped to our own copy —
 * raw provider messages can leak infrastructure detail.
 */

export type ActionResult = { error: string } | { success: string } | void;

/** Where auth emails (confirmation, magic link) land after verification. */
function emailRedirectTo() {
  return `${env.NEXT_PUBLIC_SITE_URL}/auth/confirm`;
}

/** Best-effort client IP for rate-limit scoping (Vercel sets x-forwarded-for). */
async function clientIp(): Promise<string> {
  const requestHeaders = await headers();
  return requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

const TOO_MANY = 'Too many attempts — wait a few minutes and try again.';

/** Our copy for Supabase auth errors; the fallback never echoes provider text. */
function authErrorMessage(error: { code?: string }): string {
  switch (error.code) {
    case 'invalid_credentials':
      return 'Email or password is incorrect.';
    case 'email_not_confirmed':
      return 'Confirm your email first — check your inbox for the link.';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return TOO_MANY;
    case 'weak_password':
      return 'Choose a stronger password (at least 8 characters).';
    case 'same_password':
      return 'Choose a password different from your current one.';
    default:
      return 'Something went wrong — try again.';
  }
}

export async function signInWithPassword(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Enter a valid email and password.' };
  }

  const allowed = await rateLimit({
    scope: `login:${await clientIp()}:${parsed.data.email}`,
    limit: 10,
    windowSeconds: 300,
  });
  if (!allowed) return { error: TOO_MANY };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: authErrorMessage(error) };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signUpWithPassword(input: unknown): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Enter a valid email and a password of at least 8 characters.' };
  }

  const allowed = await rateLimit({
    scope: `signup:${await clientIp()}`,
    limit: 5,
    windowSeconds: 3600,
  });
  if (!allowed) return { error: TOO_MANY };

  const supabase = await createClient();
  const { email, password } = parsed.data;
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: emailRedirectTo() },
  });
  if (error) {
    return { error: authErrorMessage(error) };
  }

  return { success: 'Check your email for a confirmation link.' };
}

export async function sendMagicLink(input: unknown): Promise<ActionResult> {
  const parsed = magicLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Enter a valid email address.' };
  }

  const allowed = await rateLimit({
    scope: `magic:${await clientIp()}:${parsed.data.email}`,
    limit: 3,
    windowSeconds: 900,
  });
  if (!allowed) return { error: TOO_MANY };

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
    return { error: authErrorMessage(error) };
  }

  return { success: 'Check your email for a sign-in link.' };
}

export async function sendPasswordReset(input: unknown): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Enter a valid email address.' };
  }

  const allowed = await rateLimit({
    scope: `reset:${await clientIp()}:${parsed.data.email}`,
    limit: 3,
    windowSeconds: 900,
  });
  if (!allowed) return { error: TOO_MANY };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/reset-password`,
  });
  // Supabase does not reveal whether the account exists (by design, and we
  // must not either); only operational errors (e.g. rate limits) surface.
  if (error) {
    return { error: authErrorMessage(error) };
  }

  return { success: 'If an account exists for that email, a reset link is on its way.' };
}

export async function resetPassword(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Password must be at least 8 characters.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { error: authErrorMessage(error) };
  }

  revalidatePath('/', 'layout');
  redirect('/');
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
