import { useState, type ReactNode } from 'react'
import Logo from '../layout/Logo'
import LanguagePicker from '../editor/LanguagePicker'
import { useT } from '../../i18n/I18nProvider'
import { useReveal } from '../../hooks/useReveal'
import { navigate } from '../../hooks/useRoute'
import { GITHUB_URL, GITHUB_ISSUES_URL } from '../../lib/links'

function Reveal({ children, delay }: { children: ReactNode; delay?: number }) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      className={visible ? 'reveal-visible' : 'reveal'}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

// Inline stroke icons (no emoji). 24×24 viewBox, inherit color via currentColor.
const ICON_PATHS: Record<string, ReactNode> = {
  code: (
    <>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  blocks: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </>
  ),
  quiz: (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </>
  ),
  theme: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6a6 6 0 0 1 0 12z" fill="currentColor" stroke="none" />
    </>
  ),
  package: (
    <>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="M3.3 7 12 12l8.7-5" />
      <path d="M12 22V12" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a14.5 14.5 0 0 1 0 20 14.5 14.5 0 0 1 0-20" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
}

function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {ICON_PATHS[name]}
    </svg>
  )
}

// Faint dot-grid background; fades out via a radial mask. Unique id per use.
function DotGrid({ id, className }: { id: string; className?: string }) {
  return (
    <svg className={className} aria-hidden width="100%" height="100%">
      <defs>
        <pattern id={id} width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="1.2" cy="1.2" r="1.2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

export default function Landing() {
  const { t } = useT('landing')

  return (
    <div className="h-full overflow-y-auto bg-white text-gray-900">
      <Nav />
      <main>
        <Hero />
        <Pillars />
        <Privacy />
        <Features />
        <HowItWorks />
        <Faq />
      </main>
      <Footer />
    </div>
  )

  function Nav() {
    return (
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="#/" aria-label="Scormly">
            <Logo />
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
            <a href="#features" className="hover:text-brand">
              {t('navFeatures')}
            </a>
            <a href="#how" className="hover:text-brand">
              {t('navHow')}
            </a>
            <a href="#faq" className="hover:text-brand">
              {t('navFaq')}
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-brand"
            >
              {t('navGithub')}
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <LanguagePicker />
            <button
              type="button"
              onClick={() => navigate('app')}
              className="btn-primary text-sm"
            >
              {t('openApp')}
            </button>
          </div>
        </div>
      </header>
    )
  }

  function Hero() {
    return (
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <DotGrid
            id="hero-dots"
            className="absolute inset-0 text-brand/[0.12] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_30%,black,transparent)]"
          />
          <div className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
          <div className="absolute right-[-10%] top-40 h-72 w-72 rounded-full bg-brand/5 blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-24 md:py-32">
          <span className="reveal-visible inline-flex items-center rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand-dark">
            {t('heroBadge')}
          </span>
          <h1 className="reveal-visible mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            {t('heroTitle')}
          </h1>
          <p className="reveal-visible mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
            {t('heroSubtitle')}
          </p>
          <div className="reveal-visible mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate('app')}
              className="btn-primary px-7 py-3 text-base"
            >
              {t('heroCtaPrimary')}
            </button>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary px-7 py-3 text-base"
            >
              {t('heroCtaSecondary')}
            </a>
          </div>
          <p className="reveal-visible mt-5 text-sm text-gray-400">
            {t('heroNote')}
          </p>
        </div>
      </section>
    )
  }

  function Pillars() {
    const pillars = [
      { icon: 'code', title: t('pillarOpenTitle'), text: t('pillarOpenText') },
      { icon: 'gift', title: t('pillarFreeTitle'), text: t('pillarFreeText') },
      { icon: 'shield', title: t('pillarLocalTitle'), text: t('pillarLocalText') },
    ]
    return (
      <section className="border-y border-gray-100 bg-gray-50/60 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="text-center text-3xl font-bold tracking-tight">
              {t('pillarsTitle')}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 100}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand/5 blur-2xl transition-colors group-hover:bg-brand/10" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand/15 to-brand/5 text-brand ring-1 ring-brand/15">
                    <Icon name={p.icon} className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
                  <p className="mt-2 leading-relaxed text-gray-600">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  function Privacy() {
    return (
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gray-900 px-8 py-14 text-center sm:px-16">
              <DotGrid id="privacy-dots" className="absolute inset-0 text-white/[0.06]" />
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
              <div className="relative">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/30">
                  <Icon name="lock" className="h-7 w-7" />
                </div>
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
                  {t('privacyTitle')}
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-300">
                  {t('privacyText')}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    )
  }

  function Features() {
    const features = [
      { icon: 'blocks', title: t('f1Title'), text: t('f1Text') },
      { icon: 'book', title: t('f2Title'), text: t('f2Text') },
      { icon: 'quiz', title: t('f3Title'), text: t('f3Text') },
      { icon: 'theme', title: t('f4Title'), text: t('f4Text') },
      { icon: 'package', title: t('f5Title'), text: t('f5Text') },
      { icon: 'globe', title: t('f6Title'), text: t('f6Text') },
    ]
    return (
      <section
        id="features"
        className="relative scroll-mt-20 overflow-hidden border-t border-gray-100 bg-gray-50/60 py-24"
      >
        <div className="pointer-events-none absolute left-1/2 top-0 -z-0 h-80 w-80 -translate-x-1/2 rounded-full bg-brand/5 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {t('featuresTitle')}
              </h2>
              <p className="mt-4 text-lg text-gray-600">{t('featuresSubtitle')}</p>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 100}>
                <div className="group h-full rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand/15 to-brand/5 text-brand ring-1 ring-brand/15 transition-transform group-hover:scale-105">
                    <Icon name={f.icon} className="h-[22px] w-[22px]" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 leading-relaxed text-gray-600">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  function HowItWorks() {
    const steps = [
      { n: 1, title: t('how1Title'), text: t('how1Text') },
      { n: 2, title: t('how2Title'), text: t('how2Text') },
      { n: 3, title: t('how3Title'), text: t('how3Text') },
    ]
    return (
      <section id="how" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              {t('howTitle')}
            </h2>
          </Reveal>
          <div className="relative mt-14 grid gap-8 md:grid-cols-3">
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-7 hidden border-t-2 border-dashed border-brand/25 md:block" />
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 120}>
                <div className="relative text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-xl font-bold text-white shadow-lg shadow-brand/30 ring-4 ring-white">
                    {s.n}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-gray-600">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="mt-14 text-center">
              <button
                type="button"
                onClick={() => navigate('app')}
                className="btn-primary px-7 py-3 text-base"
              >
                {t('heroCtaPrimary')}
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    )
  }

  function Faq() {
    const items = [
      { q: t('faqQ1'), a: t('faqA1') },
      { q: t('faqQ2'), a: t('faqA2') },
      { q: t('faqQ3'), a: t('faqA3') },
      { q: t('faqQ4'), a: t('faqA4') },
      { q: t('faqQ5'), a: t('faqA5') },
      { q: t('faqQ6'), a: t('faqA6') },
    ]
    return (
      <section id="faq" className="scroll-mt-20 border-t border-gray-100 bg-gray-50/60 py-24">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              {t('faqTitle')}
            </h2>
          </Reveal>
          <div className="mt-12 space-y-3">
            {items.map((item, i) => (
              <Reveal key={i} delay={(i % 3) * 80}>
                <FaqItem question={item.q} answer={item.a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  function Footer() {
    return (
      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center">
          <Logo />
          <p className="text-sm text-gray-500">{t('footerTagline')}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-brand"
            >
              {t('navGithub')}
            </a>
            <span aria-hidden>·</span>
            <a
              href={GITHUB_ISSUES_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-brand"
            >
              {t('footerIssues')}
            </a>
            <span aria-hidden>·</span>
            <span>{t('footerLicense')}</span>
          </div>
          <p className="text-xs text-gray-400">{t('footerMade')}</p>
        </div>
      </footer>
    )
  }
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-medium text-gray-900">{question}</span>
        <Icon
          name="chevron"
          className={`h-5 w-5 shrink-0 text-brand transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="border-t border-gray-100 px-5 py-4 leading-relaxed text-gray-600">
          {answer}
        </p>
      )}
    </div>
  )
}
