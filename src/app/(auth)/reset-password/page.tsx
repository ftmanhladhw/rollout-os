import type { Metadata } from 'next';
import { ResetPasswordForm } from './reset-password-form';

export const metadata: Metadata = { title: 'Choose a new password' };

/**
 * Reached via the recovery link (/auth/confirm?type=recovery&next=/reset-password),
 * which establishes a session first — middleware sends signed-out visitors to
 * /login like any other protected route.
 */
export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
