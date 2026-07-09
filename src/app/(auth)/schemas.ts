import { z } from 'zod';

/**
 * Auth form schemas, shared between the client forms (UX validation) and the
 * server actions (the actual security boundary — never trust client input).
 */

const email = z.string().email('Enter a valid email address');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  email,
  // Supabase's default minimum password length is 6; we require 8.
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const magicLinkSchema = z.object({ email });

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type MagicLinkValues = z.infer<typeof magicLinkSchema>;
