import type { BlockComponentProps } from '../types'
import type { BlockOfType, GuideStep, StepsLayout } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { translate, useT } from '../../i18n/I18nProvider'
import { uid } from '../../lib/id'
import RichTextEditor from '../../components/editor/RichTextEditor'
import { IMAGE_ACCEPT, Segmented, SettingsBar, UploadButton, useAssetUpload } from '../../components/editor/controls'
import StepsPreview, { StepImage } from '../../preview/components/StepsPreview'
import ItemRow, { moved } from './ItemRow'

const LAYOUTS: StepsLayout[] = ['list', 'slides']

// Step-by-step guide: numbered steps with rich text and an optional picture.
export default function StepsBlock({
  block,
  lessonId,
  selected,
}: BlockComponentProps<BlockOfType<'steps'>>) {
  const update = useCourseStore((s) => s.updateBlockData)
  const { t } = useT('explainers')
  const { t: tt } = useT('text')
  const { layout, steps } = block.data

  if (!selected) {
    return steps.length ? <StepsPreview block={block} /> : <p className="text-sm text-gray-400">{t('noSteps')}</p>
  }

  const setSteps = (next: GuideStep[], key?: string) => update(lessonId, block.id, { steps: next }, key)
  const patch = (id: string, p: Partial<GuideStep>, key?: string) =>
    setSteps(steps.map((s) => (s.id === id ? { ...s, ...p } : s)), key)

  function addStep() {
    const n = steps.length + 1
    setSteps([...steps, { id: uid('step'), title: translate('content', 'stepsTitle', { n }), html: '' }])
  }

  return (
    <div className="space-y-4">
      <SettingsBar>
        <Segmented<StepsLayout>
          label={t('layout')}
          value={layout}
          onChange={(v) => update(lessonId, block.id, { layout: v })}
          options={LAYOUTS.map((l) => [l, t(`layout_${l}`)] as const)}
        />
      </SettingsBar>

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
              onChange={(e) => patch(s.id, { title: e.target.value }, `steps-title-${s.id}`)}
              className="w-full rounded border border-gray-200 px-3 py-2 font-semibold text-gray-900 outline-none placeholder-gray-300 focus:border-brand"
            />
            <div className="rounded border border-gray-200 px-3 py-2 focus-within:border-brand">
              <RichTextEditor
                html={s.html}
                placeholder={tt('paragraphPlaceholder')}
                onChange={(html) => patch(s.id, { html }, `steps-html-${s.id}`)}
              />
            </div>
            <StepPicture step={s} onChange={(p) => patch(s.id, p)} onAlt={(alt) => patch(s.id, { alt }, `steps-alt-${s.id}`)} />
          </ItemRow>
        ))}
      </ol>

      <button type="button" onClick={addStep} className="btn-secondary text-sm">
        {t('addStep')}
      </button>
    </div>
  )
}

// A step's optional picture: add / replace / remove, plus its alt text.
function StepPicture({
  step,
  onChange,
  onAlt,
}: {
  step: GuideStep
  onChange: (p: Partial<GuideStep>) => void
  onAlt: (alt: string) => void
}) {
  const { t } = useT('explainers')
  const upload = useAssetUpload('image', (path) => onChange({ src: path }))
  return (
    <div className="space-y-2">
      {step.src && (
        <div className="max-w-xs">
          <StepImage src={step.src} alt={step.alt} />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <UploadButton
          variant="subtle"
          label={step.src ? t('replaceImage') : t('addImage')}
          accept={IMAGE_ACCEPT}
          onPick={upload.onPick}
        />
        {step.src && (
          <>
            <button
              type="button"
              onClick={() => onChange({ src: undefined, alt: undefined })}
              className="rounded-md px-2.5 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              {t('removeImage')}
            </button>
            <input
              type="text"
              value={step.alt ?? ''}
              placeholder={t('altPlaceholder')}
              aria-label={t('altPlaceholder')}
              onChange={(e) => onAlt(e.target.value)}
              className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-brand"
            />
          </>
        )}
      </div>
      {upload.error && <p className="text-sm text-red-600">{t('unsupportedImage')}</p>}
    </div>
  )
}
