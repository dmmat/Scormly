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
- [x] SCORM 2004 — manifest + runtime support (one player auto-detects `API_1484_11` vs `API`, maps completion/success/score). Export version chooser in the Header; 2004 is the default/primary version, 1.2 still available.
- [x] **Embed course data instead of fetching it.** The player used to `fetch('project.json')` at runtime, which fails inside an LMS (sandboxed SCO / CDN-served files reject runtime fetch/XHR — seen as "project.json not found" on 1.2 and HTTP 400 on 2004). Course data is now written to `course-data.js` (`window.__SCORMLY_COURSE__`) and loaded via a `<script>` tag; `<` is escaped so block HTML cannot break out of the script tag. Verified booting + driving the SCORM API for both 1.2 and 2004 in jsdom with a mock LMS.

### To do — verify & finish SCORM (target LMS: **TalentLMS**)

> **2026-05-22 — Confirmed working on SCORM Cloud** (both packages import, launch,
> render, and track). SCORM Cloud is the reference SCORM conformance test suite, so
> the runtime/manifest are sound. TalentLMS-specific items below remain to be checked
> on a live instance, but are now lower priority.

- [ ] Upload both packages (1.2 and 2004) to TalentLMS and confirm: import succeeds, the SCO launches, course renders.
- [ ] Confirm tracking lands in TalentLMS: completion status, score, pass/fail, time, and resume (suspend_data) across sessions.
- [ ] If 2004 import still fails ("bad file"), it's a manifest issue — validate `imsmanifest.xml` against the SCORM 2004 4th Ed schema and align with a known-good template (sequencing/objectives are the riskiest part).
- [ ] Verify quiz `cmi.interactions` show up in TalentLMS reports; fix the SCORM 1.2 matching-response format (`source.target` pairs, not `key=value`) if the LMS rejects it.
- [ ] Confirm media (assets/) and embeds load inside the LMS iframe.

> Note: the player no-ops the SCORM API gracefully outside an LMS. Runtime is now exercised in jsdom with a mock LMS (both versions); still needs sign-off on a live TalentLMS instance.

## Phase 5 — xAPI / cmi5 export (planned)

TalentLMS supports xAPI (Tin Can) and cmi5. Add these as additional export
targets once SCORM is confirmed working. Reuse the same player; swap the
tracking layer.

- [x] Decided: **cmi5 first** (packaged like SCORM with a `cmi5.xml` manifest; the LMS provides the LRS + launch params). Plain xAPI (own LRS endpoint/auth) can follow.
- [x] cmi5 packaging: `src/export/cmi5Manifest.ts` builds `cmi5.xml` (single AU launching `index.html`; `moveOn`/`masteryScore` from project settings). Shared packager `src/export/packageCommon.ts` (player + assets + embedded course data) reused by SCORM and cmi5; `src/export/exportCmi5.ts` zips + downloads.
- [x] Tracking wrapper `public/scorm-player/xapi.js`: **same `window.SCORM` interface** as `scorm.js`, so `player.js` is unchanged. Reads launch params (`endpoint`, `fetch`, `actor`, `activityId`, `registration`); POSTs the `fetch` URL for the auth token; GETs `LMS.LaunchData` for the context template; sends cmi5-defined statements (initialized → completed/passed/failed → terminated, ordered via a promise queue) and `answered` interaction statements. No-ops without launch params.
- [x] Completion/score mapped: player's `report(completed, success)` + `setScore` → cmi5 `completed`/`passed`/`failed` with `result.score.scaled`; quiz answers → `answered`. (Resume/suspend across launches not yet implemented for cmi5.)
- [x] Export target added to the Header export menu (SCORM 2004 / 1.2 / cmi5) + mobile menu; i18n `exportCmi5`.
- [ ] Verify on a real LRS/LMS (SCORM Cloud cmi5, TalentLMS): import, launch, statements land, pass/fail + score recorded.
- [ ] (Later) Plain xAPI target + cmi5 resume via the State API.

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
- 2026-05-22 — Made SCORM 2004 the default/primary export (listed first; default version arg) and dropped the "untested" label since neither version is LMS-verified yet. Landing page de-emojified: replaced all emoji icons with inline stroke SVG icons (pillars, features, privacy lock, FAQ chevron) and added decorative backgrounds (faint dot-grid with radial mask, gradient blobs, gradient/ring icon tiles, dashed step connector). Build clean. Not visually verified in a browser (headless env).
- 2026-05-22 — Scenario **chat / messenger layout**: new `ScenarioData.layout` ('classic' | 'chat',
  default classic). Chat mode renders a phone-style messenger — incoming bubbles with the character's
  emotion avatar, the learner's choices as outgoing bubbles, an accumulating conversation, reply
  buttons, and restart at the end. Same branching/node model; toggle in the editor; implemented in the
  in-app preview and the player (+ CSS). Documented in AGENTS.md. Chat layout also supports a **learner
  avatar** (`ScenarioData.userAvatar`) shown on the user's reply bubbles.
