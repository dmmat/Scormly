# Scormly

A local-first, block-based course builder that
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
├── styles/blocks.css         # learner block design shared with the SCORM player
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

The name is **Scormly**. The logo/brand mark is pink `#EC4899`; the default UI
accent (Rose theme) is the darker pink `#DB2777` so white text on it and
`brand-dark` (`#BE185D`) text on white meet WCAG AA 4.5:1 (Tailwind utilities
`text-brand` / `bg-brand`, shades `brand-light`, `brand-dark`). Every theme must
keep that contrast. The accent is driven by a CSS variable and overridden per
theme — never hardcode the pink hex in components; use the `*-brand` utilities or
the global button/interactive classes.

## Data model

A course is hierarchical JSON: `Course → Lesson[] → Block[]`. Each block has an
`id`, a `type` (the `BlockType` union), `settings`, and a typed `data`. `Block`
is a discriminated union on `type`, so narrowing gives full type safety. Adding a
new block type = extend the union + add a registry entry + add a renderer
component (see [docs/adding-blocks.md](./docs/adding-blocks.md)). Keep the model
declarative and JSON-serializable — it is the basis for `project.json` and export.

`Course.theme` (a `ThemeId`) stores the global project theme. `Course.intro` is
the optional cover page shown before the first lesson (it is not a lesson; the
editor selects it with `activeLessonId === INTRO_ID`). Its `blocks` (content
types only, `INTRO_BLOCK_TYPES`) render under the title; block actions reach
them with `lessonId === INTRO_ID` (`blocksOf()` in the store). `Block.settings` carries
the block format: `background` (theme-derived panel colors), `spacing` and
`width` (`'full'` = edge-to-edge band).

## Learner rendering in three places

Blocks render in the editor (`src/blocks/components/*`, WYSIWYG), the in-app
preview (`src/preview/*`) and the exported **vanilla-JS SCORM player**
(`public/scorm-player/player.js` + `player.css`). A visual change to learner
content must be made in all three. Shared look lives in `src/styles/blocks.css`
(`sc-*`, `blk*` classes); `scripts/syncPlayerCss.mjs` copies it into
`player.css` automatically before `npm run dev` / `npm run build` (so CI and
deploy always ship it in sync); `tests/playerCss.test.ts` guards the committed copy.

## State management

`src/store/courseStore.ts` (Zustand) holds the course, the active lesson, the
selected block, and `past`/`future` history stacks. All mutations go through an
internal `mutate(fn, coalesceKey?)` helper that snapshots the course
(`structuredClone`) for undo/redo. A matching `coalesceKey` merges consecutive
edits into a single undo step (used for text typing); discrete actions omit it.
Keyboard shortcuts (Ctrl/Cmd+Z / Y) are wired by `useUndoRedoShortcuts`. See
[docs/architecture.md](./docs/architecture.md) for details.

## Themes

There is one global theme per course (Rose / Ocean / Forest / Sunset / Mono /
Indigo / Crimson / Mint / Grape / Terminal). The theme is applied via a `data-theme`
attribute on the builder root (`ThemeProvider`), which overrides CSS variables in `index.css`: the accent color (`--color-brand`,
which all `*-brand` utilities read) and the button/interactive radius. Components
must use the `.btn-primary` / `.btn-secondary` / `.interactive-surface` classes
and the `*-brand` utilities so themes apply automatically.

`theme: 'custom'` uses `Course.customTheme` (accent color + corner shape).
`src/theme/customTheme.ts` derives the shades, darkening the accent when
needed to keep the AA contrast rule above; the editor applies them as inline
CSS variables (`themeStyle`), and exports embed the resolved palette as
`themeTokens` in `course-data.js` for the player.

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
