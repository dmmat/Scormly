<div align="center">

# Scormly

**Local-first block-based course builder with SCORM & cmi5 export**

Build interactive, block-based courses right in your browser — no server, no
cloud. Everything is stored in your own file system, and the finished course is
exported as a **SCORM 1.2 / 2004** or **cmi5 (xAPI)** package for any LMS.

### 🌐 [scormly.app](https://scormly.app/)

[Features](#-features) ·
[Quick start](#-quick-start) ·
[How it works](#-how-it-works) ·
[Documentation](#-documentation) ·
[Roadmap](#-roadmap)

</div>

---

> **Scormly** is a local-first, in-browser course builder that exports
> standards-compliant **SCORM 1.2 / 2004** and **cmi5 (xAPI)** packages.
> No backend, no account — your data and media live in your own file system via
> the File System Access API, and packaging happens entirely client-side.

## ✨ Features

- **Block-based editor** — a lesson is built from content blocks with inline
  WYSIWYG editing, drag-and-drop reordering, and a right-click context menu.
- **Rich block library:**
  - *Text:* headings, rich-text paragraphs, lists, callouts (note / warning),
    code, tables, quotes.
  - *Media:* images, galleries, video, audio, and embeds (YouTube / Vimeo /
    any https page).
  - *Navigation:* a "Continue" button (optionally **restricted** — gates the
    rest of the lesson), a divider, and a **course outline** that links to the
    other lessons.
  - *Interactive:* tabs, accordions, flashcards, a branching **dialogue
    scenario**, and **quizzes** (single / multiple / matching with per-answer
    feedback, a passing score, and a "show correct answers" toggle).
- **Video controls** — download is disabled by default, and any video can
  **require watching** (~95%) before the learner may continue.
- **Course settings** — completion rule (view all lessons vs. answer all
  quizzes), optional pass/fail scoring with a passing score, and a **navigation
  mode** (free, or **linear** where *Next* unlocks only once the lesson is done).
- **Learner preview** — a full-screen, in-app run-through with a *Finish* screen.
- **Global project themes** — Rose, Ocean, Forest, Sunset — change the accent and
  the look of buttons/interactions with one click.
- **Bilingual UI** (English / Ukrainian) and an SEO landing page.
- **Undo / Redo** with history and keyboard shortcuts (Ctrl/Cmd + Z / Y),
  persisted alongside the project.
- **Local-first** — the project and media are saved to your own folder via the
  File System Access API (autosave, recent projects, image optimization); no
  backend whatsoever.
- **SCORM 1.2 / 2004 and cmi5 (xAPI) export** — runs entirely client-side
  (JSZip). SCORM is verified on SCORM Cloud.
- **AI-friendly** — every project gets an `AGENTS.md` documenting `project.json`
  and all block types, so an AI assistant can read, edit, or author courses by
  editing the JSON directly.
- **Declarative data model** — the whole course is serialized JSON
  (`project.json`) that is easy to version, import, and export.

## 🧱 Stack

| Layer | Technology |
| --- | --- |
| UI | React 18 + TypeScript (strict) |
| Build | Vite |
| Styling | Tailwind CSS v4 (CSS-first, `@theme`) |
| State | Zustand (+ custom undo/redo history) |
| Files | File System Access API |
| Export | JSZip (SCORM 1.2 / 2004, cmi5) |
| Drag-and-drop | dnd-kit |

## 🚀 Quick start

> A modern Chromium-based browser (Chrome / Edge) is required to save to disk via
> the File System Access API.

```bash
git clone https://github.com/dmmat/Scormly.git
cd Scormly
npm install
npm run dev      # http://localhost:5173
```

Other commands:

```bash
npm run build    # type check (tsc --noEmit) + production build
npm run preview  # local preview of the production build
```

## 🛠 How it works

A course is a hierarchical JSON object: `Course → Lesson[] → Block[]`. Each block
has an `id`, a `type`, `settings`, and typed `data`. The editor renders blocks
through a dispatcher, and changes flow through a Zustand store with snapshots for
undo/redo.

Export bundles a self-contained static player with the course data embedded as
`course-data.js` (loaded via a `<script>` tag — LMS sandboxes reject runtime
`fetch` of sibling files), copies the **referenced** media from `assets/`,
generates the manifest, and packs everything into a single `.zip` with JSZip —
no server required:

- **SCORM 1.2 / 2004** — `imsmanifest.xml` + `scorm.js` (one runtime auto-detects
  the API version).
- **cmi5 (xAPI)** — `cmi5.xml` + `xapi.js` (the same player; it does the cmi5
  launch handshake and sends xAPI statements to the LMS's LRS).

For more detail, see [docs/architecture.md](docs/architecture.md).

## 📁 Project structure

```
src/
├── main.tsx                  # React entry point (I18nProvider)
├── App.tsx                   # hash router: landing vs. builder
├── index.css                 # Tailwind + theme tokens + landing animations
├── types/course.ts           # data model (discriminated union of blocks)
├── store/courseStore.ts      # Zustand store: CRUD + undo/redo + UI state
├── i18n/                     # internationalization (EN / UK)
├── theme/                    # global project themes
├── lib/                      # file system, assets, project service, agent guide
├── blocks/
│   ├── registry.ts           # type metadata + default block factory
│   ├── BlockRenderer.tsx     # type → component dispatcher
│   └── components/           # editor component for each block type
├── preview/                  # read-only learner rendering of each block
├── export/                   # SCORM + cmi5 manifests and packaging
├── hooks/                    # keyboard shortcuts, autosave, asset URLs
└── components/
    ├── Builder.tsx           # editor shell (route #/app)
    ├── landing/              # SEO marketing landing (default route)
    ├── layout/               # Header, Sidebar, Workspace, Logo
    ├── editor/               # BlockShell, AddBlockMenu, ProjectSettings, …
    ├── preview/              # full-screen learner preview overlay
    └── welcome/              # open/create-project welcome screen

public/scorm-player/          # vanilla runtime shipped in every export
├── index.html  player.js  player.css
├── scorm.js                  # SCORM 1.2 / 2004 runtime
└── xapi.js                   # cmi5 (xAPI) runtime (same window.SCORM interface)
```

## 📚 Documentation

- [docs/architecture.md](docs/architecture.md) — data model, store, rendering, themes.
- [docs/adding-blocks.md](docs/adding-blocks.md) — how to add a new block type.
- [PROGRESS.md](PROGRESS.md) — current development status by phase.
- `AGENTS.md` — generated into each project folder; documents `project.json` and
  every block type so AI agents (and humans) can edit courses directly.

## 🗺 Roadmap

- [x] Editor foundation: model, store, undo/redo, block rendering
- [x] All content & interactive block types (+ rich-text editor, course outline)
- [x] Global project themes
- [x] Bilingual UI (English / Ukrainian) and an SEO landing page
- [x] Drag-and-drop reordering, right-click context menu, keyboard shortcuts
- [x] Local saving via the File System Access API (`project.json`, `assets/`,
      autosave, history, recent projects)
- [x] Learner preview + Finish/completion screen
- [x] Course settings: completion rule, pass/fail scoring, navigation mode
- [x] SCORM 1.2 / 2004 export — **verified on SCORM Cloud**
- [x] cmi5 (xAPI) export — implemented; not yet verified on a live LRS
- [x] AI agent guide (`AGENTS.md`) generated per project
- [ ] Verify cmi5 on a live LRS / TalentLMS; cmi5 resume across launches
- [ ] Plain xAPI target (own LRS endpoint), more interface languages

For the detailed up-to-date status, see [PROGRESS.md](PROGRESS.md).

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repo and create a branch (`git checkout -b feature/...`).
2. Make sure `npm run build` passes without errors (strict TypeScript).
3. Follow the conventions in [CLAUDE.md](CLAUDE.md): comment only where the "why"
   needs explaining, keep the JSON model declarative.
4. Open a Pull Request describing your changes.

## 📄 License

[MIT](LICENSE) © 2026 Dmytro Matsiuk
