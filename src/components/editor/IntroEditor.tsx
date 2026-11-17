import type { ReactNode } from 'react'
import type { CourseIntro } from '../../types/course'
import { DEFAULT_INTRO } from '../../types/course'
import { useCourseStore } from '../../store/courseStore'
import { useT } from '../../i18n/I18nProvider'
import { useAssetUrl } from '../../hooks/useAssetUrl'
import {
  AutoTextarea,
  IMAGE_ACCEPT,
  Segmented,
  SettingsBar,
  UploadButton,
  useAssetUpload,
} from './controls'
import GroupedLessons from '../../preview/GroupedLessons'
import { coverNumber } from '../../lib/units'

type Layout = CourseIntro['layout']

// WYSIWYG editor for the course cover page. Title, description and image are
// the course's own fields (shared with Project settings); the intro adds the
// layout, a small label, the button text and the lesson list toggle.
// `children` is the editable block list shown under the title section.
export default function IntroEditor({ children }: { children?: ReactNode }) {
  const course = useCourseStore((s) => s.course)
  const updateIntro = useCourseStore((s) => s.updateIntro)
  const updateCourseMeta = useCourseStore((s) => s.updateCourseMeta)
  const setActiveLesson = useCourseStore((s) => s.setActiveLesson)
  const { t } = useT('design')
  const intro = { ...DEFAULT_INTRO, ...course.intro, enabled: course.intro?.enabled ?? false }
  const image = intro.layout === 'minimal' ? '' : course.coverImage ?? ''
  const url = useAssetUrl(image)
  const upload = useAssetUpload('image', (path) => updateCourseMeta({ coverImage: path }))

  return (
    <div className="space-y-5">
      <SettingsBar>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-800">
          <input
            type="checkbox"
            role="switch"
            checked={intro.enabled}
            onChange={(e) => updateIntro({ enabled: e.target.checked })}
            className="h-4 w-4 accent-brand"
          />
          {t('introEnabled')}
        </label>
        <Segmented<Layout>
          label={t('introLayout')}
          value={intro.layout}
          onChange={(layout) => updateIntro({ layout })}
          options={[
            ['cover', t('introLayout_cover')],
            ['split', t('introLayout_split')],
            ['minimal', t('introLayout_minimal')],
          ]}
        />
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={intro.showOutline !== false}
            onChange={(e) => updateIntro({ showOutline: e.target.checked })}
            className="h-4 w-4 accent-brand"
          />
          {t('showOutline')}
        </label>
        {intro.layout !== 'minimal' && (
          <span className="flex items-center gap-1">
            <UploadButton
              variant="subtle"
              label={course.coverImage ? t('replaceCover') : t('uploadCover')}
              accept={IMAGE_ACCEPT}
              onPick={upload.onPick}
            />
            {course.coverImage && (
              <button
                type="button"
                onClick={() => updateCourseMeta({ coverImage: undefined })}
                className="rounded-md px-2.5 py-1 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600"
              >
                {t('removeImage')}
              </button>
            )}
          </span>
        )}
        {upload.error && <span className="text-sm text-red-600">{t('unsupportedImage')}</span>}
      </SettingsBar>

      {!intro.enabled && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{t('introOff')}</p>
      )}

      <div className={`sc-intro-wrap transition-opacity ${intro.enabled ? '' : 'opacity-50'}`}>
        {/* mx-4 lines the cover up with block content (BlockShell's px-4 gutter). */}
        <section className={`sc-intro sc-intro-${intro.layout}${image ? '' : ' no-image'} mx-4`}>
          {image && (
            <div className="sc-intro-media">
              <img src={url || undefined} alt="" />
            </div>
          )}
          <div className="sc-intro-content">
            <input
              type="text"
              value={intro.eyebrow ?? ''}
              placeholder={t('eyebrowPlaceholder')}
              onChange={(e) => updateIntro({ eyebrow: e.target.value }, 'intro-eyebrow')}
              className="sc-intro-eyebrow w-full bg-transparent outline-none placeholder:text-current placeholder:opacity-50"
            />
            <h1 className="sc-intro-title">
              <AutoTextarea
                value={course.title}
                aria-label={t('introTitle')}
                placeholder={t('introTitle')}
                onChange={(e) => updateCourseMeta({ title: e.target.value.replace(/\n/g, ' ') })}
                className="w-full bg-transparent outline-none placeholder:text-current placeholder:opacity-40"
                style={{ textAlign: 'inherit' }}
              />
            </h1>
            <AutoTextarea
              value={course.description}
              aria-label={t('introText')}
              placeholder={t('introText')}
              onChange={(e) => updateCourseMeta({ description: e.target.value })}
              className="sc-intro-text w-full bg-transparent outline-none placeholder:text-current placeholder:opacity-50"
              style={{ textAlign: 'inherit' }}
            />
            <div className="sc-intro-actions">
              <span className="btn-primary sc-intro-start inline-flex items-center">
                <input
                  type="text"
                  value={intro.buttonLabel ?? ''}
                  placeholder={t('startCourse')}
                  aria-label={t('buttonLabel')}
                  onChange={(e) => updateIntro({ buttonLabel: e.target.value }, 'intro-button')}
                  size={Math.max(8, (intro.buttonLabel || t('startCourse')).length)}
                  className="bg-transparent text-inherit outline-none placeholder:text-current"
                />
                <span aria-hidden>→</span>
              </span>
              <span className="sc-intro-meta">{t('lessonsCount', { n: course.lessons.length })}</span>
            </div>
          </div>
        </section>
        <div className="sc-intro-blocks">{children}</div>
        {intro.showOutline !== false && course.lessons.length > 0 && (
          <nav className="sc-intro-outline mx-4" aria-label={t('lessons')}>
            <GroupedLessons course={course}>
              {({ lesson: l, index: i }) => (
                <li key={l.id}>
                  <button type="button" onClick={() => setActiveLesson(l.id)}>
                    <span className="sc-intro-num">{coverNumber(course, i)}</span>
                    <span className="sc-intro-ltitle">{l.title}</span>
                    <span className="sc-intro-arrow" aria-hidden>→</span>
                  </button>
                </li>
              )}
            </GroupedLessons>
          </nav>
        )}
      </div>
    </div>
  )
}
