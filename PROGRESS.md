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

## Phase 1 — Editor foundation (done)

- [x] Typed `data` interfaces for each `BlockType` (discriminated union)
- [x] Store CRUD: blocks (add/update/delete/duplicate/move), lessons (add/rename/delete/move/status)
- [x] Undo/redo with `Course` snapshots + typing coalescing; Ctrl+Z/Y shortcuts
- [x] Block render dispatcher (`BlockRenderer`) + `BlockComponentProps` contract
- [x] Editor infrastructure: block selection, "+ Add block" menu, toolbar (`BlockShell`)
- [x] Drag-and-drop reordering of blocks and lessons (dnd-kit)

## Phase 1.5 — Global project themes (done)

- [x] `Course.theme` field (`ThemeId`), 10 themes: Rose / Ocean / Forest / Sunset / Mono / Indigo / Crimson / Mint / Grape / Terminal
- [x] Applied via `data-theme` + CSS variables (accent, button/interactive radius)
- [x] `.btn-primary` / `.btn-secondary` / `.interactive-surface` classes for blocks
- [x] Theme switcher in the Header (`ThemePicker`)

## Phase 2 — Block types (done)

- [x] Text: heading (H1–H3), paragraph (rich text), list (ul/ol), note/warning
- [x] Media: image (single), gallery, video (HTML5) — data URL for now, assets/ in Phase 3
- [x] Continue (unrestricted / restricted): reveals the rest of the lesson; restricted locks until the tasks above are done
- [x] Process diagram, step-by-step guide, comparison, before / after slider, reflection (2026-10-26)
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

## Phase 3 — Local persistence (done)

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

## UX phase — Extra requirements (beyond spec v2)

Added by the user during development. The original `.txt` spec has a corrupted
encoding, so these requirements are tracked here as the living list.

- [x] Bilingual EN/UK interface (i18n + language switcher)
- [x] Global project themes
- [x] SEO landing page before the builder (FAQ, animations, open-source/free/local messaging)
- [x] Editor keyboard shortcuts (undo/redo, save, add/delete/duplicate block, navigation)
- [x] Right-click context menu (actions on blocks and lessons)
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

## Phase 5 — xAPI / cmi5 export (cmi5 done, plain xAPI planned)

TalentLMS supports xAPI (Tin Can) and cmi5. Add these as additional export
targets once SCORM is confirmed working. Reuse the same player; swap the
tracking layer.

- [x] Decided: **cmi5 first** (packaged like SCORM with a `cmi5.xml` manifest; the LMS provides the LRS + launch params). Plain xAPI (own LRS endpoint/auth) can follow.
- [x] cmi5 packaging: `src/export/cmi5Manifest.ts` builds `cmi5.xml` (single AU launching `index.html`; `moveOn`/`masteryScore` from project settings). Shared packager `src/export/packageCommon.ts` (player + assets + embedded course data) reused by SCORM and cmi5; `src/export/exportCmi5.ts` zips + downloads.
- [x] Tracking wrapper `public/scorm-player/xapi.js`: **same `window.SCORM` interface** as `scorm.js`, so `player.js` is unchanged. Reads launch params (`endpoint`, `fetch`, `actor`, `activityId`, `registration`); POSTs the `fetch` URL for the auth token; GETs `LMS.LaunchData` for the context template; sends cmi5-defined statements (initialized → completed/passed/failed → terminated, ordered via a promise queue) and `answered` interaction statements. No-ops without launch params.
- [x] Completion/score mapped: player's `report(completed, success)` + `setScore` → cmi5 `completed`/`passed`/`failed` with `result.score.scaled`; quiz answers → `answered`. (Resume/suspend across launches not yet implemented for cmi5.)
- [x] Export target added to the Header export menu (SCORM 2004 / 1.2 / cmi5) + mobile menu; i18n `exportCmi5`.
- [ ] Verify on a real LRS/LMS (SCORM Cloud cmi5, TalentLMS): import, launch, statements land, pass/fail + score recorded.
- [x] cmi5 resume via the State API (`stateId=suspendData`); the player waits for the launch handshake (`SCORM.whenReady`) before reading it.
- [ ] (Later) Plain xAPI target (own LRS endpoint/auth).

