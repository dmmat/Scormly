import { useEffect, type ChangeEvent } from 'react'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import { THEME_LIST } from '../../theme/themes'
import { saveAsset } from '../../lib/assets'
import { useAssetUrl } from '../../hooks/useAssetUrl'

const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml'

// Lightweight project settings modal: course title, description, cover, theme.
export default function ProjectSettings({ onClose }: { onClose: () => void }) {
  const course = useCourseStore((s) => s.course)
  const updateCourseMeta = useCourseStore((s) => s.updateCourseMeta)
  const setTheme = useCourseStore((s) => s.setTheme)
  const { t } = useT('settings')
  const coverUrl = useAssetUrl(course.coverImage ?? '')

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function pickCover(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const src = await saveAsset(file, 'image')
      updateCourseMeta({ coverImage: src })
    } catch {
      // ignore unsupported format
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{t('title')}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          <Field label={t('courseTitle')}>
            <input
              type="text"
              value={course.title}
              placeholder={t('titlePlaceholder')}
              onChange={(e) => updateCourseMeta({ title: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </Field>

          <Field label={t('description')}>
            <textarea
              rows={3}
              value={course.description}
              placeholder={t('descriptionPlaceholder')}
              onChange={(e) => updateCourseMeta({ description: e.target.value })}
              className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </Field>

          <Field label={t('cover')}>
            {course.coverImage ? (
              <div className="space-y-2">
                <img
                  src={coverUrl}
                  alt=""
                  className="aspect-video w-full rounded-lg border border-gray-200 object-cover"
                />
                <div className="flex gap-2">
                  <label className="btn-secondary cursor-pointer text-sm">
                    {t('replaceCover')}
                    <input type="file" accept={IMAGE_ACCEPT} onChange={pickCover} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={() => updateCourseMeta({ coverImage: undefined })}
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600"
                  >
                    {t('removeCover')}
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-sm font-medium text-gray-400 transition hover:border-brand hover:text-brand">
                + {t('addCover')}
                <input type="file" accept={IMAGE_ACCEPT} onChange={pickCover} className="hidden" />
              </label>
            )}
          </Field>

          <Field label={t('theme')}>
            <div className="flex flex-wrap gap-2">
              {THEME_LIST.map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setTheme(th.id)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                    course.theme === th.id
                      ? 'border-brand bg-brand/5 font-medium text-gray-900'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: th.accent }}
                  />
                  {th.label}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </span>
      {children}
    </label>
  )
}
