import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Sign in' };

/**
 * Sign-in page. Server component so the `error` search param (set by
 * /auth/confirm on failed link verification) is read without a client
 * useSearchParams/Suspense dance.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <LoginForm initialError={error} />;
}
