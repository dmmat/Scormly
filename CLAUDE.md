# Scormly

A local-first, block-based course builder (an Articulate Rise alternative) that
exports to **SCORM 1.2 / 2004**. It runs entirely client-side, with no backend.
Projects, media, and exports are stored in the user's file system via the **File
System Access API**, and SCORM packages are generated in the browser (JSZip).

See the technical spec (Version 2) `.txt` in the repo root for the original
requirements, and [PROGRESS.md](./PROGRESS.md) for the living status and the
extra requirements agreed during development.

## Stack

- **React 18 + TypeScript** — component-based block structure.
- **Vite** — build and dev server (HMR).
- **Tailwind CSS v4** — styling (CSS-first config via `@tailwindcss/vite`, no
  `tailwind.config.js`; theme tokens live in `src/index.css` via `@theme`).
- **Zustand** — global course state (structure, active lesson, selection, and a
  custom undo/redo history).
- Planned: **JSZip** (SCORM export), **dnd-kit / @hello-pangea/dnd**
  (drag-and-drop), deeper **File System Access API** integration (disk I/O).

## Commands

```bash
npm install      # install dependencies
npm run dev      # dev server (http://localhost:5173)
npm run build    # type check (tsc --noEmit) + production build
npm run preview  # local preview of the production build
```

## Structure

```
src/
├── main.tsx                  # React entry point (wraps App in I18nProvider)
├── App.tsx                   # hash router: landing vs. builder
├── index.css                 # Tailwind + theme tokens + landing animations
├── types/course.ts           # data model (discriminated union of blocks)
├── store/courseStore.ts      # Zustand store: CRUD + undo/redo
├── lib/id.ts                 # ID generation
├── i18n/                     # internationalization (EN/UK)
│   ├── I18nProvider.tsx      # provider + useT / useLang hooks
│   ├── dictionary.ts         # combines all namespaces
│   └── locales/              # one file per namespace (en + uk)
├── theme/                    # global project themes
├── blocks/
│   ├── registry.ts           # block metadata + default block factory
│   ├── types.ts              # block component contract
│   ├── BlockRenderer.tsx     # type → component dispatcher
│   └── components/           # one editor component per block type
├── hooks/                    # useUndoRedoShortcuts, useRoute, useReveal
└── components/
    ├── Builder.tsx           # the editor shell (route #/app)
    ├── landing/Landing.tsx   # SEO marketing landing (default route)
    ├── layout/               # Header, Sidebar, Workspace, Logo
    └── editor/               # BlockShell, AddBlockMenu, ThemePicker, LanguagePicker
```

## Brand

The name is **Scormly**. The default accent is pink `#EC4899` (Tailwind
utilities `text-brand` / `bg-brand`, shades `brand-light`, `brand-dark`). The UI
is light, in the spirit of Articulate Rise (lots of white space, accent color on
active elements). The accent is driven by a CSS variable and overridden per
theme — never hardcode the pink hex in components; use the `*-brand` utilities or
the global button/interactive classes.

## Data model

A course is hierarchical JSON: `Course → Lesson[] → Block[]`. Each block has an
`id`, a `type` (the `BlockType` union), `settings`, and a typed `data`. `Block`
is a discriminated union on `type`, so narrowing gives full type safety. Adding a
new block type = extend the union + add a registry entry + add a renderer
component (see [docs/adding-blocks.md](./docs/adding-blocks.md)). Keep the model
declarative and JSON-serializable — it is the basis for `project.json` and export.

`Course.theme` (a `ThemeId`) stores the global project theme.

## State management

`src/store/courseStore.ts` (Zustand) holds the course, the active lesson, the
selected block, and `past`/`future` history stacks. All mutations go through an
internal `mutate(fn, coalesceKey?)` helper that snapshots the course
(`structuredClone`) for undo/redo. A matching `coalesceKey` merges consecutive
edits into a single undo step (used for text typing); discrete actions omit it.
Keyboard shortcuts (Ctrl/Cmd+Z / Y) are wired by `useUndoRedoShortcuts`. See
[docs/architecture.md](./docs/architecture.md) for details.

## Themes

There is one global theme per course (Rise / Ocean / Forest / Sunset). The theme
is applied via a `data-theme` attribute on the builder root (`ThemeProvider`),
which overrides CSS variables in `index.css`: the accent color (`--color-brand`,
which all `*-brand` utilities read) and the button/interactive radius. Components
must use the `.btn-primary` / `.btn-secondary` / `.interactive-surface` classes
and the `*-brand` utilities so themes apply automatically.

## Internationalization (i18n)

The app UI is bilingual **English / Ukrainian** (default English; auto-selects
Ukrainian for `uk` browsers; the manual switch persists to localStorage). Strings
live in `src/i18n/locales/<namespace>.ts` (each exports `{ en, uk }`). Read them
with `const { t } = useT('<namespace>')`. Do **not** hardcode user-facing text —
add keys to the appropriate namespace in both languages. Author-edited course
content (block data) is not localized.

## Landing page and routing

`App.tsx` does simple hash-based routing (`useRoute`): the default route renders
the SEO landing page (`components/landing/Landing.tsx`); `#/app` renders the
builder (`components/Builder.tsx`). The landing is bilingual, animated
(`useReveal` + CSS keyframes), and emphasizes that Scormly is open source, free,
and fully local (no data stored or transmitted). SEO meta tags are in
`index.html`.

## Conventions

- Strict TypeScript (`strict`, `noUnusedLocals`, `noUnusedParameters`).
- Make sure `npm run build` passes before committing.
- **All code comments and documentation are in English.** UI strings go through
  i18n (EN + UK). Comment only where the "why" is non-obvious.
- Don't add dependencies or abstractions beyond what the task needs.

## Deployment

The production build deploys to **GitHub Pages** via the
`.github/workflows/deploy.yml` workflow (on push to the main branch). The Pages
base path is enabled with the `GITHUB_PAGES=true` env var (see `vite.config.ts`).

## Roadmap (high level)

Done: editor foundation, all block types, global themes, i18n, SEO landing.
Planned: File System Access persistence (`project.json` + `assets/`, autosave,
undo/redo history persisted to disk), SCORM 1.2 then 2004 export, full keyboard
shortcuts, right-click context menu, a welcome screen (open/create project by
folder), and drag-and-drop reordering. See [PROGRESS.md](./PROGRESS.md).
