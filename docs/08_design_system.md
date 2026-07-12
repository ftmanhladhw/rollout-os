# Design System

The visual and interaction conventions Rollout OS is built on. This documents what the code already does — the source of truth is [`src/app/globals.css`](../src/app/globals.css) (tokens) and the shadcn/ui primitives in [`src/components/ui`](../src/components/ui). When this doc and the code disagree, the code wins.

> Design principles (empty states, status semantics, information density) come from the [UX specification](./07_product_experience_specification.md); this doc is the concrete token/component layer under them.

## Foundations

| Aspect         | Choice                                                                                              |
| -------------- | --------------------------------------------------------------------------------------------------- |
| Component base | [shadcn/ui](https://ui.shadcn.com) — `new-york` style, `neutral` base color (see `components.json`) |
| CSS            | Tailwind CSS v4, CSS-first config in `globals.css` (no `tailwind.config`)                           |
| Typography     | **Inter** via `next/font` (`--font-sans`); `font-sans antialiased` on `<body>`                      |
| Icons          | `lucide-react`, sized to the text they sit beside                                                   |
| Radius         | `--radius: 0.625rem`; components derive `sm`/`md`/`lg`/`xl` from it                                 |
| Theming        | Light + dark via a `.dark` class, toggled by `next-themes` (light/dark/system)                      |

## Color

Colors are CSS variables in `oklch`, defined once for light and once for dark. **Never hardcode a hex/oklch value in a component** — reference the token (`bg-card`, `text-muted-foreground`, `border`, …) so both themes stay correct.

Core roles: `background` / `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, and a `sidebar-*` set for the shell.

### Semantic status trio

Health, readiness, and risk use three dedicated tokens — and only these — for status meaning:

| Token               | Value     | Meaning                  |
| ------------------- | --------- | ------------------------ |
| `--status-good`     | `#0ca30c` | Green / on track / ready |
| `--status-warning`  | `#fab219` | Amber / at risk          |
| `--status-critical` | `#d03b3b` | Red / blocked / critical |

**Color never carries meaning alone.** Amber is deliberately sub-3:1 on light surfaces; a status color must always be paired with a text label (UX spec, ch. 6). This is an accessibility guarantee, not a preference — it holds for color-vision-deficient and monochrome contexts.

## Spacing & layout

- Tailwind's default 4px spacing scale; page bodies pad `px-4 py-6` (mobile) → `md:px-8 md:py-8`.
- Page content is width-capped for readability: `max-w-3xl` for simple/placeholder pages, `max-w-5xl` for data-dense modules (Reports, Command Center).
- A module page is a `flex flex-col gap-5` stack: a `header` (h1 + muted question subtitle), then content.

## Component conventions

- **Page header.** Every destination opens with an `<h1 class="text-xl font-semibold tracking-tight">` and a one-line muted subtitle stating the _operational question_ the screen answers (e.g. Reports → "What should we communicate?"). The question strings live in [`src/config/nav.ts`](../src/config/nav.ts).
- **Tabbed modules** (Operations, Knowledge, Reports) use an underline tab-nav driven by a URL search param — server-rendered, shareable, no client tab state.
- **Create/edit** goes through the shared [`EntityDrawer`](../src/components/entity-drawer.tsx) with per-entity field specs, so every module's forms look and behave the same.
- **Labels, never raw enums.** Stored enum values are rendered through the terminology layer in [`src/config/terminology.ts`](../src/config/terminology.ts). Never print a raw `in_progress`.

## States

Every screen must handle four states deliberately — this is the biggest quality tell:

- **Empty** — say _why_ it's empty and _what comes next_, never a bare "no data" (see [`PagePlaceholder`](../src/components/shell/page-placeholder.tsx)).
- **Loading** — skeletons that match the shape of the content, not spinners.
- **Error** — the `(app)/error.tsx` boundary; denied _mutations_ surface a friendly message, denied _views_ redirect to `/unauthorized`.
- **Populated** — the default; density tuned per the UX spec.

## Open follow-ups

- The shell still leans on some shadcn defaults; the "design-system pass" in the [roadmap](./12_product_roadmap.md) commits the remaining spacing/type decisions here.
- No committed component gallery yet (e.g. Storybook) — primitives are documented by usage in `src/components/ui`.
