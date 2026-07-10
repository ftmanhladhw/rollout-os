/**
 * Standard placeholder body for shell destinations that have no feature code
 * yet. Follows the empty-state rule (docs/07, Chapter 7): say why it's empty
 * and what comes next — never a bare "no data".
 */
export function PagePlaceholder({
  title,
  question,
  description,
}: {
  title: string;
  /** The one operational question this screen will answer (docs/07, Principle 4). */
  question: string;
  /** Why it's empty and what will fill it. */
  description: string;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground mt-1 text-sm">{question}</p>
      <div className="mt-8 rounded-lg border border-dashed px-6 py-12 text-center">
        <p className="text-sm font-medium">Nothing here yet</p>
        <p className="text-muted-foreground mx-auto mt-1.5 max-w-md text-sm text-balance">
          {description}
        </p>
      </div>
    </div>
  );
}