- 2026-05-22 — **Download project (.zip)** for sharing: a project-menu action that zips a clean copy —
  `project.json` + referenced media (`assets/`) + `AGENTS.md`, **without** the undo/redo history sidecar.
  Recipient unzips into a folder and opens it in Scormly. Reuses the referenced-assets packager; works
  in no-folder mode too (media as data URLs in project.json). Also made the project menu an explicit,
  discoverable button (bordered trigger + folder/chevron icons + "Project" caption).
- 2026-05-22 — **Interactive landing redesign**: hero now features a **self-playing dialogue
  trainer** (phone-style chat that types, shows reply chips, auto-picks, and loops — `ChatDemo`); a new
  **"Play with the real blocks" section** (`Playground`) with clickable Quiz / Flashcards / Course-outline
  demos; redesigned the Pillars (editorial numbered grid with gradient icon tiles) and Features (bento
  grid with two branded anchor tiles) so they're no longer flat card walls. Added a **Contribute CTA**
  band before the footer ("Let's build Scormly together" → GitHub repo + issues). New `demo` i18n
  namespace (EN/UK); demo styles + keyframes in `index.css`; honors `prefers-reduced-motion`. No new
  deps (CSS + timers). Not visually verified (headless env).
- 2026-05-22 — **Discoverability + installable app**: added `public/robots.txt` (allows web + AI
  crawlers: GPTBot, ClaudeBot, PerplexityBot, Google-Extended, …; points to the sitemap),
  `public/sitemap.xml` (with hreflang alternates), `public/llms.txt` (llmstxt.org-style project summary
  for LLMs, incl. the AGENTS.md note), JSON-LD `SoftwareApplication` structured data in `index.html`, and
  a PWA `public/manifest.webmanifest` + theme-color/manifest links so Scormly can be installed as a
  Chrome app (start_url `/#/app`, standalone).
- 2026-05-22 — Quiz setting **showAnswers** (default true): when off, submitting shows only the score
  (no correct/incorrect highlighting, per-option or per-question feedback). Wired through the model,
  registry default, editor toggle, in-app preview and the player; documented in AGENTS.md.
- 2026-05-22 — Export now bundles **only referenced assets**: `collectAssetPaths` scans the course
  JSON (structured src/cover fields + inline rich-text image paths) and `addAssets` skips any file in
  assets/ not referenced — orphans from replaced/removed media no longer bloat the package. Fixed a
  linear-navigation bug: answering a quiz updated state but not the Next button (the quiz re-renders
  itself, not the page), so Next stayed disabled even with all quizzes answered — `recordScore` now
  calls `refreshGating()`.
- 2026-05-22 — Player navigation + video controls. Course setting **navigation: free | linear**
  (Project settings): linear unlocks "Next/Finish" only once the current lesson's gates are satisfied
  (restricted Continue + required videos) and, under the 'quiz' completion rule, its quizzes are
  answered; Previous stays available. Video blocks: download disabled (controlsList=nodownload, no
  context menu / PiP — deterrent, not DRM) everywhere (editor/preview/player); new per-video
  **requireWatch** toggle — watching to ~95% (or end) satisfies the lesson's advance gate (player
  tracks it, persists in suspend_data 'w', shows a hint, refreshes the Next button in place without
  resetting the video). Moved Project settings out of the header into a labelled button in the left
  sidebar (settingsOpen lifted to the store; modal rendered in Builder). Build clean; player.js checked.
