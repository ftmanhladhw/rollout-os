import { signOut } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

/**
 * Minimal first-run frame — deliberately not the app shell: the seven
 * lifecycle destinations are meaningless until an organization and rollout
 * exist. Sign-out stays reachable so nobody is trapped in onboarding.
 */
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between px-6">
        <span className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span
            aria-hidden="true"
            className="bg-primary text-primary-foreground grid size-5 shrink-0 place-items-center rounded text-[11px] font-bold"
          >
            R
          </span>
          {siteConfig.name}
        </span>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
