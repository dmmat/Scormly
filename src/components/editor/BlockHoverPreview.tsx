import type { Block } from '../../types/course'
import BlockPreview from '../../preview/BlockPreview'
import { useBlockWrapper } from '../../blocks/useBlockWrapper'
import { avatarArt, landscapeArt } from '../../lib/sampleArt'

// Fill empty media in freshly created blocks with placeholder art, so the
// Add-menu preview shows what the block will look like once filled in.
function withSampleMedia(block: Block): Block {
  const b = structuredClone(block)
  if (b.settings.background === 'image' && !b.settings.backgroundImage) b.settings.backgroundImage = landscapeArt(250)
  switch (b.type) {
    case 'image':
    case 'imageText':
      if (!b.data.src) b.data.src = landscapeArt(b.type === 'image' ? 205 : 160)
      break
    case 'gallery':
      if (b.data.images.length === 0) {
        b.data.images = [205, 160, 260, 20].map((h) => ({ src: landscapeArt(h), alt: '' }))
      }
      break
    case 'quote':
      if (!b.data.image && b.data.variant && b.data.variant !== 'classic' && b.data.variant !== 'statement') {
        b.data.image = b.data.variant === 'image' ? landscapeArt(230) : avatarArt('AM')
      }
      break
    case 'hotspot':
      if (!b.data.src) b.data.src = landscapeArt(30)
      break
    case 'beforeAfter':
      if (!b.data.before) b.data.before = landscapeArt(220)
      if (!b.data.after) b.data.after = landscapeArt(30)
      break
    case 'attachment':
      if (b.data.files.length === 0) {
        b.data.files = [
          { id: 'f1', src: '', name: 'handbook.pdf', size: 1_480_000 },
          { id: 'f2', src: '', name: 'checklist.xlsx', size: 64_000 },
        ]
      }
      break
  }
  return b
}

function PreviewBlock({ block }: { block: Block }) {
  return (
    <div {...useBlockWrapper(block.settings)}>
      <BlockPreview block={block} />
    </div>
  )
}

/** Scaled-down learner render of one or more blocks (Add-menu hover card). */
export default function BlockHoverPreview({
  title,
  description,
  blocks,
}: {
  title: string
  description: string
  blocks: Block[]
}) {
  return (
    <div className="pop-in pointer-events-none w-[22rem] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/15">
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className="relative max-h-[22rem] overflow-hidden bg-[#fafafb] p-4">
        {/* Laid out at a normal lesson width, then zoomed down to fit. */}
        <div
          aria-hidden
          className="space-y-5 [zoom:0.55]"
          style={{ width: '36rem', '--page-w': '100%', '--col-w': '36rem' } as React.CSSProperties}
        >
          {blocks.map((b) => (
            <PreviewBlock key={b.id} block={withSampleMedia(b)} />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#fafafb] to-transparent" />
      </div>
    </div>
  )
}
