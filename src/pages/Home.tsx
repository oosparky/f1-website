import { AnimatePresence, motion } from 'framer-motion'
import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { Icon } from '@/components/Icon'
import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import { CAR_PARTS, type CarPartId } from '@/data/carParts'
import { DRIVERS } from '@/data/drivers'
import { TEAMS, teamById, type TeamId } from '@/data/teams'
import { cx, onColor } from '@/lib/utils'
import { Link, useRoute } from '@/lib/router'
import { engineSound } from '@/lib/sound'
import { runWhenIdle } from '@/lib/hooks'

const CarStage = lazy(() => import('@/components/three/CarStage'))

const PART_IDS = Object.keys(CAR_PARTS) as CarPartId[]

export default function Home() {
  const route = useRoute()
  const qs = route.includes('?') ? route.slice(route.indexOf('?') + 1) : ''
  const urlTeam = new URLSearchParams(qs).get('team') as TeamId | null

  const [teamId, setTeamId] = useState<TeamId>(
    urlTeam && TEAMS.some((t) => t.id === urlTeam) ? urlTeam : 'ferrari',
  )
  useEffect(() => {
    if (urlTeam && TEAMS.some((t) => t.id === urlTeam)) setTeamId(urlTeam)
  }, [urlTeam])

  const team = teamById(teamId)
  const driverNo = DRIVERS.find((d) => d.team === teamId)?.number ?? 16

  const [selected, setSelected] = useState<CarPartId | null>(null)
  const [tip, setTip] = useState<{ id: CarPartId; x: number; y: number } | null>(null)
  const [explore, setExplore] = useState(false)
  const [stageReady, setStageReady] = useState(false)

  useEffect(() => runWhenIdle(() => setStageReady(true), 500), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExplore(false)
        setSelected(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onHotChange = useCallback((id: CarPartId | null, x: number, y: number) => {
    setTip(id ? { id, x, y } : null)
  }, [])
  const onSelect = useCallback((id: CarPartId) => {
    setSelected(id)
    engineSound.rev(0.35)
  }, [])

  const changeTeam = (id: TeamId) => {
    setTeamId(id)
    engineSound.rev(0.75)
  }

  const featured = [...DRIVERS].sort((a, b) => b.season.points - a.season.points).slice(0, 4)

  return (
    <div id="top">
      {/* ---------------- 3D stage (fixed behind home) ---------------- */}
      <div className="fixed inset-0 z-0">
        {stageReady && (
          <Suspense fallback={null}>
            <CarStage
              livery={team.livery}
              number={driverNo}
              accent={team.color}
              explore={explore}
              onHotChange={onHotChange}
              onSelect={onSelect}
            />
          </Suspense>
        )}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_35%,transparent_35%,rgba(5,5,7,0.72)_100%)]" />
      </div>

      {/* ---------------- hero ---------------- */}
      <section className="relative z-10 flex min-h-screen flex-col justify-between px-5 pb-8 pt-28 sm:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.4em] text-mute"
          >
            <span className="size-2 animate-led rounded-full bg-race-red" />
            2026 Formula One World Championship
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 max-w-[16ch] text-[clamp(2.75rem,9vw,7.5rem)] [text-shadow:0_4px_28px_rgba(5,5,7,0.85)]"
          >
            The grid,
            <br />
            <span className="text-race-red">rendered</span>{' '}
            <span className="text-outline">in 3D</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-fog [text-shadow:0_2px_16px_rgba(5,5,7,0.9)] sm:text-lg"
          >
            Drag to rotate a 2026 machine, swap team liveries on the fly and click any component
            — front wing, halo, engine cover — to see what it does. Then meet the drivers
            chasing the title.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.26 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/drivers"
              className="group flex items-center gap-2 rounded-xl bg-race-red px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-carbon-950 transition hover:brightness-110"
            >
              Meet the drivers
              <Icon name="arrow-right" size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <button
              type="button"
              onClick={() => setExplore((v) => !v)}
              aria-pressed={explore}
              className={cx(
                'flex items-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-bold uppercase tracking-widest transition',
                explore
                  ? 'border-race-teal bg-race-teal/15 text-race-teal'
                  : 'border-hairline text-chalk hover:border-chrome',
              )}
            >
              <Icon name={explore ? 'zoom' : 'rotate'} size={16} />
              {explore ? 'Zoom mode on' : 'Explore in 3D'}
            </button>
          </motion.div>

          {explore && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-race-teal/40 bg-carbon-950/70 px-3 py-2 text-xs text-race-teal backdrop-blur"
            >
              <Icon name="zoom" size={14} />
              Scroll to zoom · drag to rotate · Esc to exit
            </motion.p>
          )}
        </div>

        {/* livery selector + part chips */}
        <div className="mx-auto w-full max-w-6xl">
          <div className="glass rounded-2xl p-4 backdrop-blur-md">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.3em] text-mute">
                  Livery
                </span>
                {TEAMS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => changeTeam(t.id)}
                    aria-pressed={teamId === t.id}
                    className={cx(
                      'flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition',
                      teamId === t.id ? 'border-transparent' : 'border-hairline text-fog hover:text-chalk',
                    )}
                    style={
                      teamId === t.id
                        ? { background: t.color, color: onColor(t.color) }
                        : { borderColor: `${t.color}66` }
                    }
                  >
                    <span className="size-2 rounded-full" style={{ background: t.color }} />
                    {t.short}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.3em] text-mute">
                  Parts
                </span>
                {PART_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelect(id)}
                    aria-pressed={selected === id}
                    className={cx(
                      'rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition',
                      selected === id
                        ? 'border-race-red bg-race-red/15 text-race-red'
                        : 'border-hairline text-mute hover:border-chrome hover:text-chalk',
                    )}
                  >
                    {CAR_PARTS[id].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-mute">
            <span className="hidden sm:inline">Drag the car · hover parts to inspect</span>
            <span className="flex items-center gap-2">
              Scroll
              <motion.span
                aria-hidden="true"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-block"
              >
                <Icon name="chevron-down" size={14} />
              </motion.span>
            </span>
          </div>
        </div>
      </section>

      {/* ---------------- tooltip ---------------- */}
      <AnimatePresence>
        {tip && (
          <motion.div
            key={tip.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none fixed z-30"
            style={{
              left: Math.min(tip.x + 18, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 230),
              top: tip.y + 18,
            }}
          >
            <div className="glass-strong max-w-[220px] rounded-lg px-3 py-2">
              <p className="font-display text-base leading-none">{CAR_PARTS[tip.id].label}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-race-red">
                {CAR_PARTS[tip.id].tag} · click for detail
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- part detail panel ---------------- */}
      <AnimatePresence>
        {selected && (
          <motion.aside
            key="panel"
            role="dialog"
            aria-label={`${CAR_PARTS[selected].label} details`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="glass-strong carbon fixed right-4 top-24 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-2xl p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-race-red">
                  {CAR_PARTS[selected].tag}
                </p>
                <h3 className="mt-1 text-3xl">{CAR_PARTS[selected].label}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close part details"
                className="grid size-9 shrink-0 place-items-center rounded-lg border border-hairline text-chrome transition hover:border-race-red hover:text-race-red"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-fog">{CAR_PARTS[selected].detail}</p>
            <div
              className="mt-4 h-1 w-full"
              style={{ background: `linear-gradient(90deg, ${team.color}, transparent)` }}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ---------------- stats strip ---------------- */}
      <section className="relative z-10 border-y border-hairline bg-carbon-950/88 px-5 py-16 backdrop-blur-sm sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <SectionHeading
            index="01"
            kicker="Season brief"
            title="A ground-effect era, rewritten"
            lead="Lighter cars, active aero and 11 teams — including newcomers Cadillac — make 2026 the biggest regulation reset in a generation. Everything on this site is driven by live-editable data files."
          />
          <Reveal>
          <dl className="grid grid-cols-3 gap-4">
            {[
              { k: 'Teams', v: '11' },
              { k: 'Drivers', v: '22' },
              { k: 'Races', v: '24' },
            ].map((s) => (
              <div key={s.k} className="glass rounded-xl p-4 text-center">
                <dt className="text-[10px] font-bold uppercase tracking-[0.24em] text-mute">{s.k}</dt>
                <dd className="mt-1 font-display text-5xl font-extrabold text-chalk">{s.v}</dd>
              </div>
            ))}
          </dl>
          </Reveal>
        </div>
      </section>

      {/* ---------------- featured drivers ---------------- */}
      <section className="relative z-10 bg-carbon-950/88 px-5 py-16 backdrop-blur-sm sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              index="02"
              kicker="Standings"
              title="Championship frontrunners"
              lead="Top four after the Italian Grand Prix."
            />
            <Link
              to="/drivers"
              className="group flex items-center gap-2 rounded-xl border border-hairline px-5 py-3 text-xs font-bold uppercase tracking-widest text-chalk transition hover:border-race-red hover:text-race-red"
            >
              All drivers
              <Icon name="arrow-right" size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((d, i) => {
              const t = teamById(d.team)
              return (
                <Reveal key={d.slug} delay={i * 0.06}>
                  <Link
                    to={`/drivers/${d.slug}`}
                    className="glass group relative block overflow-hidden rounded-xl p-4 transition hover:border-chrome/60"
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-1"
                      style={{ background: `linear-gradient(90deg, ${t.color}, transparent 85%)` }}
                    />
                    <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-mute">
                      P{i + 1} · {t.short}
                    </p>
                    <p className="mt-2 font-display text-2xl leading-none">{d.name}</p>
                    <p className="mt-3 font-display text-3xl font-extrabold tabular-stats" style={{ color: t.color }}>
                      {d.season.points}
                      <span className="ml-1 text-xs font-semibold text-mute">PTS</span>
                    </p>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="relative z-10 border-t border-hairline bg-carbon-950/88 px-5 py-20 backdrop-blur-sm sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-4xl sm:text-5xl">
              Every driver.
              <br />
              Every number.
            </h2>
            <p className="mt-3 max-w-md text-fog">
              Career records, 2026 points and Instagram links — filterable by team and
              nationality.
            </p>
          </div>
          <Link
            to="/drivers"
            className="group flex items-center gap-3 rounded-xl bg-chalk px-7 py-4 text-sm font-bold uppercase tracking-widest text-carbon-950 transition hover:bg-race-red hover:text-chalk"
          >
            Open the driver grid
            <Icon name="arrow-right" size={17} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div aria-hidden="true" className="speed-lines mx-auto mt-14 h-8 max-w-6xl opacity-60" />
      </section>
    </div>
  )
}
