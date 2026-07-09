import { signOut } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { createClient } from '@/lib/supabase/server';

/**
 * Placeholder root page, now behind auth (middleware redirects signed-out
 * visitors to /login). Shows the signed-in user and a sign-out button to prove
 * the auth loop end-to-end. The real entry experience (Organization → Rollout
 * → Command Center) will replace it once features are built.
 */
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">{siteConfig.name}</h1>
      <p className="text-muted-foreground max-w-md text-balance">{siteConfig.description}</p>
      <p className="text-muted-foreground/70 text-sm">
        Application architecture initialized — no features built yet.
      </p>
      {user ? (
        <div className="mt-4 flex items-center gap-3">
          <span className="text-muted-foreground text-sm">Signed in as {user.email}</span>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      ) : null}
    </main>
  );
}
