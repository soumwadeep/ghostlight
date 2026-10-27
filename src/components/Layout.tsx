import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Code2, Menu, X } from 'lucide-react'
import { useModel } from '../lib/model'
import { cx } from '../lib/utils'
import { Logo } from './Logo'

function EngineBadge() {
  const { gemma, webgpu } = useModel()
  let label = 'On-device AI'
  let state = ''
  if (gemma.status === 'ready') {
    label = 'Gemma · lit'
    state = 'is-live'
  } else if (gemma.status === 'loading') {
    label = `Gemma · ${Math.round(gemma.progress * 100)}%`
    state = 'is-warm'
  } else if (webgpu === 'no') {
    label = 'Candle mode'
  } else if (gemma.status === 'error') {
    label = 'Gemma · asleep'
  } else if (webgpu === 'yes') {
    state = 'is-warm'
  }

  return (
    <Link className="model-badge" to="/about#model" title="How the model works">
      <span className={cx('status-dot', state)} />
      {label}
    </Link>
  )
}

const NAV = [
  { to: '/studio', label: 'The studio', number: '01' },
  { to: '/archive', label: 'Ofrendas', number: '02' },
  { to: '/about', label: 'How it works', number: '03' },
]

function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <header className={cx('site-header', (scrolled || open) && 'is-scrolled', open && 'is-open')}>
        <div className="wrap header-inner">
          <Link to="/" aria-label="Ghostlight — home">
            <Logo />
          </Link>

          <nav className="site-nav" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className="nav-link">
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <EngineBadge />
            <Link to="/studio" className="btn btn-primary btn-sm">
              Light a candle
            </Link>
            <button
              type="button"
              className="menu-btn"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-menu" className={cx('mobile-sheet', open && 'is-open')}>
        <nav className="mobile-nav" aria-label="Mobile">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
              {item.label}
              <span>{item.number}</span>
            </Link>
          ))}
        </nav>
        <div className="mobile-sheet-foot">
          <p className="note">
            No account. No server. The model runs on this device, and every memory stays in this
            browser.
          </p>
          <Link to="/studio" className="btn btn-primary" onClick={() => setOpen(false)}>
            Light a candle
          </Link>
        </div>
      </div>
    </>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>
            A quiet, local-first studio for the stories you cannot afford to lose. One conversation,
            one remembrance, one ofrenda — kept on your own device.
          </p>
          <a
            className="link"
            href="https://github.com/soumwadeep/ghostlight"
            target="_blank"
            rel="noreferrer"
          >
            The source is open <Code2 size={14} />
          </a>
        </div>

        <div className="footer-col">
          <h3>The ritual</h3>
          <ul>
            <li>
              <Link to="/studio">Light a candle</Link>
            </li>
            <li>
              <Link to="/archive">The archive</Link>
            </li>
            <li>
              <Link to="/about">How it works</Link>
            </li>
            <li>
              <Link to="/ofrenda/ruma-das">A finished ofrenda</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>The fine print</h3>
          <ul>
            <li>
              <a href="https://github.com/soumwadeep/ghostlight" target="_blank" rel="noreferrer">
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://github.com/soumwadeep/ghostlight/issues"
                target="_blank"
                rel="noreferrer"
              >
                Report a problem
              </a>
            </li>
            <li>
              <a href="https://ai.google.dev/gemma/terms" target="_blank" rel="noreferrer">
                Gemma terms
              </a>
            </li>
            <li>
              <a
                href="https://github.com/soumwadeep/ghostlight/blob/main/LICENSE"
                target="_blank"
                rel="noreferrer"
              >
                MIT license
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="wrap footer-bottom">
        <p>
          Ghostlight is a memory tool, not a medium. It cannot talk to the dead. It helps you keep
          what you know. The demo archive is fictional; every other archive stays in your browser.
        </p>
        <p className="mono">Hacktoberfest 2026 · Ghost in the Machine · 0 bytes uploaded</p>
      </div>
    </footer>
  )
}

export function Layout() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" className="page-main">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export function BootScreen() {
  return (
    <div className="boot">
      <div className="flame-loader" />
      <p>Opening the archive</p>
    </div>
  )
}
