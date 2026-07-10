import { Breadcrumbs } from './breadcrumbs';
import { MobileNav } from './mobile-nav';
import { SearchPlaceholder } from './search-placeholder';
import { UserMenu } from './user-menu';

/** Top bar: mobile nav trigger, location trail, and the global controls. */
export function AppHeader({ email }: { email: string }) {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b px-4 backdrop-blur md:px-6">
      <MobileNav />
      <Breadcrumbs />
      <div className="ml-auto flex items-center gap-2">
        <SearchPlaceholder />
        <UserMenu email={email} />
      </div>
    </header>
  );
}
