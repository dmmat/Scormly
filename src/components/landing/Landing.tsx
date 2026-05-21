import { useState, type ReactNode } from 'react'
import Logo from '../layout/Logo'
import LanguagePicker from '../editor/LanguagePicker'
import { useT } from '../../i18n/I18nProvider'
import { useReveal } from '../../hooks/useReveal'
import { navigate } from '../../hooks/useRoute'

// Update to the real repository when publishing.
const GITHUB_URL = 'https://github.com/dmmat/Scormly'

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
          <div className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
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
      { icon: '⌨', title: t('pillarOpenTitle'), text: t('pillarOpenText') },
      { icon: '🎁', title: t('pillarFreeTitle'), text: t('pillarFreeText') },
      { icon: '🔒', title: t('pillarLocalTitle'), text: t('pillarLocalText') },
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
                <div className="h-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-2xl">
                    <span aria-hidden>{p.icon}</span>
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
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand/30 blur-3xl" />
              <div className="relative">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-3xl">
                  <span aria-hidden>🔒</span>
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
      { icon: '🧱', title: t('f1Title'), text: t('f1Text') },
      { icon: '📚', title: t('f2Title'), text: t('f2Text') },
      { icon: '✔', title: t('f3Title'), text: t('f3Text') },
      { icon: '🎨', title: t('f4Title'), text: t('f4Text') },
      { icon: '📦', title: t('f5Title'), text: t('f5Text') },
      { icon: '🌐', title: t('f6Title'), text: t('f6Text') },
    ]
    return (
      <section id="features" className="scroll-mt-20 border-t border-gray-100 bg-gray-50/60 py-24">
        <div className="mx-auto max-w-6xl px-6">
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
                <div className="h-full rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-xl text-brand">
                    <span aria-hidden>{f.icon}</span>
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
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 120}>
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-xl font-bold text-white">
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
        <span
          aria-hidden
          className={`shrink-0 text-brand transition-transform ${open ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>
      {open && (
        <p className="border-t border-gray-100 px-5 py-4 leading-relaxed text-gray-600">
          {answer}
        </p>
      )}
    </div>
  )
}
