import type { Metadata } from 'next';
import { decisions } from './decisions';

export const metadata: Metadata = { title: 'Decisions' };

/**
 * Decision log — the internal ADR record for Rollout OS. Static product
 * content (no rollout scope, no requireCan): prose lives in ./decisions.ts,
 * this file only renders it. Markdown mirror: docs/13_decision_log.md.
 */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</dt>
      <dd className="text-foreground/90 text-sm leading-relaxed">{children}</dd>
    </div>
  );
}

export default function DecisionsPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Decision log</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Why the product is built the way it is.
        </p>
      </header>

      {/* Compact index — anchor jumps, no client JS. */}
      <nav aria-label="Decisions" className="border-b pb-6">
        <ol className="flex flex-col gap-1.5">
          {decisions.map((d) => (
            <li key={d.id} className="flex gap-3 text-sm">
              <span className="text-muted-foreground/70 shrink-0 font-mono text-xs tabular-nums">
                {d.id}
              </span>
              <a
                href={`#${d.id.toLowerCase()}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {d.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex flex-col gap-6">
        {decisions.map((d) => (
          <article
            key={d.id}
            id={d.id.toLowerCase()}
            className="bg-card scroll-mt-6 rounded-lg border p-5 sm:p-6"
          >
            <header className="flex flex-col gap-2 border-b pb-4">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground/70 font-mono text-xs tabular-nums">
                  {d.id}
                </span>
                <span className="text-muted-foreground border-border rounded-full border px-2 py-0.5 text-xs">
                  {d.status}
                </span>
              </div>
              <h2 className="text-base font-semibold tracking-tight">{d.title}</h2>
              <p className="text-muted-foreground/70 text-xs">
                Grounded in {d.sources.join(' · ')}
              </p>
            </header>

            <dl className="mt-4 flex flex-col gap-4">
              <Field label="Problem">{d.problem}</Field>
              <Field label="Alternatives considered">
                <ul className="marker:text-muted-foreground/50 flex list-disc flex-col gap-1 pl-4">
                  {d.alternatives.map((alt) => (
                    <li key={alt}>{alt}</li>
                  ))}
                </ul>
              </Field>
              <Field label="Decision">{d.decision}</Field>
              <Field label="Trade-offs">{d.tradeOffs}</Field>
              <Field label="Why this was chosen">{d.rationale}</Field>
              <Field label="Future implications">{d.implications}</Field>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
