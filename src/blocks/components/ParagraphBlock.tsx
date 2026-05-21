import type { BlockComponentProps } from '../types'
import type { BlockOfType } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import RichTextEditor from '../../components/editor/RichTextEditor'

export default function ParagraphBlock({
  block,
  lessonId,
}: BlockComponentProps<BlockOfType<'paragraph'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('text')

  return (
    <RichTextEditor
      html={block.data.html}
      placeholder={t('paragraphPlaceholder')}
      onChange={(html) =>
        update(lessonId, block.id, { html }, `paragraph-html-${block.id}`)
      }
    />
  )
}
