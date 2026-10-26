import type { BlockComponentProps } from '../types'
import type { BlockOfType, ProcessLayout, ProcessStep, ProcessVariant } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { translate, useT } from '../../i18n/I18nProvider'
import { uid } from '../../lib/id'
import { Segmented, SettingsBar } from '../../components/editor/controls'
import RichTextEditor from '../../components/editor/RichTextEditor'
import ProcessPreview from '../../preview/components/ProcessPreview'
import { PROCESS_VARIANTS, processVariant, stepHtml } from '../process'
import ItemRow, { moved } from './ItemRow'

const LAYOUTS: ProcessLayout[] = ['flow', 'chevrons', 'cycle', 'pyramid']
const MAX_STEPS = 8

// The plain version of a description, kept in `text` for search and agents.
function plainText(html: string): string {
  const el = document.createElement('div')
  el.innerHTML = html
  return el.textContent ?? ''
}

// Process diagram: the live diagram, then the steps as editable rows.
export default function ProcessBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'process'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('explainers')
  const { layout, variant, steps } = block.data

  const diagram = steps.length ? (
    <ProcessPreview block={block} />
  ) : (
    <p className="text-sm text-gray-400">{t('noSteps')}</p>
  )
  if (!selected) return diagram

  const setSteps = (next: ProcessStep[], key?: string) => update(lessonId, block.id, { steps: next }, key)
  const patch = (id: string, p: Partial<ProcessStep>, key: string) =>
    setSteps(steps.map((s) => (s.id === id ? { ...s, ...p } : s)), key)

  function addStep() {
    const n = steps.length + 1
    setSteps([...steps, { id: uid('step'), title: translate('content', 'processStepTitle', { n }), text: '' }])
  }

  const hint = layout === 'cycle' ? t('processCycleHint') : layout === 'pyramid' ? t('processPyramidHint') : ''
  const inputCls =
    'w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none placeholder-gray-300 focus:border-brand'

  return (
    <div className="space-y-4">
      <SettingsBar>
        <Segmented<ProcessLayout>
          label={t('layout')}
          value={layout}
          onChange={(v) => update(lessonId, block.id, { layout: v })}
          options={LAYOUTS.map((l) => [l, t(`layout_${l}`)] as const)}
        />
        <Segmented<ProcessVariant>
          label={t('style')}
          value={processVariant(layout, variant)}
          onChange={(v) => update(lessonId, block.id, { variant: v })}
          options={PROCESS_VARIANTS[layout].map((v) => [v, t(`variant_${v}`)] as const)}
        />
        {hint && <span className="text-xs text-gray-500">{hint}</span>}
      </SettingsBar>

      {diagram}

      <ol className="space-y-2">
        {steps.map((s, i) => (
          <ItemRow
            key={s.id}
            index={i}
            count={steps.length}
            onMove={(dir) => setSteps(moved(steps, i, dir))}
            onRemove={() => setSteps(steps.filter((x) => x.id !== s.id))}
          >
            <input
              type="text"
              value={s.title}
              placeholder={t('stepTitle')}
              aria-label={t('stepTitle')}
              onChange={(e) => patch(s.id, { title: e.target.value }, `process-title-${s.id}`)}
              className={`${inputCls} font-semibold`}
            />
            <div className="rounded border border-gray-200 px-3 py-2 text-sm focus-within:border-brand">
              <RichTextEditor
                inline
                html={stepHtml(s)}
                placeholder={t('stepText')}
                onChange={(html) => patch(s.id, { html, text: plainText(html) }, `process-text-${s.id}`)}
              />
            </div>
          </ItemRow>
        ))}
      </ol>

      <button type="button" onClick={addStep} disabled={steps.length >= MAX_STEPS} className="btn-secondary text-sm">
        {t('addStep')}
      </button>
    </div>
  )
}
