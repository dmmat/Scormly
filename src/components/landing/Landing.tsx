import { lazy, Suspense, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import Logo from '../layout/Logo'
import LanguagePicker from '../editor/LanguagePicker'
import { useLang, useT } from '../../i18n/I18nProvider'
import { LANGUAGES } from '../../i18n/types'
import { useReveal } from '../../hooks/useReveal'
import { navigate, useRoute } from '../../hooks/useRoute'
import { landingUrl, ROUTE_EVENT } from '../../lib/route'
import { CONTACT_EMAIL, GITHUB_URL, GITHUB_ISSUES_URL } from '../../lib/links'
import { RELEASES } from '../../help/releaseNotes'
import ChatDemo from './demos/ChatDemo'
import HowSteps from './demos/HowSteps'

// These demos render real learner blocks (the whole preview layer and the
// sample course), so they load when their section comes near the viewport.
const DesignShowcase = lazy(() => import('./demos/DesignShowcase'))

function Deferred({ minHeight, children }: { minHeight: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // The landing scrolls inside its own container, so that is the root the
    // margin has to grow.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShow(true)
          observer.disconnect()
        }
      },
      { root: el.closest('[data-landing-scroll]'), rootMargin: '600px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  // The reserved height keeps the page from jumping when the demo arrives.
  const placeholder = <div style={{ minHeight }} aria-hidden />
  return <div ref={ref}>{show ? <Suspense fallback={placeholder}>{children}</Suspense> : placeholder}</div>
}

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
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
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
  a11y: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="7" r="1" />
      <path d="M8 10h8M12 10v4M10 18l2-4 2 4" />
    </>
  ),
  captions: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M7 15h4M15 15h2M7 11h2M13 11h4" />
    </>
  ),
  speaker: (
    <>
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
    </>
  ),
  sliders: <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />,
  check: <path d="M20 6 9 17l-5-5" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  external: <path d="M7 17 17 7M8 7h9v9" />,
  play: <path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none" />,
  github: (
    <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
  ),
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

// A section heading. Every content section starts the same way: the title on
// the left and, on wide screens, its intro beside it on the right. (The two
// call-out cards, Privacy and Contribute, are centered on purpose.)
function SectionHead({ badge, title, subtitle }: { badge?: ReactNode; title: string; subtitle?: string }) {
  return (
    <Reveal>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <div>
          {badge && (
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand-dark">
              {badge}
            </span>
          )}
          <h2 className="max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{title}</h2>
        </div>
        {subtitle && <p className="max-w-md text-lg leading-relaxed text-gray-600">{subtitle}</p>}
      </div>
    </Reveal>
  )
}

interface NavLink {
  href: string
  label: string
  icon: string
  external?: boolean
}

// Scroll to a landing section in place and put it in the address bar without a
// `hashchange` (which would re-render the landing).
function scrollToSection(href: string): boolean {
  const target = document.getElementById(href.slice(1))
  if (!target) return false
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(null, '', href)
  return true
}

