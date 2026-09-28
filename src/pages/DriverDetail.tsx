import { motion } from 'framer-motion'
import { Headshot } from '@/components/Headshot'
import { Icon } from '@/components/Icon'
import { Reveal } from '@/components/Reveal'
import { DRIVERS, driverBySlug, instagramUrl } from '@/data/drivers'
import { teamById } from '@/data/teams'
import { Link } from '@/lib/router'
import { formatNum, onColor } from '@/lib/utils'

function Tile({
  label,
  value,
  hint,
  color,
}: {
  label: string
  value: string | number
  hint?: string
  color?: string
}) {
  return (
    <div className="glass rounded-xl p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-mute">{label}</p>
      <p
        className="mt-1.5 font-display text-3xl font-extrabold leading-none tabular-stats"
        style={color ? { color } : undefined}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-[11px] text-mute">{hint}</p>}
    </div>
  )
}

export default function DriverDetail({ slug }: { slug: string }) {
  const driver = driverBySlug(slug)

  if (!driver) {
    return (
      <div id="top" className="relative z-10 grid min-h-screen place-items-center px-6 text-center">
        <div>
          <p className="font-display text-7xl text-race-red">404</p>
          <h1 className="mt-3 text-3xl">Driver not found</h1>
          <p className="mt-2 text-fog">That name isn’t on the 2026 grid.</p>
          <Link
            to="/drivers"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-race-red px-6 py-3 text-sm font-bold uppercase tracking-widest text-carbon-950"
          >
            Back to the grid <Icon name="arrow-right" size={15} />
          </Link>
        </div>
      </div>
    )
  }

  const team = teamById(driver.team)
  const idx = DRIVERS.findIndex((d) => d.slug === driver.slug)
  const prev = DRIVERS[(idx - 1 + DRIVERS.length) % DRIVERS.length]
  const next = DRIVERS[(idx + 1) % DRIVERS.length]

  return (
    <div id="top" className="relative z-10 min-h-screen px-5 pb-24 pt-28 sm:px-8">
      {/* team-coloured header band */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[42vh] opacity-60"
        style={{
          background: `linear-gradient(180deg, ${team.color}33, transparent 70%), radial-gradient(60% 80% at 70% 0%, ${team.color}22, transparent)`,
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <Link
          to="/drivers"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-mute transition hover:text-chalk"
        >
          <Icon name="arrow-left" size={14} /> All drivers
        </Link>

        {/* ---------- hero ---------- */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="glass relative overflow-hidden rounded-2xl"
          >
            <div
              className="absolute inset-x-0 top-0 z-10 h-1.5"
              style={{ background: `linear-gradient(90deg, ${team.color}, transparent 85%)` }}
            />
            <Headshot
              name={driver.name}
              number={driver.number}
              team={driver.team}
              className="aspect-square w-full"
            />
            <div className="flex items-center justify-between border-t border-hairline px-4 py-3">
              <span
                className="rounded-md border px-2 py-1 text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{ borderColor: `${team.color}66`, color: team.color }}
              >
                Car #{driver.number}
              </span>
              <span className="text-sm text-fog">
                {driver.flag} {driver.nationality}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.35em] text-mute">
              <span className="h-px w-8" style={{ background: team.color }} />
              {team.name}
            </p>
            <h1 className="mt-3 text-[clamp(2.5rem,7vw,5.5rem)]">
              {driver.first}
              <br />
              <span style={{ color: team.color }}>{driver.last}</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg font-medium text-chrome">{driver.headline}</p>
            <p className="mt-3 max-w-2xl leading-relaxed text-fog">{driver.bio}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={instagramUrl(driver.instagram)}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold uppercase tracking-widest transition hover:brightness-110"
                style={{ background: team.color, color: onColor(team.color) }}
              >
                <Icon name="instagram" size={16} /> @{driver.instagram}
              </a>
              <div className="glass flex items-center gap-4 rounded-xl px-5 py-3">
                <span className="text-xs uppercase tracking-[0.2em] text-mute">2026</span>
                <span className="font-display text-2xl font-extrabold tabular-stats">
                  {driver.season.points}
                </span>
                <span className="text-xs uppercase tracking-[0.2em] text-mute">points</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ---------- season ---------- */}
        <section className="mt-14">
          <h2 className="text-2xl">
            2026 season <span className="text-mute">· so far</span>
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <Tile label="Points" value={formatNum(driver.season.points)} color={team.color} />
            <Tile label="Wins" value={driver.season.wins} />
            <Tile label="Podiums" value={driver.season.podiums} />
            <Tile label="Car" value={`#${driver.number}`} hint={team.short} />
          </div>
        </section>

        {/* ---------- career ---------- */}
        <section className="mt-12">
          <h2 className="text-2xl">
            Career <span className="text-mute">· since {driver.career.debut}</span>
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <Tile
              label="World titles"
              value={driver.career.championships}
              color={driver.career.championships > 0 ? team.color : undefined}
            />
            <Tile label="Race wins" value={driver.career.wins} />
            <Tile label="Pole positions" value={driver.career.poles} />
            <Tile label="Podiums" value={driver.career.podiums} />
            <Tile label="F1 debut" value={driver.career.debut} />
            <Tile label="Grands Prix" value={driver.career.races} />
            <Tile label="Career points" value={formatNum(driver.career.points)} />
            <Tile label="DNFs" value={driver.career.dnfs} />
          </div>
        </section>

        {/* ---------- nav between drivers ---------- */}
        <nav className="mt-14 grid gap-4 sm:grid-cols-2" aria-label="Other drivers">
          {[
            { d: prev, dir: 'Prev' as const },
            { d: next, dir: 'Next' as const },
          ].map(({ d, dir }) => {
            const t = teamById(d.team)
            return (
              <Reveal key={dir}>
                <Link
                  to={`/drivers/${d.slug}`}
                  className={`glass group flex items-center gap-3 rounded-xl p-4 transition hover:border-chrome/60 ${
                    dir === 'Next' ? 'sm:flex-row-reverse sm:text-right' : ''
                  }`}
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg font-display text-xl font-extrabold" style={{ background: `${t.color}22`, color: t.color }}>
                    {d.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-mute">
                      {dir} driver
                    </span>
                    <span className="block truncate font-display text-xl">{d.name}</span>
                  </span>
                  <Icon
                    name={dir === 'Prev' ? 'arrow-left' : 'arrow-right'}
                    size={18}
                    className="shrink-0 text-mute transition group-hover:text-chalk"
                  />
                </Link>
              </Reveal>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
