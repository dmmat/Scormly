import type { ReactNode } from 'react'
import type { Course } from '../types/course'
import { DEFAULT_INTRO } from '../types/course'
import { useAssetUrl } from '../hooks/useAssetUrl'
import { useT } from '../i18n/I18nProvider'
import GroupedLessons from './GroupedLessons'
import { coverNumber } from '../lib/units'

// Learner-facing course cover page (Course.intro). Mirrors renderIntro() in the
// SCORM player; the editor's IntroEditor uses the same sc-intro-* markup.
// `children` renders the intro's blocks under the title section.
export default function IntroView({
  course,
  onStart,
  onOpenLesson,
  headingRef,
  children,
}: {
  course: Course
  onStart: () => void
  onOpenLesson: (index: number) => void
  headingRef?: React.Ref<HTMLHeadingElement>
  children?: ReactNode
}) {
  const { t } = useT('design')
  const intro = { ...DEFAULT_INTRO, ...course.intro }
  const image = intro.layout === 'minimal' ? '' : course.coverImage ?? ''
  const url = useAssetUrl(image)
  const lessons = course.lessons

  return (
    <div className="sc-intro-wrap">
      <section className={`sc-intro sc-intro-${intro.layout}${image ? '' : ' no-image'}`}>
        {image && (
          <div className="sc-intro-media">
            <img src={url || undefined} alt="" />
          </div>
        )}
        <div className="sc-intro-content">
          {intro.eyebrow && <p className="sc-intro-eyebrow">{intro.eyebrow}</p>}
          <h1 ref={headingRef} tabIndex={-1} className="sc-intro-title outline-none">
            {course.title}
          </h1>
          {course.description && <p className="sc-intro-text">{course.description}</p>}
          <div className="sc-intro-actions">
            <button type="button" className="btn-primary sc-intro-start" onClick={onStart}>
              {intro.buttonLabel?.trim() || t('startCourse')}
              <span aria-hidden> →</span>
            </button>
            <span className="sc-intro-meta">{t('lessonsCount', { n: lessons.length })}</span>
          </div>
        </div>
      </section>
      {children && <div className="sc-intro-blocks space-y-7">{children}</div>}
      {intro.showOutline !== false && lessons.length > 0 && (
        <nav className="sc-intro-outline" aria-label={t('lessons')}>
          <GroupedLessons course={course}>
            {({ lesson: l, index: i }) => (
              <li key={l.id}>
                <button type="button" onClick={() => onOpenLesson(i)}>
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
  )
}
