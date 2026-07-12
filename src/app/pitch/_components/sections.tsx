import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BrowserFrame, CommandCenterPreview } from './app-preview';
import { links } from './links';

/* --- Shared primitives ---------------------------------------------------- */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
      {children}
    </p>
  );
}

/* --- Top navigation ------------------------------------------------------- */

const NAV_LINKS = [
  { href: '#why-now', label: 'Why now' },
  { href: '#product', label: 'Product' },
  { href: '#decisions', label: 'Decisions' },
  { href: '#roadmap', label: 'Roadmap' },
];

export function PitchNav() {
  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
        <a href="#top" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span
            aria-hidden
            className="bg-primary text-primary-foreground grid size-5 place-items-center rounded text-[11px] font-bold"
          >
            R
          </span>
          Rollout OS
        </a>
        <div className="text-muted-foreground ml-auto hidden items-center gap-6 text-sm md:flex">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
        </div>
        <Button asChild size="sm" className="ml-auto md:ml-0">
          <a href={links.app}>Launch demo</a>
        </Button>
      </nav>
    </header>
  );
}

/* --- Hero ----------------------------------------------------------------- */

export function Hero() {
  return (
    <section id="top" className="border-b px-6">
      <div className="mx-auto grid min-h-[calc(100svh-3.5rem)] max-w-6xl items-center gap-12 py-16 lg:grid-cols-2 lg:gap-16 lg:py-0">
        <div className="max-w-xl">
          <Eyebrow>Rollout OS</Eyebrow>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
            The operating system for enterprise rollouts.
          </h1>
          <div className="text-muted-foreground mt-6 space-y-4 text-lg leading-relaxed">
            <p>
              Organizations have systems for managing work, documents, and communication. They don’t
              have one for managing transformation.
            </p>
            <p>
              Rollout OS is a single operational workspace for enterprise rollouts — from kickoff,
              through go-live, and into business as usual.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <a href={links.app}>Launch demo</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={links.github} target="_blank" rel="noreferrer">
                View GitHub
              </a>
            </Button>
          </div>
        </div>

        <div className="lg:pl-4" aria-hidden>
          <BrowserFrame url="rollout-os.app" className="lg:rotate-[0.5deg]">
            <CommandCenterPreview />
          </BrowserFrame>
        </div>
      </div>
    </section>
  );
}

/* --- Why now -------------------------------------------------------------- */

const DRIVERS = [
  'Adopting AI',
  'Replacing legacy systems',
  'Modernizing platforms',
  'Implementing ERP',
  'Onboarding new partners',
  'Responding to regulation',
  'Digitizing operations',
];

function FlowNode({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'muted' | 'primary' | 'good';
}) {
  return (
    <div
      className={cn(
        'rounded-lg border px-5 py-3 text-center text-sm font-medium',
        variant === 'muted' && 'text-muted-foreground border-dashed',
        variant === 'primary' && 'bg-primary text-primary-foreground border-primary',
        variant === 'good' && 'border-status-good/40 bg-status-good/5',
        variant === 'default' && 'bg-card',
      )}
    >
      {children}
    </div>
  );
}

function FlowArrow() {
  return <ChevronDown className="text-muted-foreground/50 size-5" aria-hidden />;
}

