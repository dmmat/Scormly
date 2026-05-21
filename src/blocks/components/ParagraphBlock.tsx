import { useEffect, useRef } from 'react'
import type { BlockComponentProps } from '../types'
import type { BlockOfType } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'

export default function ParagraphBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'paragraph'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('text')
  const ref = useRef<HTMLDivElement>(null)

  // Sync the DOM with the model only when the field is unfocused, so we don't
  // fight React over the cursor position while typing.
  useEffect(() => {
    const el = ref.current
    if (el && document.activeElement !== el && el.innerHTML !== block.data.html) {
      el.innerHTML = block.data.html
    }
  }, [block.data.html])

  function exec(command: 'bold' | 'italic') {
    ref.current?.focus()
    document.execCommand(command)
    const html = ref.current?.innerHTML ?? ''
    update(lessonId, block.id, { html })
  }

  return (
    <div className="space-y-3">
      {selected && (
        <div className="flex gap-1">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('bold')}
            className="h-8 w-8 rounded-md bg-gray-100 text-sm font-bold text-gray-700 hover:bg-gray-200"
            aria-label={t('bold')}
          >
            B
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('italic')}
            className="h-8 w-8 rounded-md bg-gray-100 text-sm italic text-gray-700 hover:bg-gray-200"
            aria-label={t('italic')}
          >
            I
          </button>
        </div>
      )}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={t('paragraphPlaceholder')}
        onInput={(e) =>
          update(
            lessonId,
            block.id,
            { html: e.currentTarget.innerHTML },
            `paragraph-html-${block.id}`,
          )
        }
        // Initial content is set only on mount; afterwards via useEffect/onInput.
        dangerouslySetInnerHTML={{ __html: block.data.html }}
        className="leading-relaxed text-gray-800 outline-none empty:before:text-gray-300 empty:before:content-[attr(data-placeholder)]"
      />
    </div>
  )
}
