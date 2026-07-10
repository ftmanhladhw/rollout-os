import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getOnboardingState } from '@/lib/onboarding';
import { RolloutForm } from './rollout-form';

export const metadata: Metadata = { title: 'Create your first rollout' };

/** Step 2 of 2. Requires an organization; users with a rollout go home. */
export default async function CreateRolloutPage() {
  const state = await getOnboardingState();
  if (!state) redirect('/login');
  if (!state.organization) redirect('/onboarding');
  if (state.hasRollout) redirect('/');

  return <RolloutForm organizationName={state.organization.name} />;
}
