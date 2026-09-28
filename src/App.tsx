import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Suspense, lazy, useEffect, useMemo, type ReactNode } from 'react'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { DRIVERS, driverBySlug } from '@/data/drivers'
import { Link, useRoute } from '@/lib/router'

const Home = lazy(() => import('@/pages/Home'))
const Drivers = lazy(() => import('@/pages/Drivers'))
const DriverDetail = lazy(() => import('@/pages/DriverDetail'))
const Teams = lazy(() => import('@/pages/Teams'))
const About = lazy(() => import('@/pages/About'))

function Loading() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="text-center">
        <span className="mx-auto block size-3 animate-led rounded-full bg-race-red" />
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.4em] text-mute">Loading</p>
      </div>
    </div>
  )
}

function NotFound({ path }: { path: string }) {
  return (
    <div id="top" className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="font-display text-7xl text-race-red">404</p>
        <h1 className="mt-3 text-3xl">Wrong grid slot</h1>
        <p className="mt-2 text-fog">
          Nothing lives at <code className="text-chrome">{path}</code>.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-race-red px-6 py-3 text-sm font-bold uppercase tracking-widest text-carbon-950"
        >
          Back to the garage
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  const raw = useRoute()
  const pathname = raw.split('?')[0]
  const reduced = useReducedMotion()

  const titles = useMemo(() => {
    const base: Record<string, string> = {
      '/': 'APEX 26 — Interactive 3D Formula 1 Grid',
      '/drivers': 'Drivers — APEX 26',
      '/teams': 'Teams — APEX 26',
      '/about': 'About — APEX 26',
    }
    DRIVERS.forEach((d) => {
      base[`/drivers/${d.slug}`] = `${d.name} — APEX 26`
    })
    return base
  }, [])

  // scroll reset + document title per route
  useEffect(() => {
    window.scrollTo(0, 0)
    const driver = pathname.startsWith('/drivers/')
      ? driverBySlug(pathname.slice('/drivers/'.length))
      : undefined
    document.title = driver
      ? `${driver.name} — APEX 26`
      : (titles[pathname] ?? 'APEX 26 — Interactive 3D Formula 1 Grid')
  }, [pathname, titles])

  let page: ReactNode
  if (pathname === '/') page = <Home />
  else if (pathname === '/drivers') page = <Drivers />
  else if (pathname.startsWith('/drivers/')) page = <DriverDetail slug={pathname.slice('/drivers/'.length)} />
  else if (pathname === '/teams') page = <Teams />
  else if (pathname === '/about') page = <About />
  else page = <NotFound path={pathname} />

  return (
    <div className="relative min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-race-red focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-carbon-950"
      >
        Skip to content
      </a>

      <Navbar />

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          id="main"
          initial={reduced ? { opacity: 0 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.15 : 0.3, ease: 'easeOut' }}
        >
          <Suspense fallback={<Loading />}>{page}</Suspense>
        </motion.main>
      </AnimatePresence>

      {/* speed-streak page transition */}
      <AnimatePresence initial={false}>
        <motion.div
          key={`streak-${pathname}`}
          aria-hidden="true"
          initial={reduced ? { opacity: 0 } : { x: '-120%', opacity: 1 }}
          animate={reduced ? { opacity: 0 } : { x: '130%', opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.7, ease: [0.3, 0, 0.2, 1] }}
          className="pointer-events-none fixed inset-y-0 left-0 z-[60] w-[60vw] bg-[linear-gradient(100deg,transparent,rgb(255_59_48/0.16)_35%,rgb(255_255_255/0.10)_50%,transparent)] blur-2xl"
        />
      </AnimatePresence>

      <Footer />
    </div>
  )
}
