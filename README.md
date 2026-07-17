# ColdPilot — AI-Powered Cold Outreach Machine

Production-grade architecture for a Next.js 15 SaaS app that generates cold email
sequences from researched outreach frameworks (no AI API). This pass ships the
**project architecture and UI foundation only** — no generation logic yet.

## Stack

- Next.js 15 (App Router, TypeScript)
- Tailwind CSS 3 + shadcn/ui (New York style, CSS variables, dark mode default)
- Radix UI primitives, Lucide icons
- next-themes for theme switching, sonner for toasts

## Getting started

```bash
npm install
npm run dev
```

> This repo was scaffolded by hand in an environment without network access, so
> `node_modules` has not been installed yet. Run `npm install` once you have
> connectivity, then `npm run dev` and open http://localhost:3000.

## Folder structure

```
src/
  app/                    Route segments (App Router)
    page.tsx              Landing page
    generator/             Generator page (+ loading/error boundaries)
    research/               Research Library page (+ loading/error boundaries)
    sequences/              Saved Sequences page (+ loading/error boundaries)
    layout.tsx              Root layout, fonts, ThemeProvider, metadata
    global-error.tsx        Root-level error boundary
    not-found.tsx           404 page
  components/
    ui/                     shadcn/ui primitives (button, card, dialog, ...)
    layout/                 Navbar, footer, theme toggle/provider, site shell
    shared/                 Reusable cross-page pieces (page header, empty state, ...)
    landing/                Landing page sections
    generator/              Generator page components
    research/               Research Library page components
    sequences/              Saved Sequences page components
  config/                   Site metadata, nav config
  types/                    Shared TypeScript types
  lib/                      Utilities (`cn`) and placeholder/sample data
  hooks/                    Shared hooks (e.g. `useIsMobile`)
```

## Notes

- Dark mode is the default theme; toggle via the navbar (light/dark/system).
- Research Library and Saved Sequences currently render from
  `src/lib/placeholder-data.ts` — swap for real data once persistence exists.
- The Generator form is a static UI shell; wiring it to real sequence
  generation is the next milestone.
- `public/og.png` is referenced in metadata but not yet added — drop in a real
  Open Graph image before shipping.
