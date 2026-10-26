import type { BlockComponentProps } from '../types'
import type { BlockOfType } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import { AutoTextarea } from '../../components/editor/controls'
import ReflectionPreview from '../../preview/components/ReflectionPreview'

// Reflection: the question and the sample answer are edited in place on the
// learner's card; the learner's own field is shown disabled.
export default function ReflectionBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'reflection'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('explainers')
  const { prompt, sample } = block.data

  if (!selected) return <ReflectionPreview block={block} />

  const ghost =
    'w-full rounded border border-transparent bg-transparent px-1.5 py-0.5 outline-none placeholder-gray-300 hover:border-gray-200 focus:border-brand focus:bg-white'

  return (
    <div className="sc-reflect">
      <AutoTextarea
        value={prompt}
        placeholder={t('promptPlaceholder')}
        aria-label={t('promptPlaceholder')}
        onChange={(e) => update(lessonId, block.id, { prompt: e.target.value }, `reflect-prompt-${block.id}`)}
        className={`${ghost} sc-reflect-prompt`}
      />
      <textarea className="sc-reflect-input" disabled placeholder={t('answerPlaceholder')} aria-hidden tabIndex={-1} />
      <div className="sc-reflect-sample">
        <p className="sc-reflect-sample-label">{t('sampleLabel')}</p>
        <AutoTextarea
          value={sample}
          placeholder={t('samplePlaceholder')}
          aria-label={t('sampleLabel')}
          onChange={(e) => update(lessonId, block.id, { sample: e.target.value }, `reflect-sample-${block.id}`)}
          className={`${ghost} sc-reflect-sample-text`}
        />
      </div>
    </div>
  )
}