export function WhyNow() {
  return (
    <section id="why-now" className="scroll-mt-14 border-b px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Eyebrow>Why now</Eyebrow>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          Enterprise transformation has become continuous.
        </h2>

        <div className="mt-14 grid gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Organizations are always mid-transformation now — several at once:
            </p>
            <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {DRIVERS.map((d) => (
                <li key={d} className="flex items-center gap-3 text-base">
                  <span aria-hidden className="bg-foreground/30 h-px w-4 shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-8 text-lg leading-relaxed">
              Transformation stopped being a one-time initiative. It became business as usual — yet
              rollouts are still coordinated across tools that were never meant to connect.
            </p>
          </div>

          {/* The fragmentation, drawn plainly. */}
          <div className="flex flex-col items-center gap-3">
            <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
              {['Jira', 'SharePoint', 'Teams', 'PowerPoint'].map((t) => (
                <FlowNode key={t} variant="default">
                  {t}
                </FlowNode>
              ))}
            </div>
            <FlowArrow />
            <FlowNode variant="muted">Fragmented rollout</FlowNode>
            <FlowArrow />
            <FlowNode variant="primary">Rollout OS</FlowNode>
            <FlowArrow />
            <FlowNode variant="good">Shared operational workspace</FlowNode>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- The insight (emotional center) --------------------------------------- */

export function Insight() {
  return (
    <section className="border-b px-6 py-28 md:py-40">
      <div className="mx-auto max-w-4xl text-center">
        <div className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
          <p className="text-muted-foreground">CRM organizes customers.</p>
          <p className="text-muted-foreground">ERP organizes operations.</p>
          <p className="text-foreground mt-1">Rollout OS organizes transformation.</p>
        </div>
        <p className="text-muted-foreground mx-auto mt-12 max-w-2xl text-lg leading-relaxed text-balance">
          It doesn’t replace Jira, SharePoint, or Teams. It sits above them — the operational layer
          that connects execution, knowledge, communication, and leadership visibility into one
          picture everyone trusts.
        </p>
      </div>
    </section>
  );
}

/* --- Product decisions ---------------------------------------------------- */

const DECISIONS = [
  {
    n: '01',
    title: 'Context before tasks',
    body: 'Every workstream opens on its brief — objective, owners, current state — before a single task list.',
    tradeoff:
      'Task tools assume shared context; on a rollout, half the team is new to the tenant. We trade a slower first click for a correct tenth.',
  },
  {
    n: '02',
    title: 'Manual before automation',
    body: 'Status is entered by the people accountable for it. Automation arrives only where the manual signal has proven reliable.',
    tradeoff:
      'Automated status that’s subtly wrong is worse than an honest blank. Trust in a source of truth is earned once and lost permanently.',
  },
  {
    n: '03',
    title: 'One Command Center',
    body: 'A single surface answers “where does my attention matter today.” Every other view is a projection of the same data, never a second source.',
    tradeoff:
      'The moment two dashboards can disagree, people trust neither and return to email. One source, many projections, is a constraint we won’t relax.',
  },
  {
    n: '04',
    title: 'Reports are generated, not maintained',
    body: 'Status reports render from live operational data on demand. Nobody rebuilds a deck the night before a steering committee.',
    tradeoff:
      'A maintained report is stale the moment it’s saved. Generating from the source keeps the report and the work identical — and returns the day spent formatting.',
  },
  {
    n: '05',
    title: 'AI after workflow validation',
    body: 'Intelligence is layered on only once the underlying model and data have been proven in real rollouts.',
    tradeoff:
      'AI on an unvalidated workflow automates the wrong thing faster. The model has to be right before the assistant on top of it can be. Sequence is the strategy.',
  },
];

export function ProductDecisions() {
  return (
    <section id="decisions" className="scroll-mt-14 border-b px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Eyebrow>Product decisions</Eyebrow>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          Judgment shows in what you refuse to build.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-2xl text-lg leading-relaxed">
          Not a feature list — the decisions that shaped the product, and the tradeoffs each one
          accepts.
        </p>

        <div className="mt-14 border-t">
          {DECISIONS.map((d) => (
            <article key={d.n} className="grid gap-x-12 gap-y-4 border-b py-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-muted-foreground/50 text-sm font-medium tabular-nums">
                    {d.n}
                  </span>
                  <h3 className="text-xl font-semibold tracking-tight">{d.title}</h3>
                </div>
              </div>
              <div className="space-y-4 lg:col-span-8">
                <p className="text-base leading-relaxed">{d.body}</p>
                <p className="text-muted-foreground border-foreground/15 border-l-2 pl-4 text-base leading-relaxed">
                  <span className="text-foreground/70 font-medium">The tradeoff.</span> {d.tradeoff}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- Why me --------------------------------------------------------------- */

export function WhyMe() {
  return (
    <section className="border-b px-6 py-24 md:py-32">
      <div className="mx-auto max-w-2xl">
        <Eyebrow>Why I built this</Eyebrow>
        <div className="text-foreground mt-8 space-y-6 text-lg leading-relaxed">
          <p>
            I built Rollout OS after leading enterprise implementations where the same pattern kept
            repeating: the software was live, the plan existed, and coordination still fell through
            the gaps between tools.
          </p>
          <p>
            The execution tools were never the problem. Jira tracked the work. SharePoint held the
            documents. Teams carried the conversation. What no tool owned was the rollout itself —
            the state of each tenant, the decisions that moved it, the single answer to “are we
            ready.”
          </p>
          <p>
            That answer lived in someone’s spreadsheet and someone’s memory. Every status meeting
            rebuilt it by hand. I watched the same gap across different organizations, industries,
            and programmes — which is what told me it was structural, not situational.
          </p>
          <p className="text-muted-foreground">
            Rollout OS is the system I kept wishing existed while I was in the room.
          </p>
        </div>
      </div>
    </section>
  );
}

/* --- Roadmap -------------------------------------------------------------- */

const PHASES = [
  {
    n: 'Phase 1',
    title: 'Operational Workspace',
    line: 'One source of truth for running rollouts — lifecycle, units, actions, and reporting in one place.',
  },
  {
    n: 'Phase 2',
    title: 'Automation',
    line: 'Recurring coordination — reminders, escalations, report generation — runs itself once the workflow is trusted.',
  },
  {
    n: 'Phase 3',
    title: 'Operational Intelligence',
    line: 'The system surfaces what needs attention before someone has to ask.',
  },
  {
    n: 'Phase 4',
    title: 'Portfolio Intelligence',
    line: 'Leadership reads risk and patterns across every rollout at once.',
  },
];

export function Roadmap() {
  return (
    <section id="roadmap" className="scroll-mt-14 border-b px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Eyebrow>Where this goes</Eyebrow>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          A workspace that grows into a system of intelligence.
        </h2>

        <ol className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
          {/* Continuous rail behind the nodes (desktop); each dot's ring punches
              a gap in it. Hidden on mobile, where the timeline reads vertically. */}
          <div
            aria-hidden
            className="bg-border absolute top-1.5 right-1/4 left-0 hidden h-px md:block"
          />
          {PHASES.map((p) => (
            <li key={p.n} className="relative">
              <div className="flex items-center gap-3 md:block">
                <span
                  aria-hidden
                  className="bg-primary ring-background relative z-10 block size-3 shrink-0 rounded-full ring-4"
                />
              </div>
              <div className="mt-0 pl-6 md:mt-5 md:pl-0">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {p.n}
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-tight">{p.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{p.line}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* --- Closing -------------------------------------------------------------- */

export function Closing() {
  return (
    <section className="px-6 py-32 md:py-44">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
          Enterprise transformation deserves better operating software.
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <a href={links.app}>Launch product</a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={links.github} target="_blank" rel="noreferrer">
              View GitHub
            </a>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <a href={links.thesis} target="_blank" rel="noreferrer">
              Product thesis
              <ArrowRight className="size-4" aria-hidden />
            </a>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <a href={links.architecture} target="_blank" rel="noreferrer">
              Architecture spec
              <ArrowRight className="size-4" aria-hidden />
            </a>
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground/70 mt-24 text-center text-xs">
        Rollout OS — Enterprise Rollout Operations.
      </p>
    </section>
  );
}
