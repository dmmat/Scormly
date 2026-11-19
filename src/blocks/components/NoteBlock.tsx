import type { BlockComponentProps } from '../types'
import type { BlockOfType, NoteVariant } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import NoteView from '../../preview/components/NoteView'
import RichTextEditor from '../../components/editor/RichTextEditor'
import { Segmented, SettingsBar } from '../../components/editor/controls'
import { stepHtml } from '../process'

const VARIANTS: NoteVariant[] = ['note', 'tip', 'success', 'warning']

// The plain version of the text, kept in `text` for search and agents.
function plainText(html: string): string {
  const el = document.createElement('div')
  el.innerHTML = html.replace(/<br\s*\/?>/gi, '\n')
  return el.textContent ?? ''
}

export default function NoteBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'note'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('text')
  const { variant, title = '', icon } = block.data

  return (
    <div className="space-y-3">
      {selected && (
        <SettingsBar>
          <Segmented<NoteVariant>
            label={t('noteKind')}
            value={variant}
            onChange={(v) => update(lessonId, block.id, { variant: v })}
            options={VARIANTS.map((v) => [v, t(v)] as const)}
          />
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={icon !== false}
              onChange={(e) => update(lessonId, block.id, { icon: e.target.checked })}
              className="h-4 w-4 accent-brand"
            />
            {t('noteIcon')}
          </label>
        </SettingsBar>
      )}
      <NoteView variant={variant} icon={icon}>
        {/* The label is optional: its field shows while the block is selected, or once it has text. */}
        {(selected || title) && (
          <input
            type="text"
            value={title}
            placeholder={t('noteTitlePlaceholder')}
            aria-label={t('noteTitlePlaceholder')}
            onChange={(e) => update(lessonId, block.id, { title: e.target.value }, `note-title-${block.id}`)}
            className="sc-note-title block w-full bg-transparent outline-none placeholder:text-current placeholder:opacity-40"
          />
        )}
        <RichTextEditor
          inline
          html={stepHtml(block.data)}
          placeholder={variant === 'warning' ? t('warningPlaceholder') : t('notePlaceholder')}
          className="sc-note-text"
          onChange={(html) => update(lessonId, block.id, { html, text: plainText(html) }, `note-text-${block.id}`)}
        />
      </NoteView>
    </div>
  )
}
