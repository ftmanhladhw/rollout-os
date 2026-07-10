import { Search } from 'lucide-react';

/**
 * Visual placeholder for global search. The real surface is the universal
 * command palette (⌘K — docs/07, Chapter 5); this reserves its spot in the
 * header until that ships. Disabled on purpose: a control that looks live but
 * does nothing is worse than one that is visibly not ready.
 */
export function SearchPlaceholder() {
  return (
    <>
      <button
        type="button"
        disabled
        title="Global search arrives with the command palette (⌘K)"
        className="border-input text-muted-foreground hidden h-8 w-56 cursor-not-allowed items-center gap-2 rounded-md border bg-transparent px-2.5 text-sm opacity-70 shadow-xs sm:inline-flex lg:w-64"
      >
        <Search className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="bg-muted text-muted-foreground pointer-events-none rounded border px-1.5 py-px font-mono text-[10px] font-medium">
          ⌘K
        </kbd>
      </button>
      <button
        type="button"
        disabled
        title="Global search arrives with the command palette (⌘K)"
        aria-label="Search (coming soon)"
        className="text-muted-foreground inline-flex size-8 cursor-not-allowed items-center justify-center rounded-md opacity-70 sm:hidden"
      >
        <Search className="size-4" aria-hidden="true" />
      </button>
    </>
  );
}
