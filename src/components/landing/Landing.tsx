import { useState, type ReactNode } from 'react'
import Logo from '../layout/Logo'
import LanguagePicker from '../editor/LanguagePicker'
import { useT } from '../../i18n/I18nProvider'
import { useReveal } from '../../hooks/useReveal'
import { navigate } from '../../hooks/useRoute'
import { GITHUB_URL, GITHUB_ISSUES_URL } from '../../lib/links'
import { RELEASES } from '../../help/releaseNotes'
import ChatDemo from './demos/ChatDemo'
import Playground from './demos/Playground'

function Reveal({
  children,
  delay,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      className={`${visible ? 'reveal-visible' : 'reveal'}${className ? ` ${className}` : ''}`}
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
  sparkles: (
    <>
      <path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z" />
      <path d="M18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9L18 14z" />
    </>
  ),
  heart: (
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
  ),
  undo: (
    <>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </>
  ),
  keyboard: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M18 13h.01M10 13h4M7 16h10" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </>
  ),
  download: (
    <>
      <rect x="3" y="3" width="18" height="14" rx="2" />
      <path d="M12 7v6M9 10l3 3 3-3M8 21h8M12 17v4" />
    </>
  ),
  file: (
    <>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v5h6M8 13h8M8 17h5" />
    </>
  ),
  plug: (
    <>
      <path d="M12 22v-5" />
      <path d="M9 8V2M15 8V2" />
      <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
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
  const { t, lang } = useT('landing')

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-white text-gray-900">
      <Nav />
      <main>
        <Hero />
        <Pillars />
        <Demo />
        <Features />
        <AiReady />
        <Privacy />
        <HowItWorks />
        <WhatsNew />
        <Faq />
        <Contribute />
      </main>
      <Footer />
    </div>
  )

  function Nav() {
    return (
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#/" aria-label="Scormly">
            <Logo />
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 lg:flex">
            <a href="#demo" className="hover:text-brand">
              {t('navDemo')}
            </a>
            <a href="#features" className="hover:text-brand">
              {t('navFeatures')}
            </a>
            <a href="#ai" className="hover:text-brand">
              {t('navAi')}
            </a>
            <a href="#how" className="hover:text-brand">
              {t('navHow')}
            </a>
            <a href="#whats-new" className="hover:text-brand">
              {t('navNews')}
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
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:py-28">
          <div className="text-center lg:text-left">
            <span className="reveal-visible inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand-dark">
              <span className="chatd-dot" /> {t('heroBadge')}
            </span>
            <h1 className="reveal-visible mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              {t('heroTitle')}
            </h1>
            <p className="reveal-visible mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-600 lg:mx-0">
              {t('heroSubtitle')}
            </p>
            <div className="reveal-visible mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
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
            <p className="reveal-visible mt-5 text-sm text-gray-400">{t('heroNote')}</p>
          </div>

          {/* Live, self-playing dialogue trainer — a real product block. */}
          <div className="reveal-visible animate-float">
            <ChatDemo />
          </div>
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
      <section className="border-y border-gray-100 bg-gradient-to-b from-gray-50/80 to-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {t('pillarsTitle')}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-gray-200/70 ring-1 ring-gray-200/70 md:grid-cols-3">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 110}>
                <div className="group relative h-full overflow-hidden bg-white p-8 transition-colors hover:bg-brand/[0.03]">
                  <span className="block font-mono text-sm font-semibold text-brand/70">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="mt-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-lg shadow-brand/25 transition-transform group-hover:-rotate-6">
                    <Icon name={p.icon} className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
                  <p className="mt-2 leading-relaxed text-gray-600">{p.text}</p>
                  <span className="mt-6 block h-1 w-10 rounded-full bg-brand/20 transition-all duration-300 group-hover:w-20 group-hover:bg-brand" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Interactive "play with the real blocks" section.
  function Demo() {
    const { t: td } = useT('demo')
    return (
      <section
        id="demo"
        className="relative scroll-mt-20 overflow-hidden py-24"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-[-10%] top-10 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
          <div className="absolute bottom-0 right-[-5%] h-72 w-72 rounded-full bg-brand/5 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand-dark">
                <span className="chatd-dot" /> {td('badge')}
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                {td('title')}
              </h2>
              <p className="mt-4 text-lg text-gray-600">{td('subtitle')}</p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-12">
              <Playground />
            </div>
          </Reveal>
        </div>
      </section>
    )
  }

  function Privacy() {
    return (
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gray-900 px-5 py-14 text-center sm:px-16">
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
    // Order tuned for the bento layout: the two "anchor" tiles (index 0 and 3)
    // span two columns, so [2,1,1,2,1,1,1,1,1,1] tiles cleanly into a 3-col
    // grid (and into a 2-col grid on tablets).
    const features = [
      { icon: 'blocks', title: t('f1Title'), text: t('f1Text'), anchor: true },
      { icon: 'quiz', title: t('f2Title'), text: t('f2Text') },
      { icon: 'undo', title: t('f3Title'), text: t('f3Text') },
      { icon: 'package', title: t('f4Title'), text: t('f4Text'), anchor: true },
      { icon: 'route', title: t('f5Title'), text: t('f5Text') },
      { icon: 'keyboard', title: t('f6Title'), text: t('f6Text') },
      { icon: 'help', title: t('f7Title'), text: t('f7Text') },
      { icon: 'theme', title: t('f8Title'), text: t('f8Text') },
      { icon: 'download', title: t('f9Title'), text: t('f9Text') },
      { icon: 'globe', title: t('f10Title'), text: t('f10Text') },
    ]
    return (
      <section
        id="features"
        className="relative scroll-mt-20 overflow-hidden border-t border-gray-100 bg-gray-50/60 py-24"
      >
        <div className="pointer-events-none absolute left-1/2 top-0 -z-0 h-80 w-80 -translate-x-1/2 rounded-full bg-brand/5 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {t('featuresTitle')}
              </h2>
              <p className="mt-4 text-lg text-gray-600">{t('featuresSubtitle')}</p>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-4 sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 90} className={f.anchor ? 'sm:col-span-2' : undefined}>
                {f.anchor ? (
                  <div className="group relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-8 text-white shadow-lg shadow-brand/25">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur transition-transform group-hover:scale-105">
                      <Icon name={f.icon} className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-bold">{f.title}</h3>
                    <p className="mt-2 max-w-md leading-relaxed text-white/80">{f.text}</p>
                  </div>
                ) : (
                  <div className="group h-full rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/15 to-brand/5 text-brand ring-1 ring-brand/15 transition-transform group-hover:scale-105">
                      <Icon name={f.icon} className="h-[22px] w-[22px]" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2 leading-relaxed text-gray-600">{f.text}</p>
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // AI-ready: AGENTS.md in every project lets assistants author courses.
  function AiReady() {
    const points = [
      { icon: 'file', title: t('aiPoint1Title'), text: t('aiPoint1Text') },
      { icon: 'plug', title: t('aiPoint2Title'), text: t('aiPoint2Text') },
      { icon: 'shield', title: t('aiPoint3Title'), text: t('aiPoint3Text') },
    ]
    const steps = [t('aiStep1'), t('aiStep2'), t('aiStep3'), t('aiStep4'), t('aiStep5')]
    return (
      <section id="ai" className="relative scroll-mt-20 overflow-hidden py-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute right-[-10%] top-10 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
          <div className="absolute bottom-0 left-[-5%] h-72 w-72 rounded-full bg-brand/5 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-12">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand-dark">
              <Icon name="sparkles" className="h-4 w-4" /> {t('aiBadge')}
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">{t('aiTitle')}</h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">{t('aiSubtitle')}</p>
            <ul className="mt-8 space-y-5">
              {points.map((p) => (
                <li key={p.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/15 to-brand/5 text-brand ring-1 ring-brand/15">
                    <Icon name={p.icon} className="h-[22px] w-[22px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{p.title}</span>
                    <span className="mt-1 block leading-relaxed text-gray-600">{p.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Illustrative visual: an assistant started in the project folder,
              then working through the course. Static on purpose. */}
          <Reveal delay={120}>
            <div role="img" aria-label={t('aiVisualLabel')} className="relative mx-auto w-full max-w-lg">
              <div className="overflow-hidden rounded-2xl bg-gray-900 shadow-2xl shadow-gray-900/25 ring-1 ring-white/10">
                <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="ml-2 font-mono text-xs text-white/45">~/my-course</span>
                </div>
                <div className="space-y-1.5 break-words p-4 pb-8 font-mono text-[12.5px] leading-relaxed text-gray-200 sm:p-5 sm:pb-10 sm:text-[13px]">
                  <p>
                    <span className="text-brand-light">$</span> ls
                  </p>
                  <p className="flex flex-wrap gap-x-5 text-gray-400">
                    <span className="font-semibold text-brand-light">AGENTS.md</span>
                    <span>assets/</span>
                    <span>project.json</span>
                  </p>
                  <p className="pt-2 text-white/40">{t('aiTermComment')}</p>
                  <p>
                    <span className="text-brand-light">$</span> claude{' '}
                    <span className="whitespace-nowrap">
                      "{t('aiTermPrompt')}"<span className="ai-caret" />
                    </span>
                  </p>
                </div>
              </div>

              <div className="relative -mt-4 ml-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl shadow-gray-900/10 sm:-mt-6 sm:ml-12 sm:p-5">
                <p className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-brand px-3.5 py-2 text-sm leading-snug text-white">
                  {t('aiChatPrompt')}
                </p>
                <ul className="mt-4 space-y-2">
                  {steps.map((s) => (
                    <li key={s} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                        <Icon name="check" className="h-3 w-3" />
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    )
  }

  // Compact changelog: the newest builder releases from the in-app notes.
  function WhatsNew() {
    const releases = RELEASES.slice(0, 2)
    const fmt = new Intl.DateTimeFormat(lang, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    })
    return (
      <section id="whats-new" className="scroll-mt-20 border-t border-gray-100 py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand-dark">
                <span className="chatd-dot" /> {t('newsBadge')}
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">{t('newsTitle')}</h2>
              <p className="mt-4 text-lg text-gray-600">{t('newsSubtitle')}</p>
            </div>
          </Reveal>
          <div className="relative mt-12">
            <div className="pointer-events-none absolute bottom-4 left-[11.25rem] top-4 hidden border-l-2 border-dashed border-brand/20 md:block" />
            <ol className="space-y-8">
              {releases.map((r, i) => (
                <li key={r.id}>
                  <Reveal delay={i * 110}>
                    <div className="grid gap-3 md:grid-cols-[10rem_1fr] md:gap-10">
                      <div className="flex items-center gap-3 md:flex-col md:items-end md:pt-6 md:text-right">
                        <time dateTime={r.date} className="font-semibold text-gray-900">
                          {fmt.format(new Date(r.date))}
                        </time>
                        {i === 0 && (
                          <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-white">
                            {t('newsLatest')}
                          </span>
                        )}
                      </div>
                      <div className="relative rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <span className="absolute -left-[1.625rem] top-7 hidden h-3 w-3 rounded-full bg-brand ring-4 ring-white md:block" />
                        <ul className="space-y-2.5">
                          {r.items[lang].map((item) => (
                            <li key={item} className="flex gap-3 leading-relaxed text-gray-700">
                              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                              <span className="min-w-0">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
          <Reveal>
            <div className="mt-10 text-center">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-semibold text-brand-dark hover:text-brand"
              >
                {t('newsMore')} <Icon name="arrow" className="h-4 w-4" />
              </a>
            </div>
          </Reveal>
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
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
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
      { q: t('faqQ7'), a: t('faqA7') },
      { q: t('faqQ8'), a: t('faqA8') },
      { q: t('faqQ9'), a: t('faqA9') },
      { q: t('faqQ10'), a: t('faqA10') },
      { q: t('faqQ11'), a: t('faqA11') },
    ]
    return (
      <section id="faq" className="scroll-mt-20 border-t border-gray-100 bg-gray-50/60 py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
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

  function Contribute() {
    return (
      <section className="px-4 pb-24 pt-4 sm:px-6">
        <Reveal>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-dark px-5 py-14 text-center text-white sm:px-16">
            <DotGrid id="contribute-dots" className="absolute inset-0 text-white/[0.08]" />
            <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-black/10 blur-3xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium ring-1 ring-white/25">
                <Icon name="heart" className="h-4 w-4" /> {t('contributeBadge')}
              </span>
              <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                {t('contributeTitle')}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/85">
                {t('contributeText')}
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-base font-semibold text-brand-dark shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  <Icon name="code" className="h-5 w-5" /> {t('contributeCta')}
                </a>
                <a
                  href={GITHUB_ISSUES_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-7 py-3 text-base font-semibold text-white ring-1 ring-white/40 transition-colors hover:bg-white/10"
                >
                  {t('contributeIssues')}
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    )
  }

  function Footer() {
    return (
      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:px-6 text-center">
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
