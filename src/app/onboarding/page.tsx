import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getOnboardingState } from '@/lib/onboarding';
import { OrganizationForm } from './organization-form';

export const metadata: Metadata = { title: 'Create your organization' };

/** Step 1 of 2. Users who already have an organization are moved forward. */
export default async function CreateOrganizationPage() {
  const state = await getOnboardingState();
  if (!state) redirect('/login');
  if (state.organization) {
    redirect(state.hasRollout ? '/' : '/onboarding/rollout');
  }

  return <OrganizationForm />;
}
