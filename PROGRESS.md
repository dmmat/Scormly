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

- [x] `Course.theme` field (`ThemeId`), 4 themes: Rose / Ocean / Forest / Sunset
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

## Phase 3 — Local persistence (in progress)

- [x] File System Access API wrapper (`lib/fileSystem.ts`): picker, permissions, JSON/blob I/O, feature detect
- [x] Save/load `project.json` (autosave + Ctrl+S); store holds the directory handle, project name, save state
- [x] **Autosave** (debounced) of changes to `project.json` (`hooks/useAutosave.ts`)
- [x] **Persist undo/redo history to a sidecar file** (`.scormly-history.json`) so redo survives reopening a project
- [x] Welcome screen (create / open project) with fallback for browsers without the File System Access API
- [x] Save-status indicator + project name in the Header
- [x] Copy every uploaded file into the project `assets/images|videos`, store relative paths (`lib/assets.ts`); display via resolved object URLs (`hooks/useAssetUrl`)
- [x] In-browser image optimization via canvas (downscale ~1920px + re-encode); preserves transparency (PNG/WebP keep type, never flattened to JPEG; GIF/SVG kept as-is); no video transcoding
- [x] Supported formats enforced: images PNG/JPEG/WebP/GIF/SVG; video MP4/WebM; others rejected with a message
- [x] Applied to Image, Gallery, Video and Scenario character images (editor + preview); no project / old browser → data-URL fallback
- [x] Inline rich-text images also stored in assets/ (model keeps relative paths; editor & preview resolve to object URLs via `RichHtml`; player uses paths directly) — keeps data URLs out of the model/history
- [x] History size optimized: in-memory limit 50, sidecar persists only the last 20 steps

- [x] Localized default content at creation time (course/lesson/block defaults follow the UI language via a non-React `translate()`)
- [x] Rename course (Sidebar) and lessons (inline edit + delete) ; localized "Add lesson"
- [x] "Open another / new / close project" menu in the Header
- [x] Recent projects remembered in IndexedDB and shown on the welcome screen
- [x] Selection ring given 16px breathing room around block content (BlockShell)

> Note: File System Access flows need a real Chromium browser + user gesture; not yet verified live in this environment.

## UX phase — Extra requirements (planned, beyond spec v2)

Added by the user during development. The original `.txt` spec has a corrupted
encoding, so these requirements are tracked here as the living list.

- [x] Bilingual EN/UK interface (i18n + language switcher)
- [x] Global project themes
- [x] SEO landing page before the builder (FAQ, animations, open-source/free/local messaging)
- [ ] Full keyboard shortcuts (currently only undo/redo): add/delete/duplicate block,
      navigation between blocks/lessons, save, etc.
- [ ] Right-click context menu (actions on blocks and lessons)
- [x] Welcome screen on startup: "Open project from computer" / "Create new" (folder picker)
- [x] GitHub issue templates + a "Report an issue" link in the app (Header + landing footer)

## Phase 4 — SCORM export (SCORM 1.2 done)

- [x] Player template (static HTML/JS in `public/scorm-player/`, renders project.json, all block types incl. interactive)
- [x] SCORM 1.2 API wrapper (`scorm.js`: API discovery, LMSInitialize/SetValue/Commit/Finish, lesson_status, score.raw/min/max)
- [x] Completion + scoring: lesson_status completed/passed/failed; quiz scores aggregated → score.raw vs passing
- [x] Generate `imsmanifest.xml` (`src/export/scormManifest.ts`)
- [x] Pack into a .zip with JSZip incl. media from assets/ (`src/export/exportScorm.ts`) + download; wired to the Header button
- [x] SCORM 2004 — manifest + runtime support (one player auto-detects `API_1484_11` vs `API`, maps completion/success/score). Export version chooser in the Header. ⚠️ **Not tested in a real LMS yet.**

> Note: SCORM runtime needs a real LMS (Moodle/SCORM Cloud) to fully verify; the player no-ops the API gracefully outside an LMS. SCORM 1.2 is the primary, exercised path; **SCORM 2004 export is implemented but UNTESTED.**

---

## Log