// The section nav, which lights up the section the reader is in (it stays on
// the last one passed, so it never goes blank between sections): labelled
// items in the top bar on wide screens, a floating dock at the bottom on
// narrow ones (its row scrolls sideways if it ever doesn't fit).
function Dock({
  links,
  label,
  placement,
  newTabLabel,
}: {
  links: NavLink[]
  label: string
  placement: 'top' | 'bottom'
  newTabLabel: string
}) {
  const [active, setActive] = useState<string | null>(null)
  const top = placement === 'top'
  // Bottom dock: slides away while reading down, comes back on the way up.
  const [hidden, setHidden] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const rowRef = useRef<HTMLUListElement>(null)
  // While a click scrolls the page, the highlight stays on the target instead
  // of running through every section on the way.
  const lockRef = useRef<string | null>(null)

  useEffect(() => {
    const root = navRef.current?.closest<HTMLElement>('[data-landing-scroll]')
    if (!root) return
    const hrefs = links.filter((l) => !l.external).map((l) => l.href)
    let frame = 0
    let lastY = root.scrollTop
    let down = 0
    let up = 0
    const update = () => {
      frame = 0
      const y = root.scrollTop
      if (!top && !lockRef.current) {
        if (y > lastY) {
          down += y - lastY
          up = 0
        } else {
          up += lastY - y
          down = 0
        }
        const atEnd = y + root.clientHeight >= root.scrollHeight - 80
        if (up > 20 || atEnd || y < 300) setHidden(false)
        else if (down > 60) setHidden(true)
      }
      lastY = y
      if (lockRef.current) return
      // The current section is the last one whose top has passed the middle band.
      const line = root.getBoundingClientRect().top + root.clientHeight * 0.45
      let current: string | null = null
      let currentTop = -Infinity
      for (const href of hrefs) {
        const sectionTop = document.getElementById(href.slice(1))?.getBoundingClientRect().top
        if (sectionTop !== undefined && sectionTop <= line && sectionTop > currentTop) {
          current = href
          currentTop = sectionTop
        }
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    root.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      root.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [links, top])

  // Bottom dock: keep the current section's item in view as the row scrolls.
  useEffect(() => {
    const row = rowRef.current
    const item = row?.querySelector<HTMLElement>('[aria-current="true"]')
    if (!row || !item || row.scrollWidth <= row.clientWidth) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    row.scrollTo({
      left: item.offsetLeft - (row.clientWidth - item.offsetWidth) / 2,
      behavior: reduce ? 'auto' : 'smooth',
    })
  }, [active])

  const goTo = (e: MouseEvent, href: string) => {
    if (!scrollToSection(href)) return
    e.preventDefault()
    const root = navRef.current?.closest<HTMLElement>('[data-landing-scroll]')
    lockRef.current = href
    setActive(href)
    let timer = 0
    const unlock = () => {
      lockRef.current = null
      window.clearTimeout(timer)
      root?.removeEventListener('scrollend', unlock)
    }
    root?.addEventListener('scrollend', unlock)
    // Fallback for browsers without `scrollend`.
    timer = window.setTimeout(unlock, 1500)
  }

  const linkProps = (l: NavLink) =>
    l.external
      ? { target: '_blank', rel: 'noreferrer' }
      : { onClick: (e: MouseEvent) => goTo(e, l.href) }
  // Marks a link that leaves the site in a new tab.
  const externalMark = (
    <>
      <Icon name="external" className="h-3 w-3 shrink-0 opacity-60" />
      <span className="sr-only">({newTabLabel})</span>
    </>
  )

  if (!top) {
    return (
      <nav
        ref={navRef}
        aria-label={label}
        className="landing-dock fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] z-30 flex justify-center px-2 sm:bottom-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] lg:hidden"
      >
        {/* The capsule clips the row; the row itself scrolls sideways. */}
        <div
          className={`max-w-full overflow-hidden rounded-full border border-white/60 bg-white/90 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.35)] ring-1 ring-gray-900/5 backdrop-blur-xl transition-[translate,opacity] duration-300 motion-reduce:transition-none ${
            hidden ? 'pointer-events-none translate-y-[150%] opacity-0' : ''
          }`}
        >
          <ul ref={rowRef} className="dock-row flex items-center gap-0.5 overflow-x-auto p-1">
            {links.map((l) => (
              <li key={l.href} className="shrink-0">
                <a
                  href={l.href}
                  aria-current={active === l.href ? 'true' : undefined}
                  {...linkProps(l)}
                  className={`flex h-12 flex-col items-center justify-center gap-0.5 whitespace-nowrap rounded-full px-3 text-[11px] font-medium leading-none transition-colors duration-200 ${
                    active === l.href
                      ? 'bg-brand text-white shadow-md shadow-brand/30'
                      : 'text-gray-600 hover:bg-gray-900/5 hover:text-brand-dark'
                  }`}
                >
                  <Icon name={l.icon} className="h-5 w-5 shrink-0" />
                  <span className="flex items-center gap-0.5">
                    {l.label}
                    {l.external && externalMark}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    )
  }

  return (
    <nav ref={navRef} aria-label={label} className="hidden min-w-0 flex-1 justify-center lg:flex">
      <ul className="flex items-center gap-1">
        {links.map((l) => (
          <li key={l.href} className={l.external ? 'flex items-center' : undefined}>
            {l.external && <span aria-hidden className="mx-2 h-5 w-px bg-gray-200" />}
            <a
              href={l.href}
              aria-current={active === l.href ? 'true' : undefined}
              {...linkProps(l)}
              className={`flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-sm font-medium transition-colors duration-200 ${
                active === l.href
                  ? 'bg-brand text-white shadow-md shadow-brand/30'
                  : 'text-gray-600 hover:bg-gray-900/5 hover:text-brand-dark'
              }`}
            >
              <Icon name={l.icon} className="h-[18px] w-[18px] shrink-0" />
              <span>{l.label}</span>
              {l.external && externalMark}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// A thin reading-progress line along the bottom edge of the top bar.
function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const bar = ref.current
    const root = bar?.closest<HTMLElement>('[data-landing-scroll]')
    if (!bar || !root) return
    let frame = 0
    const update = () => {
      frame = 0
      const max = root.scrollHeight - root.clientHeight
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, root.scrollTop / max) : 0})`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    root.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      root.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return (
    <div
      ref={ref}
      aria-hidden
      className="absolute inset-x-0 -bottom-px h-0.5 origin-left bg-brand"
      style={{ transform: 'scaleX(0)' }}
    />
  )
}

export default function Landing() {
  const { t, lang } = useT('landing')
  const { setLang } = useLang()
  const { lang: urlLang } = useRoute()

  // Each language has its own address ('/', '/uk', …) so it can be found and
  // shared; keep the address on the language being shown.
  useEffect(() => {
    const url = landingUrl(lang)
    if ((window.location.pathname.replace(/\/+$/, '') || '/') === url) return
    history.replaceState(null, '', url + window.location.hash)
    window.dispatchEvent(new Event(ROUTE_EVENT))
  }, [lang, urlLang])

  useEffect(() => {
    document.title = t('metaTitle')
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('metaDescription'))
  }, [t])

  // A link to a section (…#features) opens the landing at that section.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (id && !id.startsWith('/')) document.getElementById(id)?.scrollIntoView()
  }, [])

  return (
    <div data-landing-scroll className="h-full overflow-y-auto overflow-x-hidden bg-white text-gray-900">
      <Nav />
      <main>
        <Hero />
        <Pillars />
        <Audience />
        <Features />
        <HowItWorks />
        <Design />
        <AiReady />
        <Accessibility />
        <Privacy />
        <Faq />
        <WhatsNew />
        <About />
        <Contribute />
      </main>
      <Footer />
    </div>
  )

  function Nav() {
    const links: NavLink[] = [
      { href: '#features', label: t('navFeatures'), icon: 'blocks' },
      { href: '#how', label: t('navHow'), icon: 'route' },
      { href: '#ai', label: t('navAi'), icon: 'sparkles' },
      { href: '#faq', label: t('navFaq'), icon: 'help' },
    ]
    const dockLabels = { newTabLabel: t('navNewTab') }
    return (
      <>
        <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/80 backdrop-blur">
          {/* Logo | section nav (wide screens) | language + the builder. */}
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            {/* On the narrowest phones only the logo mark shows, so the bar fits. */}
            <a
              href={landingUrl(lang)}
              aria-label="Scormly"
              onClick={(e) => {
                // Already on the landing: the logo takes the reader back to the top.
                e.preventDefault()
                const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
                e.currentTarget
                  .closest('[data-landing-scroll]')
                  ?.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
                history.replaceState(null, '', landingUrl(lang))
              }}
              className="shrink-0 max-[359px]:[&_span]:hidden"
            >
              <Logo />
            </a>
            <Dock links={links} label={t('navMenu')} placement="top" {...dockLabels} />
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <LanguagePicker />
              <button type="button" onClick={() => navigate('app')} className="launch-btn group">
                <span className="launch-btn-inner">
                  <Icon
                    name="sparkles"
                    className="h-4 w-4 shrink-0 max-sm:hidden transition-transform duration-500 group-hover:rotate-[20deg] group-hover:scale-110"
                  />
                  <span className="whitespace-nowrap">{t('openApp')}</span>
                  <Icon
                    name="arrow"
                    className="hidden h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1 sm:block"
                  />
                </span>
              </button>
            </div>
          </div>
          <ScrollProgress />
        </header>
        <Dock links={links} label={t('navMenu')} placement="bottom" {...dockLabels} />
      </>
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
            {/* One glowing main action, then two lighter chips for the side paths. */}
            <div className="reveal-visible mt-10 flex flex-col items-center gap-4 lg:items-start">
              <button
                type="button"
                onClick={() => navigate('app')}
                className="launch-btn launch-btn-lg group w-full max-w-sm sm:w-auto"
              >
                <span className="launch-btn-inner">
                  <Icon
                    name="sparkles"
                    className="h-5 w-5 shrink-0 transition-transform duration-500 group-hover:rotate-[20deg] group-hover:scale-110"
                  />
                  <span>{t('heroCtaPrimary')}</span>
                  <Icon
                    name="arrow"
                    className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </button>
              <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                <a href="/demo" className="hero-chip group">
                  <span className="hero-chip-icon">
                    <Icon name="play" className="h-3.5 w-3.5" />
                  </span>
                  {t('heroCtaDemo')}
                </a>
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hero-chip group">
                  <span className="hero-chip-icon">
                    <Icon name="github" className="h-3.5 w-3.5" />
                  </span>
                  {t('heroCtaSecondary')}
                  <Icon name="external" className="h-3 w-3 shrink-0 opacity-50" />
                </a>
              </div>
            </div>
            <p className="reveal-visible mt-5 text-sm text-gray-500">{t('heroNote')}</p>
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

  // Who the product is for: four audiences, right under the pillars.
  function Audience() {
    const cards = [
      { icon: 'blocks', title: t('who1Title'), text: t('who1Text') },
      { icon: 'book', title: t('who2Title'), text: t('who2Text') },
      { icon: 'package', title: t('who3Title'), text: t('who3Text') },
      { icon: 'shield', title: t('who4Title'), text: t('who4Text') },
    ]
    return (
      <section id="who" className="scroll-mt-20 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHead title={t('whoTitle')} subtitle={t('whoSubtitle')} />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c, i) => (
              <li key={c.title}>
                <Reveal delay={i * 90} className="h-full">
                  <div className="h-full rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/15 to-brand/5 text-brand ring-1 ring-brand/15">
                      <Icon name={c.icon} className="h-[22px] w-[22px]" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold">{c.title}</h3>
                    <p className="mt-2 leading-relaxed text-gray-600">{c.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    )
  }

  // Interactive "play with the real blocks" section.
  // Visual design: cover pages, themed block panels, image/quote layouts,
  // carousels, downloads and motion — shown with the real learner components.
  function Design() {
    const points = [
      { icon: 'theme', title: t('designPoint1Title'), text: t('designPoint1Text') },
      { icon: 'blocks', title: t('designPoint2Title'), text: t('designPoint2Text') },
      { icon: 'download', title: t('designPoint3Title'), text: t('designPoint3Text') },
      { icon: 'route', title: t('designPoint4Title'), text: t('designPoint4Text') },
    ]
    return (
      <section id="design" className="relative scroll-mt-20 overflow-hidden py-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute right-[-10%] top-10 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
          <div className="absolute bottom-0 left-[-6%] h-72 w-72 rounded-full bg-brand/5 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[5fr_7fr] lg:gap-12">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand-dark">
                <span aria-hidden>✦</span> {t('designBadge')}
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">{t('designTitle')}</h2>
              <p className="mt-4 text-lg leading-relaxed text-gray-600">{t('designSubtitle')}</p>
            </Reveal>
            <div className="mt-8 grid gap-6">
              {points.map((pt, i) => (
                <Reveal key={pt.title} delay={i * 90}>
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-md shadow-brand/25">
                      <Icon name={pt.icon} className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{pt.title}</h3>
                      <p className="mt-1 leading-relaxed text-gray-600">{pt.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal delay={120}>
            <Deferred minHeight={480}>
              <DesignShowcase />
            </Deferred>
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
          <SectionHead title={t('featuresTitle')} subtitle={t('featuresSubtitle')} />
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

  // Accessibility: what the exported player and the course check do for learners.
  function Accessibility() {
    const points = [
      { icon: 'keyboard', title: t('a11yPoint1Title'), text: t('a11yPoint1Text') },
      { icon: 'speaker', title: t('a11yPoint2Title'), text: t('a11yPoint2Text') },
      { icon: 'captions', title: t('a11yPoint3Title'), text: t('a11yPoint3Text') },
      { icon: 'sliders', title: t('a11yPoint4Title'), text: t('a11yPoint4Text') },
      { icon: 'quiz', title: t('a11yPoint5Title'), text: t('a11yPoint5Text') },
      { icon: 'package', title: t('a11yPoint6Title'), text: t('a11yPoint6Text') },
    ]
    const toggles = [
      { label: t('a11yMockContrast'), on: false },
      { label: t('a11yMockSpacing'), on: true },
      { label: t('a11yMockMotion'), on: true },
      { label: t('a11yMockCaptions'), on: true },
    ]
    const sizes = [t('a11yMockSizeNormal'), t('a11yMockSizeLarge'), t('a11yMockSizeXl')]
    return (
      <section id="accessibility" className="relative scroll-mt-20 overflow-hidden py-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-[-8%] top-16 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[7fr_5fr] lg:gap-12">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand-dark">
                <Icon name="a11y" className="h-4 w-4" /> {t('a11yBadge')}
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">{t('a11yTitle')}</h2>
              <p className="mt-4 text-lg leading-relaxed text-gray-600">{t('a11ySubtitle')}</p>
            </Reveal>
            <div className="mt-8">
              <ul className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
                {points.map((p, i) => (
                  <li key={p.title}>
                    <Reveal delay={(i % 2) * 90} className="flex gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/15 to-brand/5 text-brand ring-1 ring-brand/15">
                        <Icon name={p.icon} className="h-[22px] w-[22px]" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold">{p.title}</span>
                        <span className="mt-1 block leading-relaxed text-gray-600">{p.text}</span>
                      </span>
                    </Reveal>
                  </li>
                ))}
              </ul>
              <Reveal>
                <p className="mt-8 rounded-2xl border border-brand/20 bg-brand/5 px-5 py-4 text-sm leading-relaxed text-gray-700">
                  {t('a11yNote')}
                </p>
              </Reveal>
            </div>
          </div>
          {/* Illustrative visual of the learner menu. Static on purpose. */}
          <Reveal delay={120}>
            <div role="img" aria-label={t('a11yVisualLabel')} className="relative mx-auto w-full max-w-sm">
              <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xl shadow-gray-900/10">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white">
                    Aa
                  </span>
                  <span className="font-semibold">{t('a11yMockTitle')}</span>
                </div>
                <p className="mt-4 text-sm font-medium text-gray-700">{t('a11yMockTextSize')}</p>
                <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1 text-center text-xs font-medium">
                  {sizes.map((size, i) => (
                    <span
                      key={size}
                      className={`rounded-lg px-1 py-1.5 ${i === 1 ? 'bg-brand-dark text-white shadow-sm' : 'text-gray-600'}`}
                    >
                      {size}
                    </span>
                  ))}
                </div>
                <ul className="mt-4 space-y-3">
                  {toggles.map((tg) => (
                    <li key={tg.label} className="flex items-center justify-between gap-3 text-sm text-gray-700">
                      {tg.label}
                      <span
                        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${tg.on ? 'bg-brand-dark' : 'bg-gray-300'}`}
                      >
                        <span
                          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow ${tg.on ? 'left-[1.125rem]' : 'left-0.5'}`}
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative -mt-3 ml-6 flex items-center gap-2.5 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-lg shadow-gray-900/10 sm:ml-10">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand-dark">
                  <Icon name="check" className="h-3 w-3" />
                </span>
                {t('a11yMockLms')}
              </div>
            </div>
          </Reveal>
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
          <SectionHead
            badge={
              <>
                <span className="chatd-dot" /> {t('newsBadge')}
              </>
            }
            title={t('newsTitle')}
            subtitle={t('newsSubtitle')}
          />
          <div className="relative mt-12">
            <div className="pointer-events-none absolute bottom-4 left-[11.25rem] top-4 hidden border-l-2 border-dashed border-brand/20 md:block" />
            <ol className="space-y-8">
              {releases.map((r, i) => (
                <li key={r.id}>
                  <Reveal delay={i * 110}>
                    <div className="grid gap-3 md:grid-cols-[10rem_1fr] md:gap-10">
                      <div className="flex items-center gap-3 md:flex-col md:items-end md:pt-6 md:text-right">
                        {r.date && (
                          <time dateTime={r.date} className="font-semibold text-gray-900">
                            {fmt.format(new Date(r.date))}
                          </time>
                        )}
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
            <div className="mt-10">
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
      { title: t('how1Title'), text: t('how1Text') },
      { title: t('how2Title'), text: t('how2Text') },
      { title: t('how3Title'), text: t('how3Text') },
    ]
    return (
      <section
        id="how"
        className="relative scroll-mt-20 overflow-hidden border-y border-gray-100 bg-gradient-to-b from-gray-50/80 to-white py-24"
      >

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHead title={t('howTitle')} />
          <Reveal delay={120} className="mt-12">
            <HowSteps steps={steps} />
          </Reveal>
        </div>
      </section>
    )
  }

  // What the project is, how to reach it, and its vital signs.
  function About() {
    const latest = RELEASES.find((r) => r.date)?.date
    const fmt = new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
    const linkClass = 'font-semibold text-brand-dark hover:text-brand'
    return (
      <section id="about" className="scroll-mt-20 px-4 py-20 sm:px-6">
        <Reveal>
          <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('aboutTitle')}</h2>
            <div className="mt-8 grid gap-8 md:grid-cols-[1fr_1.2fr] md:gap-12">
              <div>
                <p className="leading-relaxed text-gray-600">{t('aboutText')}</p>
                <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                  <a href={GITHUB_URL} target="_blank" rel="noreferrer" className={linkClass}>
                    {t('navGithub')}
                  </a>
                  <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
                    {CONTACT_EMAIL}
                  </a>
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm [&>div]:min-w-0">
                <div>
                  <dt className="text-gray-500">{t('aboutVersion')}</dt>
                  <dd className="mt-0.5 font-semibold text-gray-900">{__APP_VERSION__}</dd>
                </div>
                {latest && (
                  <div>
                    <dt className="text-gray-500">{t('aboutReleased')}</dt>
                    <dd className="mt-0.5 font-semibold text-gray-900">
                      <time dateTime={latest}>{fmt.format(new Date(latest))}</time>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-gray-500">{t('aboutLicense')}</dt>
                  <dd className="mt-0.5 font-semibold text-gray-900">MIT</dd>
                </div>
                <div>
                  <dt className="text-gray-500">{t('aboutRepo')}</dt>
                  <dd className="mt-0.5">
                    <a href={GITHUB_URL} target="_blank" rel="noreferrer" className={`break-all ${linkClass}`}>
                      github.com/dmmat/Scormly
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
            <a href="#whats-new" className={`mt-8 inline-flex items-center gap-2 ${linkClass}`}>
              {t('aboutNews')} <Icon name="arrow" className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </section>
    )
  }

  function Faq() {
    // faqQ1…faqQN: add a pair to landing.ts and it shows here, in the
    // prerendered HTML and in the FAQPage schema.
    const items: { q: string; a: string }[] = []
    for (let i = 1; t(`faqQ${i}`) !== `faqQ${i}`; i++) items.push({ q: t(`faqQ${i}`), a: t(`faqA${i}`) })
    return (
      <section id="faq" className="scroll-mt-20 border-t border-gray-100 bg-gray-50/60 py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHead title={t('faqTitle')} />
          </div>
          <div className="space-y-3">
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
      <footer className="border-t border-gray-100 bg-white pb-32 pt-12 lg:pb-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:px-6 text-center">
          <Logo />
          <p className="text-sm text-gray-500">{t('footerTagline')}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-500">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-brand"
            >
              {t('navGithub')}
            </a>
            <a href="/demo" className="hover:text-brand">
              {t('footerDemo')}
            </a>
            <a href="/app" className="hover:text-brand">
              {t('openApp')}
            </a>
            <a href="#whats-new" className="hover:text-brand">
              {t('navNews')}
            </a>
            <a href="/llms.txt" className="hover:text-brand">
              llms.txt
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-brand">
              {CONTACT_EMAIL}
            </a>
            <a
              href={GITHUB_ISSUES_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-brand"
            >
              {t('footerIssues')}
            </a>
            <span>{t('footerLicense')}</span>
          </div>
          {/* Real links, so each language page is reachable by crawlers; a
              click switches the language like the picker in the top bar. */}
          <nav
            aria-label={t('footerLanguages')}
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-500"
          >
            {LANGUAGES.map((l) => (
              <a
                key={l.id}
                href={landingUrl(l.id)}
                hrefLang={l.id}
                lang={l.id}
                aria-current={l.id === lang ? 'page' : undefined}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                  e.preventDefault()
                  setLang(l.id)
                }}
                className={l.id === lang ? 'font-medium text-gray-900' : 'hover:text-brand'}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <p className="text-xs text-gray-500">{t('footerMade')}</p>
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
