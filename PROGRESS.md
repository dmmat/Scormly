# Scormly — development progress

Tracks the state of work against the technical spec (Version 2), plus the extra
requirements added during development. Updated after each phase.

Legend: `[ ]` planned · `[~]` in progress · `[x]` done

---

## Phase 0 — Scaffold (done)

- [x] Vite + React 18 + TS, Tailwind v4, Zustand
- [x] Layout: Header / Sidebar / Workspace / Logo
- [x] Data model `Course → Lesson → Block` (`src/types/course.ts`)
- [x] Basic store (active lesson)
- [x] CI + deploy to GitHub Pages

## Phase 1 — Editor foundation (done, except DnD)

- [x] Typed `data` interfaces for each `BlockType` (discriminated union)
- [x] Store CRUD: blocks (add/update/delete/duplicate/move), lessons (add/rename/delete/move/status)
- [x] Undo/redo with `Course` snapshots + typing coalescing; Ctrl+Z/Y shortcuts
- [x] Block render dispatcher (`BlockRenderer`) + `BlockComponentProps` contract
- [x] Editor infrastructure: block selection, "+ Add block" menu, toolbar (`BlockShell`)
- [ ] Drag-and-drop reordering of blocks (dnd-kit) and lessons — up/down buttons for now

## Phase 1.5 — Global project themes (done)

- [x] `Course.theme` field (`ThemeId`), 4 themes: Rise / Ocean / Forest / Sunset
- [x] Applied via `data-theme` + CSS variables (accent, button/interactive radius)
- [x] `.btn-primary` / `.btn-secondary` / `.interactive-surface` classes for blocks
- [x] Theme switcher in the Header (`ThemePicker`)

## Phase 2 — Block types (done)

- [x] Text: heading (H1–H3), paragraph (rich text), list (ul/ol), note/warning
- [x] Media: image (single), gallery, video (HTML5) — data URL for now, assets/ in Phase 3
- [x] Continue (unrestricted / restricted)
- [x] Tabs, Accordion (functional + inline editing)
- [x] Flashcards (CSS 3D flip)
- [x] Scenario (dialogue trainer: node editor, choices, emotions)
- [x] Quiz: single / multiple / matching + feedback system (+ passing score)
- Built by 5 parallel agents, verified by a review agent, wired into
  `BlockRenderer`. `npm run build` clean.
- Known minor: quiz "multiple" allows 0 correct options (acceptable per the model).

## Phase 2.5 — Internationalization (done)

- [x] i18n core: `I18nProvider`, `useT` / `useLang`, per-namespace locale files
- [x] Bilingual EN / UK; default English, auto UK for `uk` browsers, persisted
- [x] Whole UI localized (chrome + all 13 blocks); `LanguagePicker` in the Header

## Phase 2.6 — SEO landing page (done)

- [x] Bilingual marketing landing (default English) as the default route
- [x] Sections: hero, trust pillars, privacy callout, features, how-it-works, FAQ, footer
- [x] Emphasizes open source / free / 100% local (no data stored or transmitted)
- [x] Scroll-reveal animations (`useReveal` + CSS keyframes), `prefers-reduced-motion` safe
- [x] Hash routing (`useRoute`): landing → `#/app` builder; SEO meta tags in `index.html`

## Documentation & open source (done)

- [x] `README.md` (English) — overview, features, quick start, structure, roadmap
- [x] `LICENSE` — MIT (© 2026 Dmytro Matsiuk); `license`/`author` in package.json
- [x] `docs/architecture.md` — model, store, rendering, themes, SCORM plan
- [x] `docs/adding-blocks.md` — how to add a new block type (4 steps)
- [x] All docs and code comments in English; `CLAUDE.md` / `AGENTS.md` updated

## Phase 3 — Local persistence (planned)

- [ ] File System Access API: showDirectoryPicker, permissions
- [ ] Save/load `project.json` (auto + Ctrl+S)
- [ ] **Autosave** of changes to `project.json`
- [ ] **Persist undo/redo history to a file** (sidecar) so redo survives reopening a project
- [ ] Copy media into `assets/`, relative paths
- [ ] Fallback for older browsers

## UX phase — Extra requirements (planned, beyond spec v2)

Added by the user during development. The original `.txt` spec has a corrupted
encoding, so these requirements are tracked here as the living list.

- [x] Bilingual EN/UK interface (i18n + language switcher)
- [x] Global project themes
- [x] SEO landing page before the builder (FAQ, animations, open-source/free/local messaging)
- [ ] Full keyboard shortcuts (currently only undo/redo): add/delete/duplicate block,
      navigation between blocks/lessons, save, etc.
- [ ] Right-click context menu (actions on blocks and lessons)
- [ ] Welcome screen on startup: "Open project from computer" / "Create new"
      (folder picker) — to be built together with Phase 3 (File System Access API)

## Phase 4 — SCORM export (planned)

- [ ] Player template (static HTML/JS rendering project.json)
- [ ] SCORM 1.2 API wrapper (LMSInitialize/LMSSetValue, lesson_status, score)
- [ ] Generate `imsmanifest.xml`
- [ ] Pack into a .zip (JSZip) + download
- [ ] SCORM 2004 (after 1.2)

---

## Log

- 2026-05-21 — Start. Agreed on the phase order and SCORM 1.2 first. Phase 1 begun.
- 2026-05-21 — Phase 1 done: types, CRUD store with undo/redo, BlockRenderer, BlockShell, AddBlockMenu, block rendering in Workspace. Build clean.
- 2026-05-21 — Added global project themes (user request): 4 themes, ThemePicker, themed button classes. DnD deferred.
- 2026-05-21 — Phase 2 done: all 13 block components (5 parallel agents + review agent), wired into BlockRenderer, build clean. Fixed startNodeId reassignment in Scenario when the start node is deleted.
- 2026-05-21 — Added documentation: README, LICENSE (MIT), docs/architecture.md, docs/adding-blocks.md.
- 2026-05-21 — Added i18n (EN/UK) across the whole UI + LanguagePicker; default language English. Spacing/design polish across chrome and blocks.
- 2026-05-21 — Added the SEO landing page (bilingual, FAQ, animations) with hash routing; builder moved to `#/app`. Translated all docs and code comments to English.