- 2026-05-21 — Start. Agreed on the phase order and SCORM 1.2 first. Phase 1 begun.
- 2026-05-21 — Phase 1 done: types, CRUD store with undo/redo, BlockRenderer, BlockShell, AddBlockMenu, block rendering in Workspace. Build clean.
- 2026-05-21 — Added global project themes (user request): 4 themes, ThemePicker, themed button classes. DnD deferred.
- 2026-05-21 — Phase 2 done: all 13 block components (5 parallel agents + review agent), wired into BlockRenderer, build clean. Fixed startNodeId reassignment in Scenario when the start node is deleted.
- 2026-05-21 — Added documentation: README, LICENSE (MIT), docs/architecture.md, docs/adding-blocks.md.
- 2026-05-21 — Added i18n (EN/UK) across the whole UI + LanguagePicker; default language English. Spacing/design polish across chrome and blocks.
- 2026-05-21 — Added the SEO landing page (bilingual, FAQ, animations) with hash routing; builder moved to `#/app`. Translated all docs and code comments to English.
- 2026-05-21 — Phase 3 core: File System Access wrapper, project create/open/save, autosave + history sidecar, welcome screen with fallback, save status in Header. Added GitHub issue templates + "Report an issue" links. Media-to-assets still pending. Build clean (80 modules).
- 2026-05-21 — Localized default content at creation; rename course/lessons + delete lesson; project menu (new/open/close); recent projects via IndexedDB; 16px selection padding.
- 2026-05-21 — Added a shared dependency-free RichTextEditor (bold/italic/underline, lists, alignment, image upload) used by paragraph, tabs and accordion; heading alignment. Build clean (85 modules).
- 2026-05-21 — Added a Divider block (solid/dashed/dotted) and a learner Preview mode (full-screen overlay with lesson navigation, read-only/interactive renderers for every block type incl. quiz scoring and scenario branching). Build clean (94 modules).
- 2026-05-21 — Media-to-assets: uploaded images/videos copied into project assets/ with canvas image optimization (alpha-preserving) and format validation; display via resolved object URLs. Build clean (99 modules). Next: SCORM export.
- 2026-05-21 — Fixed RichTextEditor image insertion (selection save/restore) and replaced symbol icons with inline SVGs.
- 2026-05-21 — SCORM 1.2 export: vanilla player in public/scorm-player/ (renders project.json + all block interactivity), SCORM API wrapper, imsmanifest.xml, JSZip packaging with assets/, download. Build clean (105 modules).
- 2026-05-21 — SCORM 2004 export added: player auto-detects API_1484_11 vs API; 2004 manifest; Header export version menu (2004 labelled "untested"). 2004 NOT verified in a real LMS. Build clean (106 modules).
- 2026-05-21 — Fixed rich-text image insertion (file input survives blur), list rendering (restored markers), added image resize (width slider). History optimized (limit 50, persist last 20). Inline rich-text images moved to assets/ (RichHtml resolves paths) to keep data URLs out of the model/history. Build clean (107 modules).
- 2026-05-22 — Big batch: 5 new blocks (audio, embed, code, table, quote); drag-and-drop reordering (dnd-kit) for blocks & lessons; richer SCORM (resume via suspend_data, session time, cmi.interactions); editor keyboard shortcuts + right-click context menu; AddBlockMenu auto-flip placement; per-tab project restore on refresh (sessionStorage + IndexedDB handle); full meta/OG tags + og-image.svg. Removed all "Articulate" mentions; renamed theme Rise → Rose (with legacy migration). Build clean (126 modules).
- 2026-05-22 — SCORM correctness pass: set `cmi.(core.)exit` = "suspend" on unload so the LMS actually preserves resume data (suspend_data/location); compact suspend_data keys to stay under the 1.2 4096-char limit; enforce restricted "Continue" gating in the player (hides later blocks + locks Next until passed) and fold it into completion; report `cmi.progress_measure` (2004); declare the passing score in the manifest (`adlcp:masteryscore` for 1.2, primary-objective `minNormalizedMeasure` for 2004); log SCORM API errors via GetLastError. Build clean (128 modules).
- 2026-05-22 — Course-level completion/scoring settings (`Course.settings`): completion rule (view all lessons vs. answer all quizzes), optional scoring (pass/fail) with an overall passing score. Editable in the Project settings modal; legacy projects backfilled on load. Player and manifest now read these settings (mastery score only when scored + quizzes present); passing score is no longer mandatory. Build clean (129 modules).
