# AGENTS.md

Instructions for AI agents working in this repository. For the full project
overview, stack, structure, and conventions, see [CLAUDE.md](./CLAUDE.md).

## In short

**Scormly** is a local-first SCORM course builder (React + TypeScript + Vite +
Tailwind v4 + Zustand). No backend; disk I/O goes through the File System Access
API, and SCORM export happens in the browser via JSZip. The app UI is bilingual
(English / Ukrainian) via i18n, and a marketing landing page is the default route
(the builder lives at `#/app`).

## Before you start

- Install dependencies: `npm install`.

## Check before committing

- `npm run build` must pass without errors (it includes `tsc --noEmit`).
- When possible, verify the UI in a browser: `npm run dev`.

## Principles

- Keep the data model (`src/types/course.ts`) declarative and JSON-serializable —
  it is the basis for `project.json` and SCORM export.
- Don't add dependencies or abstractions beyond what the current task needs.
- Follow strict TypeScript and the existing component style.
- **All code comments and documentation are in English.** User-facing UI strings
  go through i18n (`src/i18n/locales/`, English + Ukrainian) — don't hardcode them.
- Brand: the name is **Scormly**, the default accent is pink `#EC4899`
  (`text-brand` / `bg-brand`). Use the `*-brand` utilities and the global
  `.btn-primary` / `.btn-secondary` / `.interactive-surface` classes so themes
  apply — never hardcode the accent hex.