## Accessibility (WCAG 2.1 AA)

Goal: courses built with Scormly are usable with a keyboard, a screen reader,
captions and larger text, in the builder preview and in the exported player alike.

- [x] Theme contrast: every theme's accent passes 4.5:1 for white text on
  `--color-brand` and `--color-brand-dark` text on white (Rose/Ocean/Forest/Sunset/Terminal
  accents darkened one step; values mirrored in `index.css`, `themes.ts` and the player's
  `THEME_ACCENT`). Focus outlines use the accent (≥ 3:1).
- [x] Data model: `ImageRef.decorative`, `VideoData.captions` (WebVTT asset in
  `assets/captions/`) and `transcript`, `AudioData.transcript`, `CourseSettings.contentLanguage`.
- [x] Editor UI: "Decorative image" checkbox (image + per-image in galleries, which also got
  per-image alt inputs), captions `.vtt` picker and transcript textarea on video, transcript on
  audio, content language (BCP 47 with suggestions + validation) in Settings → General.
- [x] Export: `.vtt` files are packaged by the generic `assets/` reference scan.
- [x] Pre-export check: accessibility warnings (image/gallery/hotspot alt text, video
  captions/transcript, audio transcript, embed title) and an info-level hint for a missing
  content language (info alone does not open the dialog).
- [x] AI agent guide (`agentGuide.ts`) documents the new fields and checks.
- [x] Learner side (player + preview): accessibility menu (text size, high contrast, readable
  spacing, reduced motion, captions default), skip link, focus + live announcement on lesson
  change, live feedback, keyboard support for interactive blocks, captions/transcripts, embed
  titles, `prefers-reduced-motion`, LMS caption/language preferences (SCORM 1.2/2004).
- [ ] Screen-reader pass (NVDA + VoiceOver) on an exported package in a real LMS.
- [x] Alt text for inline rich-text images: image context menu + alt field in the image toolbar; the course check flags inline images with no alt attribute.

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
- 2026-05-23 — **SCORM + cmi5 completeness pass** (A+B+C in one go, single-author for API coherence).
  - **A. Objectives + richer interactions.** Added `SCORM.setObjective(i, data)` →
    `cmi.objectives.n.*` (id/score.raw/min/max + 2004 scaled, completion_status & success_status; 1.2 collapses to .status). Player declares one objective per quiz (`QUIZ_<blockId>`). 2004 manifest now lists each quiz as a non-primary `<imsss:objective>` so LMSes that gate on declared objectives recognise the runtime writes. `recordInteraction` extended with optional `weighting`, `latency` (CMITimespan/ISO duration), `description`, `correct_responses.0.pattern`, `timestamp`, and `objectives.0.id` — player passes choices/source/target, the latency since the quiz opened, the question prompt, the correct-response pattern, and the quiz objective id. Matching responses now use SCORM-correct `source.target` notation.
  - **B. LMS context.** Added read-only `SCORM.getLearner / getMode / isResuming / getLaunchData / getLmsMastery / getPreferredLanguage`. Wrapper reads them once after `Initialize`. Player switches UI language when the LMS exposes a supported `learner_preference.language` (1.2) / `learner_preference.language` (2004); the learner name and the lesson mode (browse/review) are shown in the header. When `mode === 'review' | 'browse'`, ALL writes are no-op'd at the wrapper level (the LMS prohibits tracking those attempts). Verified via mock LMS that review mode writes 0 keys. Added `SCORM.setComment(text)` mapping to `cmi.comments_from_learner.n.comment` (2004) / append-only `cmi.comments` (1.2).
  - **C. cmi5 / xAPI completeness.** `xapi.js`: full `progressed` (with `https://w3id.org/xapi/cmi5/result/extensions/progress`, 10% milestone debounce); `abandoned` (ADL verb) emitted from player's `beforeunload` when the course is not complete; **State API resume** — `setSuspend` PUTs the player's resume blob under `stateId=suspendData` (coalesced flushes, `keepalive`); `getSuspend` returns the GET'd blob fetched during launch handshake, so cmi5 resume across launches works at parity with SCORM `cmi.suspend_data`. `launchMode` from LaunchData (Browse/Review → tracking no-op). `answered` statements now carry full `definition` (`interactionType`, `choices`/`source`/`target`, `correctResponsesPattern`, description, `result.duration`). Per-quiz objectives sent as objective-scoped `passed/failed/completed` with `result.score`. Added `commented` statement for learner comments. Learner/mode/lang/mastery readers map from cmi5 actor + LaunchData. `moveon` category added to cmi5 result statements.
  - Verified in node+vm with mock LMS: SCORM 1.2/2004 mock returns objectives, full interactions, learner data, mastery_score, comments, suspend_data, review-mode lockout; cmi5 mock returns full statement sequence (initialized → progressed×N → passed[objective] → answered → passed[result] → completed → commented → terminated) plus State API GET LaunchData + GET/PUT suspendData. `npm run build` clean.
