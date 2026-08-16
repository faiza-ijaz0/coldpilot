# ColdPilot — Cold Outreach Sequence Generator

[![CI](https://github.com/faiza-ijaz0/coldpilot/actions/workflows/ci.yml/badge.svg)](https://github.com/faiza-ijaz0/coldpilot/actions/workflows/ci.yml)

ColdPilot is a Next.js application for building, scoring, managing, and
exporting cold email outreach. It generates 3-email sequences from
proven copywriting frameworks, personalizes them to a business's niche and
pain points, scores the result against eight quality dimensions with a
deterministic rules engine, and lets you manage, edit, and export what you've
saved — all client-side, no external AI API involved.

## Core features

### Sequence generation
- 3-email sequences (introduction → follow-up → final follow-up), each with
  its own subject line and a suggested send delay.
- Randomly selects one of four copywriting frameworks per sequence: **AIDA**,
  **PAS** (Problem-Agitate-Solution), **BAB** (Before-After-Bridge), and
  **Problem-Solution**.
- Inputs: business name, sender name, recipient first name (optional),
  industry/niche, target audience, pain point, offer, tone, email length,
  and CTA type.
- Tones: Professional, Casual, Friendly, Bold/Direct, Formal.
- Email lengths: Short, Medium, Long (each with its own target word-count
  band, checked by the quality scorer).
- CTA types: Book a meeting, Quick reply, Phone call, Send a resource,
  Soft ask.
- Niche-specific generation: each niche has its own bank of introductions,
  pain-point framing, and CTA phrasing (see [Generator architecture](#generator-architecture)).
- **Niche isolation / contamination protection** — every generated email is
  scanned for vocabulary that belongs to a *different* niche before it's
  returned; if contamination is detected the generator re-rolls (up to 5
  attempts), then falls back to a minimal niche-agnostic email built only
  from the user's own input.
- **Content/meta-language protection** — generated copy is also checked for
  research-note or listicle phrasing ("the top 5 pain points...", raw
  bulleted/numbered lists) that would read as article notes rather than an
  outreach email, and re-rolled the same way.
- Unresolved merge fields (e.g. a stray `{{first_name}}`) are stripped before
  anything is shown or saved — a template can never leak raw placeholder
  syntax into an email.

### Quality scoring
Every generated sequence is scored 0–100 by a deterministic, rule-based
engine (no external API) across 8 weighted dimensions, with strengths and
recommendations. See [Quality scoring](#quality-scoring) for details.

### Subject line generator
A standalone workspace that generates subject line variations across five
angles — independent of the sequence generator — with per-line copy support
and one-click regeneration.

### Saved sequences
- Save a generated sequence, **regenerate it in place**, or **Save as New**
  to clone the current (possibly regenerated) content into its own record.
- From the saved-sequences library: rename, **duplicate**, edit individual
  email subjects/bodies in a rich-text editor, and delete (with a
  confirmation dialog).
- Sequences persist to the browser's `localStorage` — see
  [Data persistence](#data-persistence).

### Analytics
An analytics dashboard computed entirely from your saved sequences:
total sequences generated, total currently saved, average quality score,
sequences generated in the last 7 and 30 days, and breakdowns by industry
and tone.

### Research library
A bundled, static library of sourced articles on outreach frameworks,
subject lines, personalization, and follow-up strategy, with read-progress
tracking.

### Editing and export
- Email bodies can be edited in a rich-text editor (bold, italic, underline,
  links, lists) with undo/redo history; the editor renders and persists
  sanitized HTML.
- Copy an individual email or the whole sequence as plain text.
- Export a full sequence as **.txt**, **Markdown**, or **PDF**.
- All export/copy paths flow through one centralized transformation
  (`toExportableSequence`) so every format sees the same normalized data —
  see [Export architecture](#export-architecture).

## Quality scoring

`scoreSequence()` runs 8 independent analyzers against a generated sequence
and combines them into a single 0–100 score using fixed weights
(`src/lib/quality-score/weights.ts`):

| Dimension | Weight | What it checks |
|---|---|---|
| Personalization | 0.20 | Whether business name, industry, target audience, and offer are actually reflected in the copy |
| Pain Point Specificity | 0.15 | Whether the stated pain point is concrete/measurable vs. vague, using qualifier and measurement-word heuristics |
| Subject Line | 0.15 | Length, genericness, spam signals, personalization, and excessive punctuation/casing in subject lines |
| CTA | 0.15 | Presence of a clear action verb and time reference, and absence of vague, content-free asks |
| Message Clarity | 0.10 | Generic openers, leftover placeholder artifacts, and sentence-length readability |
| Sequence Progression | 0.10 | Structural distinctiveness across the 3 touches — the intro establishes the problem, later touches don't just repeat it, and the final touch reads as a lower-pressure close |
| Spam & Promotional Language | 0.10 | Known spam phrase bank and excessive punctuation/casing across the sequence |
| Conciseness | 0.05 | Word count against a target band for the selected email length (short/medium/long) |

The weights sum to 1. The overall score is the weighted sum of the 8
dimension scores, rounded and clamped to 0–100. Each dimension also produces
its own strengths and recommendations, which are surfaced in the generator
UI.

This is a **deterministic, heuristic, template-aware scorer** — it applies
the same rules to the same input every time. It is not a semantic or
LLM-based evaluation of persuasiveness; it checks structural and lexical
signals (word overlap, phrase banks, punctuation, sentence length, and
similar) that correlate with outreach quality.

## Generator architecture

```
GeneratorInput
   │
   ▼
frameworks/              four framework definitions (AIDA, PAS, BAB, Problem-Solution)
   │                     each defines the sentence "stages" for all 3 emails
   ▼
personalization/engine   resolves the selected niche's introduction,
   │  + niches/*         pain-point framing, and CTA copy
   ▼
generator/engine.ts      fills templates, assembles each email, retries on
   │                     contamination/meta-content, falls back if needed
   ▼
quality-score/engine     scores the finished sequence (8 analyzers, see above)
   │
   ▼
storage / export         saved to localStorage; exportable via the
                          centralized export transformation
```

- **Frameworks** (`src/lib/generator/frameworks/`) define the sentence-stage
  structure for each of the 3 emails; the generator randomly selects one
  framework per sequence.
- **Niche registry** (`src/lib/personalization/niches/`) is modular and
  registry-driven — each niche is a self-contained config file (label,
  introduction bank, pain-point bank, CTA bank, relevance vocabulary), and
  `niches/index.ts` is the single place a niche gets registered. The
  currently implemented niches are: **SaaS**, **Agencies**, **Car
  Dealerships**, **Real Estate**, **Healthcare**, **Ecommerce**,
  **Education**, and **Barbershop & Beauty**.
- **Content guards** (`src/lib/generator/content-guard.ts`,
  `src/lib/personalization/niche-relevance.ts`) reject cross-niche
  vocabulary leakage and research/meta-commentary phrasing before an email
  is returned.
- **Quality scoring** (`src/lib/quality-score/`) is a separate stage that
  runs after generation and never influences the generated text itself.
- **Storage** (`src/lib/storage/`) and **export** (`src/lib/export/`) are
  independent layers that consume the finished `GeneratorResult` /
  `SavedSequence`.

## Data persistence

Saved sequences currently persist to the browser's `localStorage` only —
there is no server-side database, backend API, or user authentication.

- `coldpilot:sequences` stores the array of saved sequence records (name,
  business/sender/recipient info, industry, target audience, pain point,
  offer, tone, email length, CTA type, framework, the 3 emails, quality
  score, status, and timestamps).
- `coldpilot:sequences:generated-count` tracks a running total of sequences
  generated (used by the Analytics "total generated" stat, which is not
  reduced by deleting saved sequences).
- On read, every saved record is passed through `normalizeSavedSequence()`,
  which backfills fields added after older records may have been persisted
  (e.g. `senderName` defaulting to the business name), strips any leftover
  unresolved merge-field placeholders, and re-sanitizes HTML-format email
  bodies — so records saved by an earlier version of the app, or edited
  outside the app, still render safely.

Because persistence is local to the browser, sequences are per-device and
per-browser-profile; clearing site data removes them.

## Security

HTML in this app (email bodies edited in the rich-text editor) goes through
defense-in-depth sanitization rather than a single check:

- **DOMPurify-based sanitization** (`src/lib/security/sanitize-html.ts`) is
  the single sanitizer used everywhere HTML is involved. It allow-lists a
  small set of formatting tags (`p`, `br`, `strong`/`b`, `em`/`i`, `u`, `a`,
  `ul`/`ol`/`li`) and only the `href` attribute — everything else (scripts,
  iframes, event handlers, styles, forms, SVG, etc.) is stripped.
- **Safe URL scheme validation** (`src/lib/security/safe-url.ts`) restricts
  any link href to `http:`, `https:`, or `mailto:`; `javascript:`, `data:`,
  and other schemes are rejected.
- **Paste sanitization** — HTML pasted into the email editor is run through
  the sanitizer before insertion.
- **Persistence sanitization** — HTML-format email bodies are sanitized
  before being written to `localStorage`.
- **Legacy-record sanitization** — HTML-format bodies are re-sanitized on
  every read, so records saved before sanitization existed (or edited
  outside the app) can't reintroduce unsafe markup.
- **Render-time sanitization** — anywhere email HTML is rendered with
  `dangerouslySetInnerHTML`, it is sanitized immediately beforehand.

## Export architecture

All export and copy actions go through one centralized transformation,
`toExportableSequence()` (`src/lib/export/to-exportable-sequence.ts`), which
normalizes a `GeneratorResult` or `SavedSequence` into a single
`ExportableSequence` shape. Every format then renders from that same
normalized data:

- **Copy** — an individual email or the full sequence to the clipboard as
  plain text.
- **.txt** — full sequence as plain text.
- **Markdown** — full sequence as Markdown.
- **PDF** — full sequence via `jsPDF`.

## Routes / pages

| Route | Page |
|---|---|
| `/` | Landing page |
| `/generator` | Generate, score, and save a new sequence |
| `/sequences` | Saved Sequences — manage, edit, duplicate, delete |
| `/subject-lines` | Subject Lines — generate and copy subject line variants |
| `/analytics` | Analytics dashboard over saved sequences |
| `/research` | Research Library — static outreach articles |

Each route uses the Next.js App Router's `error.tsx`/`loading.tsx`
conventions for error and loading states.

## Tech stack

- **Next.js 15** (App Router, TypeScript) — `next@^15.1.6`
- **React 19**
- **Tailwind CSS 3** + shadcn/ui-style primitives on **Radix UI**, **Lucide**
  icons, **class-variance-authority**, **tailwind-merge**
- **next-themes** (dark/light/system), **sonner** (toasts), **framer-motion**
  (animation)
- **DOMPurify** — HTML sanitization
- **jsPDF** — PDF export
- **Vitest 4** + **@testing-library/react** + **jsdom** — testing
- **ESLint 9** (`eslint-config-next`), **TypeScript 5**

## Development setup

```bash
git clone <repository-url>
cd "OutreachForge AI"
npm install
npm run dev
```

Open http://localhost:3000.

No runtime environment variables are required — the app makes no external
API calls and has no server-side configuration.

Available scripts (`package.json`):

```bash
npm run dev      # start the dev server
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint .
npm test         # vitest run
npx tsc --noEmit # type-check without emitting
```

## Deployment

The app is a standard Next.js App Router project with no custom server code,
so it deploys to [Vercel](https://vercel.com) directly — connect the
repository and deploy with default settings. No environment variables need
to be configured.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every push and pull
request targeting `main`: `npm ci`, then type-checking (`tsc --noEmit`),
linting, the full test suite, and a production build, in that order. Any
failing step fails the workflow — there are no soft-fail or skipped checks.
The workflow requires no secrets or environment variables.

## Testing

115 tests across 16 test files, run with Vitest (`npm test`). Coverage
includes:

- **Generator behavior** — sequence structure, framework selection, merge
  field resolution, retry/fallback behavior.
- **Content guards & niche contamination** — cross-niche vocabulary
  detection and meta-content detection.
- **Personalization** — niche-relevance vocabulary matching.
- **Quality scoring** — the score engine and each of the 8 individual
  analyzers (personalization, pain point, subject line, CTA, sequence
  progression, spam language, and their fixtures).
- **Storage** — saved-sequence normalization and sanitization of legacy
  records.
- **Export** — the centralized `toExportableSequence` transformation and its
  call sites.
- **Editor security** — the email body editor's sanitization behavior.

## Project structure

```
src/
  app/                    Next.js App Router routes (generator, sequences,
                           subject-lines, analytics, research, landing)
  components/
    generator/             Generator form, output panel, quality score panel
    sequences/              Saved sequence cards, detail dialog, delete dialog
    subject-lines/          Subject line form and results
    analytics/              Analytics dashboard and charts
    research/                Research library components
    email-editor/            Rich-text email body editor
    layout/, landing/, shared/, motion/, ui/
  hooks/                   useSavedSequences, useLocalStorage, useResearchProgress, ...
  lib/
    generator/              Engine, frameworks, content guard, template banks
    personalization/        Niche registry, niche configs, relevance matching
    quality-score/          Score engine, 8 analyzers, weights
    storage/                localStorage primitives, sequence CRUD/normalization
    export/                 Centralized export transformation and format writers
    security/                HTML sanitization and safe-URL validation
    subject-lines/           Subject line engine, categories, templates
  types/                   Shared TypeScript types
  config/                  Site metadata and navigation config
```

## Engineering notes

- **Centralized export transformation** — every export/copy format consumes
  the same `toExportableSequence()` output, so format writers can't drift
  from each other on how a sequence is represented.
- **Modular niche registry** — adding a niche is adding one config file and
  one line in `niches/index.ts`; nothing else in the generator, scorer, or
  UI needs to change.
- **Defense-in-depth HTML sanitization** — sanitization happens at paste
  time, persistence time, legacy-record read time, and render time, rather
  than relying on a single checkpoint.
- **Deterministic quality scoring** — the scorer is rule-based rather than
  model-based, so a given sequence always produces the same score and the
  same recommendations, which keeps it fast, free, and testable.
- **localStorage persistence** — chosen for simplicity given no backend;
  `normalizeSavedSequence()` exists specifically to keep older records
  compatible as the saved-sequence schema evolves.

## Limitations

- Persistence is client-side `localStorage` only — no server-side database,
  no user accounts, no cross-device sync, and no multi-user support.
- Quality scoring is rule-based, not a semantic/LLM evaluation — it measures
  structural and lexical signals, not actual reply-rate performance.
- Sequence generation draws from a fixed set of frameworks and niche banks;
  niches outside the current registry aren't supported without adding a new
  niche config.
