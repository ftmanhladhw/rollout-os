import { redirect } from 'next/navigation';
import { AppHeader } from '@/components/shell/app-header';
import { AppSidebar } from '@/components/shell/app-sidebar';
import { getOnboardingState } from '@/lib/onboarding';
import { createClient } from '@/lib/supabase/server';

/**
 * Authenticated application shell: sidebar (desktop) / nav sheet (mobile),
 * header with breadcrumbs + global controls, and the page area. Middleware
 * guarantees a session for everything in this route group; this layout adds
 * the first-run gate — no organization or no rollout yet means the shell has
 * nothing to show, so the user finishes onboarding first.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const state = await getOnboardingState();
  if (!state) redirect('/login');
  if (!state.organization) redirect('/onboarding');
  if (!state.hasRollout) redirect('/onboarding/rollout');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-svh">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader email={user?.email ?? ''} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
