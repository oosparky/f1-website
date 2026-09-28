import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, useRoute } from '@/lib/router'
import { engineSound } from '@/lib/sound'
import { cx } from '@/lib/utils'
import { Icon } from './Icon'

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/drivers', label: 'Drivers' },
  { to: '/teams', label: 'Teams' },
  { to: '/about', label: 'About' },
] as const

export function Navbar() {
  const path = useRoute()
  const [open, setOpen] = useState(false)
  const [sound, setSound] = useState(false)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const bar = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 })

  useEffect(() => setOpen(false), [path])

  const isActive = (to: string) => (to === '/' ? path === '/' : path.startsWith(to))

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      {/* scroll progress */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: bar }}
        className="absolute inset-x-0 top-0 h-[3px] origin-left bg-race-red"
      />

      <nav
        aria-label="Primary"
        className="glass-strong carbon mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-xl px-3 py-2 sm:px-4"
      >
        <Link to="/" className="group flex items-center gap-2.5" aria-label="APEX26 home">
          <span className="grid size-8 place-items-center bg-race-red text-carbon-950 transition-transform group-hover:-rotate-12">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="currentColor" />
            </svg>
          </span>
          <span className="font-display text-xl font-extrabold tracking-wide">
            APEX<span className="text-race-red">26</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={isActive(item.to) ? 'page' : undefined}
                className={cx(
                  'relative block rounded-lg px-4 py-2 text-sm font-medium uppercase tracking-wider transition-colors',
                  isActive(item.to) ? 'text-chalk' : 'text-fog hover:text-chalk',
                )}
              >
                {isActive(item.to) && (
                  <motion.span
                    layoutId={reduced ? undefined : 'nav-pill'}
                    className="absolute inset-0 -z-10 rounded-lg border border-hairline bg-white/[0.06]"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSound(engineSound.toggle())}
            aria-pressed={sound}
            aria-label={sound ? 'Mute engine sound' : 'Enable engine sound'}
            title={sound ? 'Sound on' : 'Sound off'}
            className={cx(
              'grid size-9 place-items-center rounded-lg border border-hairline transition-colors',
              sound ? 'bg-race-red/15 text-race-red' : 'text-mute hover:text-chalk',
            )}
          >
            <Icon name={sound ? 'volume' : 'volume-off'} size={17} />
          </button>

          <button
            type="button"
            className="grid size-9 place-items-center rounded-lg border border-hairline text-chalk md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? 'close' : 'menu'} size={18} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, filter: 'blur(6px)' }}
            transition={{ duration: 0.25 }}
            className="glass-strong carbon mx-auto mt-2 max-w-6xl overflow-hidden rounded-xl p-2 md:hidden"
          >
            <ul>
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    aria-current={isActive(item.to) ? 'page' : undefined}
                    className={cx(
                      'flex items-center justify-between rounded-lg px-4 py-3 text-base font-semibold uppercase tracking-wider',
                      isActive(item.to)
                        ? 'bg-race-red/15 text-chalk'
                        : 'text-fog hover:bg-white/5 hover:text-chalk',
                    )}
                  >
                    {item.label}
                    <Icon name="arrow-right" size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
