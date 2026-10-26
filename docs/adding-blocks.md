# How to add a new block type

The block model is declarative and extensible. Adding a new type takes four
steps in four places. Below is an example for a hypothetical `divider` block (a
horizontal separator).

## 1. Extend the union in the data model

File: [`src/types/course.ts`](../src/types/course.ts).

Add a literal to `BlockType`, describe the `data` shape, and add a variant to `Block`:

```ts
export type BlockType =
  | 'heading'
  // …
  | 'divider'            // ← new type

export interface DividerData {
  style: 'solid' | 'dashed'
}

export type Block =
  // …
  | (BaseBlock & { type: 'divider'; data: DividerData })   // ← new variant
```

`BlockOfType<'divider'>` now automatically points to this variant.

## 2. Register the type

File: [`src/blocks/registry.ts`](../src/blocks/registry.ts).

Add an entry to `BLOCK_REGISTRY` with metadata and a default block factory:

```ts
divider: {
  type: 'divider',
  label: 'Divider',
  description: 'Horizontal line',
  category: 'navigation',
  create: () => ({
    id: uid('block'),
    type: 'divider',
    settings: { spacing: 'normal' },
    data: { style: 'solid' },
  }),
},
```

The registry entry automatically appears in the "+ Add block" menu under its
`category`, one of `'text'`, `'media'`, `'structure'` (structure & explanation:
process, steps, timeline, comparison, tabs, accordion), `'interactive'`,
`'assessment'` (knowledge check: scored blocks) or `'navigation'`. Within a
category, blocks are listed in registry order. The name and description come
from the `blocks` i18n namespace (`divider`, `dividerDesc`).

Optionally, offer ready-made **styles** of the block with `variants`. The
first one is the default and has no overrides; the others patch the default
block's `data` (an object, or a function of the default data when they need
fresh ids or derived values) and/or `settings`:

```ts
divider: {
  // …
  variants: [
    { id: 'solid' },
    { id: 'dashed', data: { style: 'dashed' } },
    { id: 'label', data: { style: 'label', label: c('tplChapterLabel') } },
  ],
},
```

The add menu shows them as chips on the block's item, with a live preview,
and inserts the chosen one; `createBlock(type, variantId)` builds one
anywhere else. Label each in both languages as `variant_<type>_<id>` in the
`blocks` namespace (search matches these labels too); `tests/registry.test.ts`
checks the labels and that no variant creates a broken block. Also add a line
icon for the type to `PATHS` in
[`src/blocks/BlockIcon.tsx`](../src/blocks/BlockIcon.tsx) (24×24, stroked) —
the `Record<BlockType, …>` type makes the build fail until you do.

## 3. Create the editor component

File: `src/blocks/components/DividerBlock.tsx`.

Implement the [`BlockComponentProps`](../src/blocks/types.ts) contract, narrowing
the type via `BlockOfType`:

```tsx
import type { BlockComponentProps } from '../types'
import type { BlockOfType } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'

export default function DividerBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'divider'>>) {
  const update = useCourseStore((s) => s.updateBlockData)

  return (
    <div>
      <hr className={block.data.style === 'dashed' ? 'border-dashed' : ''} />
      {selected && (
        <button
          type="button"
          onClick={() =>
            update(lessonId, block.id, {
              style: block.data.style === 'solid' ? 'dashed' : 'solid',
            })
          }
          className="btn-secondary text-sm"
        >
          Change style
        </button>
      )}
    </div>
  )
}
```

### Component conventions

- **Inline WYSIWYG:** a block is both the preview and the editor; show extra
  controls behind `selected`.
- **Editing through the store:** `update(lessonId, block.id, patch, coalesceKey?)`.
  Use a stable `coalesceKey` (e.g. `divider-x-${block.id}`) for continuous typing;
  omit the key for discrete actions.
- **Immutability:** when updating arrays/nested objects, build new ones — don't
  mutate `block.data`.
- **Themes:** for accents, use `bg-brand` / `text-brand` / `border-brand` or the
  `btn-primary` / `btn-secondary` / `interactive-surface` classes — don't hardcode
  colors, or themes won't work.
- **UI strings go through i18n.** Don't hardcode user-facing text — add keys to
  the relevant namespace in `src/i18n/locales/` (English + Ukrainian) and read them
  via `useT('<namespace>')`. Author-edited course content is not localized.
  Comment only where the "why" needs explaining.

## 4. Wire it into the dispatcher

File: [`src/blocks/BlockRenderer.tsx`](../src/blocks/BlockRenderer.tsx).

Import the component and add it to the `BLOCK_COMPONENTS` map:

```ts
import DividerBlock from './components/DividerBlock'
// …
const BLOCK_COMPONENTS: Record<BlockType, ComponentType<BlockComponentProps>> = {
  // …
  divider: DividerBlock as ComponentType<BlockComponentProps>,
}
```

## 5. Learner view: preview and SCORM player

The editor component is only one of three renderers. Also add:

- a case to [`BlockPreview`](../src/preview/BlockPreview.tsx) (in-app preview);
- a case to `renderBlock()` in [`public/scorm-player/player.js`](../public/scorm-player/player.js)
  (the exported course — vanilla JS, no React);
- an entry to `BLOCK_DOCS` in [`src/lib/agentGuide.ts`](../src/lib/agentGuide.ts)
  (the `AGENTS.md` written into project folders; the build fails without it).

Prefer shared class names: put the learner styles in
[`src/styles/blocks.css`](../src/styles/blocks.css) using `sc-<block>` classes,
use the same markup in the preview, the editor and the player. The CSS is
copied into the player by `scripts/syncPlayerCss.mjs`, which runs automatically
before `npm run dev` and `npm run build`. Block-level
format (background, padding, width) is applied by the wrapper
(`blockWrapperProps` / the player's `wrapBlock`), not by the block itself.

## 6. Verify

```bash
npm run build   # strict TypeScript will catch an incomplete union or mismatched types
```

Because `BlockType` and the `BLOCK_COMPONENTS` map are typed as `Record<BlockType, …>`,
TypeScript won't let you forget to add a renderer for the new type.