- 2026-05-22 — Added a **Finish** button: on the last lesson "Next" becomes "Finish", which
  reports final state, terminates the LMS session (SCORM.finish), and shows a completion screen
  (check + score + pass/fail + message, with a Review action). Mirrored in the in-app Preview
  overlay (completion card + Review). Build clean; player.js/xapi.js syntax-checked.
- 2026-05-22 — SCORM 1.2 + 2004 **verified on SCORM Cloud** (import/launch/score OK). Fixed cmi5
  `cmi5.xml` namespace (root `courseStructure` must be in the cmi5 target namespace via default
  `xmlns=`, not `xsi:noNamespaceSchemaLocation`) — was rejected with "Cannot find the declaration of
  element 'courseStructure'". cmi5 now imports/launches. Fixed cmi5 score not reporting: `xapi.js` now
  emits `passed`/`failed` (carrying `result.score`) as soon as the quizzes are scored (driven by
  `setScore`, compared against the LaunchData masteryScore / course passing score), instead of waiting
  for full course completion — parity with the SCORM runtime's live score. Agent guide now refreshes on
  project open (rewritten when missing or out of date), not just backfilled. Build clean.
- 2026-05-22 — Phase 5 (cmi5/xAPI) first cut: cmi5 export added next to SCORM. Refactored the
  packager into `packageCommon.ts` (player files + tracking script + embedded course data + assets),
  shared by SCORM and cmi5. New `xapi.js` runtime implements the same `window.SCORM` interface so
  `player.js` is untouched; it does the cmi5 launch handshake (auth-token fetch, LMS.LaunchData) and
  sends ordered cmi5 statements (initialized/completed/passed/failed/terminated + answered). `cmi5.xml`
  manifest with moveOn/masteryScore from project settings. Wired into the export menu (+ i18n). Build
  clean (134 modules). Not yet verified on a live LRS.
- 2026-05-22 — Agent guide: new projects (and older ones on open, if missing) get an `AGENTS.md`
  written into the project folder documenting the `project.json` model and every block type's `data`
  shape, so AI agents / humans can read, edit, and author courses by editing `project.json` directly.
  Generated from `src/lib/agentGuide.ts` (block docs typed `Record<BlockType, …>` so new block types
  must be documented). Best-effort write; never blocks project create/open.
- 2026-05-22 — Add-block menu polish: search field (filters by translated name/description,
  autofocus on open, "no matching blocks" state) and fixed small-screen overflow (dropdown
  now centered on the trigger and capped to `100vw-2rem` with a sticky search header over a
  scrollable list). Shrank the empty-lesson placeholder (smaller icon, padding, text).
- 2026-05-22 — SCORM confirmed working on **SCORM Cloud** (both 1.2 and 2004). Added an
  editable lesson title at the top of the Workspace (was read-only; sidebar inline edit
  still works, both go through `renameLesson`). New **Course outline** block (`courseOutline`,
  navigation category): lists the course's lessons as clickable links (lesson list derived
  live from the store, not stored in the block, so it stays in sync). Editor jumps to a
  lesson once the block is selected; preview navigates via an `onNavigate` callback; SCORM
  player navigates via `visit(index)`. Optional heading + numbered/plain toggle. Build clean.
- 2026-05-22 — SCORM LMS fix (reported failing on TalentLMS): replaced runtime `fetch('project.json')` with course data embedded as `course-data.js` (`window.__SCORMLY_COURSE__`, loaded via `<script>`), since LMS sandbox/CDN delivery rejects runtime fetch of sibling files (caused "project.json not found" on 1.2 and HTTP 400 on 2004). Escaped `<` to keep block HTML from breaking out of the script tag. Verified boot + SCORM API calls for both 1.2 and 2004 in jsdom with a mock LMS; build clean. Added a "verify SCORM on TalentLMS" checklist and a Phase 5 plan for xAPI/cmi5 export.