- 2026-09-29 — **cmi5 launch-timing fixes.** The player read resume data and LMS context
  (`getSuspend`, mode, learner, language) synchronously right after `SCORM.init()`, but cmi5
  loads them asynchronously (auth token → LaunchData → suspendData), so cmi5 resume never
  kicked in and the first progress write overwrote the saved state. Added `SCORM.whenReady(cb)`
  (sync in `scorm.js`; after the handshake in `xapi.js`, with an 8s fallback so an unresponsive
  LRS can't leave a blank page); the player's resume/boot now runs inside it. Also read the
  learner's language from the `cmi5LearnerPreferences` agent profile (where cmi5 puts it) with
  LaunchData as fallback. Tests: 60 passing. Refreshed stale checkboxes (DnD, shortcuts,
  context menu were already done).
- 2026-09-29 — **Builder UX pass** (from a UX audit of the editor).
  - Bugs: editor/undo shortcuts no longer reach the course under the preview/settings/help
    overlays; Ctrl+D and Alt+↑/↓ ignored while typing; Backspace deletes the selected block
    (Mac); Esc closes the preview. New/Open/Close project flush the pending autosave first
    (`flushSave`) and confirm if the write failed; `beforeunload` warns when edits would be lost.
    Builder logo no longer links to the landing page.
  - Feedback: toast system (`store/toastStore`, `Toaster`). Exports run through `runExport`
    (single run, progress/success/error toasts, also on mobile). Block/lesson delete toasts
    offer Undo. Save failures show one toast with Retry (and a folder-access message); open and
    upload errors are reported instead of swallowed.
  - Editing: hover "+" between blocks inserts at that position; Enter in the add-block search
    adds the first match; newly selected blocks scroll into view; a new lesson opens in rename
    mode; the sidebar shows block counts / "empty" and lesson rows are keyboard-accessible
    (Enter, F2 to rename) with actions visible on focus and touch; drag handle visible on touch.
    Keyboard shortcuts help (`?` or header button) and shortcut hints in tooltips and the
    context menu (⌘/⌥ on Mac). Empty-course state with Add lesson, spinner while restoring.
  - Verified headlessly (Chromium + CDP): insert-between, Enter-to-add, delete toast + Undo,
    shortcuts help, preview isolation, rename-on-add.
- 2026-09-29 — **Agents batch** (parallel worktrees, merged by the coordinator):
  - Project settings redesigned: large tabbed dialog (General / Appearance / Learner experience /
    Completion & scoring); new `CourseSettings.playerLanguage`, `showProgress`, `finishMessage`
    honoured by the player and preview.
  - New blocks: `hotspot` (image hotspots), `timeline` (vertical / stepper) — not scored;
    `ordering` (sequence / categories) and `fillBlanks` (type / select) — scored like quizzes
    (`SCORED_BLOCK_TYPES` / `isScoredBlock`), with objectives, interactions (`sequencing`,
    `matching`, `fill-in`), resume and linear gating; course-check rules and tests for all four.
  - Help: guided tour (remembered in localStorage), What's new (`help/releaseNotes.ts`), builder Q&A.
  - Landing: AI-ready section (AGENTS.md workflow), refreshed features/FAQ, What's new changelog.
  - `docs/character-brief.md`: art brief for a built-in scenario character library (not built yet).
  - MCP server (`mcp/`, `scormly-mcp`) + builder reload of external project.json edits live on the
    `feature/mcp` branch until the package is published.

- 2026-09-29 — **SEO + demo course**:
  - Build-time prerender (`scripts/seoPrerender.ts`, Vite plugin): the English landing copy is
    written into `#root` of `index.html` as semantic HTML, plus `FAQPage` JSON-LD, so crawlers see
    content without JS. Title/meta/hero/FAQ copy retargeted to "free / open-source / online SCORM
    editor", "SCORM course builder" and "SCORM demo".
  - Built-in bilingual sample course "Spot the phish" (`lib/sampleCourse.ts`, EN/UK) using hotspots,
    tabs, flashcards, a chat scenario, a timeline, a table, ordering, fill-in-the-blanks and a quiz.
    Opened in memory via `#/demo` (landing hero + demo section) or the welcome screen card.
- 2026-09-30 — Landing playground: added image hotspots, sorting, fill-in-the-blanks and timeline
  tabs. They render the real learner blocks (`BlockPreview`) with content from the demo course.
- 2026-09-30 — **Accessibility batch**: theme contrast fixed to WCAG AA across all themes;
  authoring UI for decorative images, video captions (.vtt) and transcripts, audio transcripts
  and the course content language; accessibility warnings in the pre-export check; agent guide
  and docs updated. Learner-side a11y (menu, skip link, focus management, live regions,
  keyboard patterns, LMS preferences) in the player and preview.
- 2026-10-06 — **LMS-compatibility pass over the exports** (standards audit):
  - Manifest `href`s are now %-encoded URIs (`encodeURI` before XML-escaping) — asset
    names with spaces/Cyrillic previously produced invalid URIs that strict LMS
    importers reject.
  - SCORM 2004 manifest always declares `<imsss:deliveryControls
    completionSetByContent="true" objectiveSetByContent="true"/>` so the LMS can't
    auto-complete/satisfy the SCO on exit, overriding the player's reported status.
  - LOM metadata embedded in both manifests (IEEE LOM for 2004, IMS MD 1.2 for 1.2):
    course title, description and content language now show up in LMS catalogs.
    cmi5.xml `langstring lang` uses the course content language too.
  - Player: `cmi.exit` is now always `suspend` (exit="" after completion caused some
    LMS to start a fresh attempt on relaunch, losing the resume state); Finish no
    longer Terminates the session, so "Review the course" (and quiz retakes there)
    stay tracked — Terminate happens on unload or via the new **Exit course** button
    on the completion screen (cmi5 `returnURL` redirect, else `window.close()`).
  - New runtime method `getReturnUrl()` (scorm.js: always ''; xapi.js: LaunchData
    returnURL). Tests: `tests/scormManifest.test.ts` (new), returnURL case in
    `tests/xapi.test.ts`. Manifests validated well-formed with xmllint.
- 2026-10-06 — **Second LMS audit (schema-validated) + fixes**, prompted by a TalentLMS cmi5 run
  where the player showed "Course complete" in Ukrainian while the LMS said "Pending unit completion":
  - **Official schemas bundled**: unmodified ADL/IMS XSD/DTD control documents (from the ADL
    sample packages via SCORM.com Golf Examples) live in `public/scorm-player/schemas/{scorm12,scorm2004}`
    and are zipped at the package root (`addSchemas`, list in `SCHEMA_FILES`).
  - **Manifests validated against them** (`tests/scormManifest.test.ts`, xmllint; skipped if absent):
    2004 incl. LOM + deliveryControls passes. **Correction to the previous entry**: inline IMS MD
    metadata in the 1.2 manifest was removed again — 1.2 `<metadata>` has a strict wildcard, and
    `imsmd_rootv1p2p1.xsd` is non-deterministic, so libxml2-based validators (PHP schemaValidate)
    can't compile it and reject the manifest. `cmi5.xml` validates against the official
    CourseStructure.xsd. The href %-encoding only matters for hand-placed assets (uploads get UUID names).
  - **Completion screen honesty**: Finish with unanswered scored blocks (free navigation) showed
    "Course complete" while the LMS correctly kept it incomplete; it now says the course isn't
    complete and lists the unfinished lessons as links.
  - **Player language 'auto'**: content language (if en/uk) → LMS preference → browser. Previously a
    Ukrainian browser/LMS profile gave Ukrainian buttons on an English course.
  - **Sticky statuses** (scorm.js): passed stays passed (score never lowered), completed never
    returns to incomplete, 1.2 failed isn't replaced by completed/incomplete — LMSes keep the last
    write, and retakes (now also tracked from "Review the course") could downgrade a passed course.
  - **LMS mastery**: 2004 `cmi.scaled_passing_score` is now read (the old comment claiming no runtime
    read was wrong); the player judges pass/fail by the LMS mastery when present. xapi.js re-judges
    against LaunchData masteryScore so `passed` is never sent below it (cmi5 rule).
  - **Unload robustness**: `cmi.exit=suspend` set right after Initialize and `session_time` on every
    commit — browsers block the sync XHR many LMS APIs use during page dismissal, which used to lose
    resume (exit counted as normal) and time.
  - Initialize/SetValue accept boolean `true` (non-conformant LMS APIs); 1.2 interactions report
    choice/matching/sequencing ids by position (`a,b` / `a.b`) to fit CMIFeedback's 255 chars;
    2004 suspend_data falls back to 4000 chars if the LMS rejects more (3rd-Ed limits).
  - Exit course: 2004 sends `adl.nav.request=suspendAll` before Terminate; cmi5 waits for
    `terminated` before redirecting to returnURL; no cmi5 statements after `terminated`.
  - Verified end-to-end in jsdom with the sample course and a mock 2004 LMS (20 checks).
- 2026-10-06 — Follow-ups from live TalentLMS tests:
  - Completion screen for a **failed** attempt: "not passed yet", the pass mark (LMS mastery if
    set) and links to lessons with scored blocks below 100% — instead of "Course complete" + the
    author's congratulations. With cmi5 moveOn `CompletedAndPassed` (scored course) TalentLMS
    correctly keeps a failed AU "Pending unit completion" until a passing retake.
  - Export: schema files are best-effort/all-or-nothing (a failed download skips them with a
    warning); player-file download failures (`PlayerFilesError`) get their own toast instead of
    the media-files hint. A user's SCORM 2004 export failed right during the Pages deploy; the
    same export verified OK afterwards in headless Chrome for 2004 / 1.2 / cmi5.
  - TalentLMS SCORM 1.2 launch showed a CloudFront `MissingKey` (no Key-Pair-Id) error: CloudFront
    checks the signed cookie/query before reading any file, so this is TalentLMS access
    (third-party cookies / expired signature), not package content — pending re-test.
- 2026-10-06 — **cmi5 session ID fix** (TalentLMS kept a passed AU "Pending unit completion"):
  xapi.js generated its own session ID and overwrote the one in LaunchData's `contextTemplate`,
  violating cmi5 §9.6.3.1 ("AU MUST include the session ID provided by the LMS") and §10 ("MUST
  NOT overwrite any values provided in the contextTemplate"). It now keeps every template value
  (own UUID only as a fallback). Verified in real Firefox 156 and Chrome 154 against a mock cmi5
  LMS/LRS running the exported package (18 statement-level checks; the old runtime fails the
  session-ID one). Also from the AU-obligations sweep of the spec: `audioPreference` 'off' (cmi5
  §11.2) — and SCORM audio_level 0 / audio -1 — now start media muted. Note: TalentLMS supports
  only SCORM 1.2, xAPI and cmi5 (not SCORM 2004); its Reports → Timeline shows `[TC] completion` /
  `[TC] failure`, and xAPI must be enabled under Account & Settings → Integrations.
- 2026-10-06 — **TalentLMS root cause found** (from a HAR of `/cmi5/statements`): TalentLMS answered
  the `initialized` statement with HTTP 200 but body `{"success":false,"message":"tincan logging is
  not enabled"}` — the portal's xAPI integration (Account & Settings → Integrations → xAPI) was off,
  so every statement was silently dropped and the unit stayed "Pending". Our runtime now warns
  `[xAPI] statement not stored by the LMS: …` on such responses. The HAR also confirmed the session-ID
  fix in the field (statements carry TalentLMS's session ID). TalentLMS notes: registration is not a
  UUID (base64 `1-<id>-<ts>`), session ID is a constant `123`; Preview mode doesn't record progress.
- 2026-10-06 — **SCORM 1.2 verified on TalentLMS** (console log of the LMS API): unit completed,
  course 100%, `lesson_status=passed`, score, suspend_data, exit=suspend, session_time on each
  commit and compact interaction ids all accepted. Fixes from the log: TalentLMS doesn't implement
  `cmi.objectives` (401) — the runtime now skips objective/interaction families the LMS reports as
  not implemented (401 / 2004 402) instead of 5 failing writes per scored block; learner names in
  "Last, First" form (TalentLMS sends `Dmytro,Dmytro`) display as "First Last"; lesson_status is
  read once at launch.
- 2026-10-06 — **Design batch** (block types, styling, cover page, motion):
  - Block format popover (palette button in the block toolbar): theme-derived
    backgrounds (light gray, tint, accent, gradient, dark), padding, and width
    (column / full-width band). Same-background neighbours join into one panel.
  - Ready-made blocks in the Add menu, grouped Text / Quotes / Media / Structure:
    heading & text, lead paragraph, drop cap, two columns, tip, key point,
    highlight, key takeaways, statement, testimonial, quote with photo left /
    right, quote on image, carousel, image & text, text on image, full-width
    hero, wide carousel, full-width image, banner, full-width band, chapter
    opener, ornament / wave dividers, downloads, knowledge check.
  - New **Columns** block (2–4 text columns: plain / cards / lines). Hover
    preview in the Add menu: after a short pause the real learner rendering of
    the block or template appears beside the menu. Nicer selects in learner
    content and a card/tray look for the sorting exercise (preview + player).
  - Quote styles (classic, statement, card, photo with left/right side, on image);
    paragraph styles (lead, drop cap, columns); callouts (note, tip, success,
    warning); dividers (gradient, dots, ornament, wave, label, spacer).
  - Image size (small / medium / column / full width) + alignment; gallery grid
    columns or carousel; new blocks **Image & text** (left/right/overlay) and
    **Attachment** (files in `assets/files/`, downloaded under the original name;
    HTML/JS/SVG/XML blocked).
  - Photo backgrounds for any block (`settings.background: 'image'` +
    `backgroundImage`, dimmed for readable white text); "Photo band" and "Band
    with picture" templates. Full-width layouts without a background: image &
    text runs the picture to the page edge, text and cards stay readable. The
    editor joins same-background neighbours into one panel too. The style
    popover opens above/below the block instead of covering it. The player CSS
    sync runs automatically before `npm run dev` / `npm run build`.
  - Block width now has four steps: narrow (~60% of the column), column, wide
    (breaks out up to 20rem past the column) and full width. Select/callout/
    attachment corners are capped so pill-shaped themes don't make them round.
  - Add-block menu regrouped explicitly: a section rail (Ready-made: Text /
    Quotes / Media / Structure; Basic blocks: Text / Media / Interactive /
    Navigation, with counts) and the selected group on the right under a
    "Section / Group" header; search lists every match grouped the same way.
    The hover preview floats beside the wider menu (over the sidebar if needed).
  - Course cover page (`Course.intro`) as a separate sidebar item, not a lesson.
  - Appearance settings: content width, typography (modern / editorial /
    rounded, system fonts only), block entrance animation, lesson transition.
  - Player + preview: cover page, lesson menu drawer with progress, header
    progress bar, “Next lesson” card, premium restyle; shared block CSS
    `src/styles/blocks.css` synced into `player.css`.
  - Demo course and landing (new Design section, carousel/testimonial demos)
    updated. Verified headlessly (Chromium) in editor, preview and player.
- 2026-10-26 — **Explainer blocks, Continue gates, LMS conformance pass**:
  - Continue: mid-lesson (either mode) it hides the blocks below until clicked,
    then reveals them in place (scroll + focus); at the very end it still leads
    on. Clicks persist. **Blocking** mode is now really locked until the
    quizzes, exercises, reflections and required videos above are done
    (preview + player; it already looked locked in the editor).
  - New blocks: **Process diagram** (arrows / chevrons / cycle the learner
    explores / pyramid), **Step-by-step guide** (all steps or one at a time,
    rich text + picture per step), **Comparison** (pros & cons or options,
    2–4 columns, optional VS badge), **Before / after** slider (mouse, touch
    and keyboard), **Reflection** (free-text answer → sample answer; reported
    as a neutral long-fill-in interaction, `fill-in` on 1.2). Container
    queries keep the layouts right at any block width; dark / accent panels
    covered. Pre-export checks and AGENTS.md entries for each.
  - Spec audit of the runtime (cmi5, SCORM 1.2 / 2004) and fixes: a cmi5
    session carries one of passed / failed (a fail waits for the session end,
    a passing retake replaces it); completed / passed flags are saved only
    once the LRS stores the statement; unload posts everything still queued
    with `terminated` as one keepalive batch (also after "Exit course" times
    out); no resume write before the saved state is read; queued statements
    from a Browse / Review launch are dropped. Slow LRS (handshake past the
    8 s wait): the player starts fresh, its writes are held, and when the saved
    state turns up it is merged in (`whenReady(cb, onLate)` → `lateResume`):
    union of visited / continued / watched, the newer quiz answers, and a
    learner still at the start goes on to the saved lesson. SCORM: the package's own API
    version is preferred (and `top.opener` searched); 1.2 writes the score
    only once complete (mastery-score overrides); the course score is rounded
    once so verdict and raw agree; interaction / objective indexes advance
    only when the LMS accepts the id; progress_measure stays below 1 until
    complete; terminate on pagehide (beforeunload only commits), reload when
    restored from the back/forward cache.
- 2026-10-26 — **Text editor, diagram styles, editor polish**:
  - Rich text: tables (size picker, Tab between cells, rows / columns, header
    row, grid / stripes / lines, full width or fit; right-click menu), links
    (button + Ctrl/⌘+K; web, mail and phone only; open in a new tab), and
    hotkeys matched on the physical key so they work on any layout (B / I / U,
    K, Shift+7 / 8 lists, Shift+L / E / R alignment, \ clear). Toolbar shows
    the formatting at the caret. Table look shared via `.rich-text table`
    (lines from currentColor, so light cards and dark panels both work).
  - Process diagram: Arrows redesigned (numbered circles joined by arrows, at
    most 4 per row, balanced rows, one column when narrow) and a Style per
    layout (`ProcessData.variant`: solid / soft / outline). Step descriptions
    are inline rich text (`ProcessStep.html`: bold, italic, underline, links;
    the editor's `inline` mode), older plain `text` still renders; step titles
    follow the course typography (editorial / modern).
  - Block style popover floats over the block next to its button (flips /
    clamps inside the canvas); keys pressed in popovers no longer reach the
    block shortcuts. Add-block menu has a fixed size (640×620, capped to the
    canvas) so it no longer jumps between groups or searches.

