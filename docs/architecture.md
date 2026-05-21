# Scormly architecture

This document describes the internal structure of the application: the data
model, state management, block rendering, and the theme system. For a high-level
overview, see the [README](../README.md); for the current work status, see
[PROGRESS.md](../PROGRESS.md).

## Principles

- **Local-first, serverless.** No backend. Data, media, and exports live in the
  user's file system (via the File System Access API) and in browser memory.
- **Declarative model.** The entire course is serialized JSON. This makes it easy
  to save (`project.json`), undo/redo, import, and export to SCORM.
- **Extensibility through types.** Adding a new block type = extend the union +
  add a registry entry + add a renderer component. See [adding-blocks.md](adding-blocks.md).

## Data model

File: [`src/types/course.ts`](../src/types/course.ts).

Hierarchy: `Course → Lesson[] → Block[]`.

```
Course
├── id, title, description, coverImage?
├── theme: ThemeId          # global project theme
└── lessons: Lesson[]
        ├── id, title, status
        └── blocks: Block[]
                ├── id
                ├── type: BlockType
                ├── settings: BlockSettings
                └── data: <depends on type>
```

`Block` is a **discriminated union** on the `type` field. Each variant has its own
`data` shape (for example, `HeadingData`, `QuizData`), so narrowing by `type` gives
full type safety in renderers and editors. The helper type `BlockOfType<'quiz'>`
extracts a specific variant from the union.

Block types are grouped by purpose: text (`heading`, `paragraph`, `list`,
`note`), media (`image`, `gallery`, `video`), navigation (`continue`), and
interactive (`tabs`, `accordion`, `flashcards`, `scenario`, `quiz`).

## State management

File: [`src/store/courseStore.ts`](../src/store/courseStore.ts) — a Zustand store.

The store holds `course`, `activeLessonId`, `selectedBlockId`, and the history
stacks `past` / `future`.

### Mutations and history

All course changes go through the internal helper `mutate(fn, coalesceKey?)`:

1. Deep-copies the current `course` (`structuredClone` — the model is JSON-serializable).
2. Applies the mutation to the copy.
3. Pushes the previous state onto `past` and clears `future`.

**Coalescing.** If a `coalesceKey` is passed that matches the previous one, the
edit does **not** create a new history step and is instead merged with the
previous one. This way typing in a single field becomes one undo step, while
structural actions (add/remove a block) stay as separate steps. Components pass a
stable key for typing (for example, `heading-text-<id>`) and omit it for discrete
actions.

`undo` / `redo` simply shuffle states between `past`, `course`, and `future`. The
keyboard shortcuts are wired up by the [`useUndoRedoShortcuts`](../src/hooks/useUndoRedoShortcuts.ts) hook.

### Public store API (essentials)

- Navigation: `setActiveLesson`, `selectBlock`.
- Course: `updateCourseMeta`, `setTheme`, `loadCourse`.
- Lessons: `addLesson`, `renameLesson`, `deleteLesson`, `moveLesson`, `setLessonStatus`.
- Blocks: `addBlock`, `updateBlockData`, `updateBlockSettings`, `deleteBlock`,
  `duplicateBlock`, `moveBlock`.
- History: `undo`, `redo`.

`updateBlockData(lessonId, blockId, partialData, coalesceKey?)` is the main editing
method: it shallow-merges `partialData` into `block.data`.

## Block rendering and editing

The editor works in **inline WYSIWYG** mode: a block is
both the preview and the editor at the same time.

- [`BlockRenderer`](../src/blocks/BlockRenderer.tsx) — the `type → component` dispatcher.
- [`BlockShell`](../src/components/editor/BlockShell.tsx) — a wrapper with selection
  and a toolbar (move up / move down / duplicate / delete).
- [`AddBlockMenu`](../src/components/editor/AddBlockMenu.tsx) — the "+ Add block" menu,
  grouped by the categories from [`registry.ts`](../src/blocks/registry.ts).
- `src/blocks/components/*` — one editor component per block type, each
  implementing the [`BlockComponentProps`](../src/blocks/types.ts) contract.

The registry [`registry.ts`](../src/blocks/registry.ts) contains the metadata for
each type (label, description, category, icon) and the **default block factory**
`create()`, which `addBlock` calls.

## Theme system

Files: [`src/theme/`](../src/theme/), with styles in [`src/index.css`](../src/index.css).

There is **one theme per course** (`Course.theme`), and it affects the accent
color and the shape of buttons/interactive surfaces. Implementation:

- [`ThemeProvider`](../src/theme/ThemeProvider.tsx) sets the `data-theme` attribute
  on the root container.
- For each `[data-theme="..."]`, `index.css` overrides CSS variables:
  `--color-brand` (and therefore all `bg-brand` / `text-brand` utilities),
  `--radius-btn`, `--radius-interactive`.
- The global classes `.btn-primary`, `.btn-secondary`, `.interactive-surface`
  read these variables, so blocks that use them automatically follow the theme.

The theme registry is in [`themes.ts`](../src/theme/themes.ts); the switcher is
[`ThemePicker`](../src/components/editor/ThemePicker.tsx).

## SCORM export (planned)

Export will run entirely on the client:

1. Take a static SCORM player template (HTML/JS that renders `project.json` and
   talks to the LMS API).
2. Add `project.json` and media from `assets/`.
3. Dynamically generate `imsmanifest.xml` (metadata, organizations, resources).
4. Pack everything into a `.zip` with JSZip and offer it for download.

In the LMS, the player implements the SCORM API: for 1.2 — `LMSInitialize`,
`LMSSetValue`, `cmi.core.lesson_status`, `cmi.core.score.*`.
