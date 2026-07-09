import { siteConfig } from '@/config/site';

/**
 * Placeholder root page.
 *
 * This exists only so the application architecture compiles and runs. The real
 * entry experience (Organization → Rollout → Command Center) will replace it
 * once features are built.
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">{siteConfig.name}</h1>
      <p className="text-muted-foreground max-w-md text-balance">{siteConfig.description}</p>
      <p className="text-muted-foreground/70 text-sm">
        Application architecture initialized — no features built yet.
      </p>
    </main>
  );
}
