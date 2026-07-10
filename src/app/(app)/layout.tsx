import { AppHeader } from '@/components/shell/app-header';
import { AppSidebar } from '@/components/shell/app-sidebar';
import { createClient } from '@/lib/supabase/server';

/**
 * Authenticated application shell: sidebar (desktop) / nav sheet (mobile),
 * header with breadcrumbs + global controls, and the page area. Middleware
 * guarantees a session for everything in this route group.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
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
