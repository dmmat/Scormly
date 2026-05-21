<div align="center">

# Scormly

**Local-first block-based course builder with SCORM export**

Build interactive, block-based courses right in
your browser — no server, no cloud. Everything is stored in your own file
system, and the finished course is exported as a **SCORM 1.2 / 2004** package for
any LMS.

[Features](#-features) ·
[Quick start](#-quick-start) ·
[How it works](#-how-it-works) ·
[Documentation](#-documentation) ·
[Roadmap](#-roadmap)

</div>

---

> **Scormly** is a local-first, in-browser course builder that exports
> standards-compliant **SCORM 1.2 / 2004** packages.
> No backend, no account — your data and media live in your own file system via
> the File System Access API, and packaging happens entirely client-side.

## ✨ Features

- **Block-based editor** — a lesson is built from content blocks with inline WYSIWYG editing.
- **Many block types:** headings, paragraphs, lists, notes, images,
  galleries, videos, a "Continue" button, tabs, accordions, flashcards,
  a dialogue scenario, and quizzes (single / multiple / matching with feedback).
- **Global project themes** — several ready-made styles (Rose, Ocean, Forest,
  Sunset) that change the accent and the look of buttons/interactions with one click.
- **Undo / Redo** with history and keyboard shortcuts (Ctrl/Cmd + Z / Y).
- **Local-first:** the project and media are saved to your own folder via the
  File System Access API — no backend whatsoever.
- **SCORM 1.2 / 2004 export** runs entirely client-side (JSZip).
- **Declarative data model** — the whole course is serialized JSON
  (`project.json`) that is easy to version, import, and export.

## 🧱 Stack

| Layer | Technology |
| --- | --- |
| UI | React 18 + TypeScript (strict) |
| Build | Vite |
| Styling | Tailwind CSS v4 (CSS-first, `@theme`) |
| State | Zustand (+ custom undo/redo history) |
| Files | File System Access API *(planned)* |
| Export | JSZip *(planned)* |
| Drag-and-drop | dnd-kit *(planned)* |

## 🚀 Quick start

> A modern Chromium-based browser (Chrome / Edge) is required to work with the
> File System Access API.

```bash
git clone https://github.com/<your-org>/scormly.git
cd scormly
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

Export assembles a static SCORM player, adds `project.json` and media from
`assets/`, dynamically generates `imsmanifest.xml`, and packs everything into a
single `.zip` with JSZip — no server resources required.

For more detail, see [docs/architecture.md](docs/architecture.md).

## 📁 Project structure

```
src/
├── main.tsx                  # React entry point
├── App.tsx                   # layout + ThemeProvider
├── index.css                 # Tailwind + themes (CSS variables)
├── types/course.ts           # data model (discriminated union of blocks)
├── store/courseStore.ts      # Zustand store: CRUD + undo/redo
├── lib/id.ts                 # ID generation
├── theme/                    # global project themes
├── blocks/
│   ├── registry.ts           # type metadata + default block factory
│   ├── types.ts              # block component contract
│   ├── BlockRenderer.tsx     # type → component dispatcher
│   └── components/           # editor component for each block type
├── hooks/                    # global hooks (keyboard shortcuts)
└── components/
    ├── layout/               # Header, Sidebar, Workspace, Logo
    └── editor/               # BlockShell, AddBlockMenu, ThemePicker
```

## 📚 Documentation

- [docs/architecture.md](docs/architecture.md) — data model, store, rendering, themes.
- [docs/adding-blocks.md](docs/adding-blocks.md) — how to add a new block type.
- [PROGRESS.md](PROGRESS.md) — current development status by phase.

## 🗺 Roadmap

- [x] Editor foundation: model, store, undo/redo, block rendering
- [x] Global project themes
- [x] Bilingual UI (English / Ukrainian) and an SEO landing page
- [x] All content and interactive block types (+ rich-text editor, divider, learner Preview)
- [x] Local saving via the File System Access API (`project.json`, `assets/`, autosave, recent projects)
- [x] SCORM 1.2 export (player, `imsmanifest.xml`, JSZip)
- [x] SCORM 2004 export — implemented but **not yet tested in a real LMS**
- [ ] Drag-and-drop reordering of blocks and lessons

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
