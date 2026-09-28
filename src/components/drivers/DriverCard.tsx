import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { Headshot } from '@/components/Headshot'
import { Icon } from '@/components/Icon'
import { type Driver, instagramUrl } from '@/data/drivers'
import { teamById } from '@/data/teams'
import { Link } from '@/lib/router'
import { engineSound } from '@/lib/sound'
import { onColor } from '@/lib/utils'

type Props = { driver: Driver }

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-hairline bg-carbon-950/60 px-2 py-2 text-center">
      <div className="font-display text-xl font-bold leading-none text-chalk tabular-stats">
        {value}
      </div>
      <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-mute">
        {label}
      </div>
    </div>
  )
}

export function DriverCard({ driver }: Props) {
  const team = teamById(driver.team)
  const reduced = useReducedMotion()
  const [pinned, setPinned] = useState(false)
  const [hovered, setHovered] = useState(false)
  const flipped = pinned || hovered
  const canHover =
    typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches

  const flip = () => {
    engineSound.rev(0.35)
    setPinned((v) => !v)
  }

  return (
    <article
      className="[perspective:1600px]"
      onPointerEnter={() => canHover && setHovered(true)}
      onPointerLeave={() => canHover && setHovered(false)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={reduced ? { duration: 0 } : { duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative aspect-[3/4] w-full"
      >
        {/* ---------------- front ---------------- */}
        <div
          className="glass absolute inset-0 flex flex-col overflow-hidden [backface-visibility:hidden]"
          style={{ boxShadow: `inset 0 0 0 1px transparent, 0 18px 50px -30px ${team.color}80` }}
        >
          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{ background: `linear-gradient(90deg, ${team.color}, transparent 80%)` }}
          />
          <div className="relative flex-1 overflow-hidden">
            <Headshot
              name={driver.name}
              number={driver.number}
              team={driver.team}
              className="h-full w-full transition-transform duration-700 group-hover:scale-105"
            />
            <button
              type="button"
              onClick={flip}
              aria-pressed={pinned}
              aria-label={`Show stats for ${driver.name}`}
              className="absolute right-2 top-2 grid size-9 place-items-center rounded-lg border border-hairline bg-carbon-950/70 text-chrome backdrop-blur transition hover:border-race-red hover:text-race-red"
            >
              <Icon name="rotate" size={16} />
            </button>

            <span
              className="absolute left-3 top-3 rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ borderColor: `${team.color}66`, color: team.color, background: '#050507b3' }}
            >
              {driver.flag} #{driver.number}
            </span>
          </div>

          <div className="border-t border-hairline bg-carbon-900/80 p-4">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-2xl leading-none">{driver.name}</h3>
                <p className="mt-1.5 truncate text-xs font-semibold uppercase tracking-[0.2em] text-mute">
                  {team.short} · {driver.nationality}
                </p>
              </div>
              <div className="text-right">
                <div className="font-display text-2xl font-bold leading-none text-chalk tabular-stats">
                  {driver.season.points}
                </div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-mute">2026 pts</div>
              </div>
            </div>

            <Link
              to={`/drivers/${driver.slug}`}
              className="mt-3 flex items-center justify-between rounded-lg border border-hairline bg-white/[0.03] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-chrome transition hover:border-race-red hover:text-race-red"
            >
              Full profile <Icon name="arrow-right" size={14} />
            </Link>
          </div>
        </div>

        {/* ---------------- back ---------------- */}
        <div
          className="glass absolute inset-0 flex flex-col overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)]"
          style={{ boxShadow: `0 18px 50px -30px ${team.color}80` }}
        >
          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{ background: `linear-gradient(90deg, ${team.color}, transparent 80%)` }}
          />

          <div className="flex items-center justify-between px-4 pt-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-mute">Career</p>
              <p className="font-display text-xl font-bold">{driver.last}</p>
            </div>
            <button
              type="button"
              onClick={flip}
              aria-label={`Hide stats for ${driver.name}`}
              className="grid size-9 place-items-center rounded-lg border border-hairline bg-carbon-950/70 text-chrome transition hover:border-race-red hover:text-race-red"
            >
              <Icon name="close" size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 px-4 pt-3">
            <Stat label="Titles" value={driver.career.championships} />
            <Stat label="Wins" value={driver.career.wins} />
            <Stat label="Poles" value={driver.career.poles} />
            <Stat label="Podiums" value={driver.career.podiums} />
            <Stat label="Debut" value={driver.career.debut} />
            <Stat label="Races" value={driver.career.races} />
          </div>

          <div className="mx-4 mt-3 rounded-lg border px-3 py-2" style={{ borderColor: `${team.color}44` }}>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.24em] text-mute">
              <span>2026 season</span>
              <span style={{ color: team.color }}>{team.short}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between font-display text-lg font-bold tabular-stats">
              <span>{driver.season.points} pts</span>
              <span className="text-fog">{driver.season.wins} wins</span>
              <span className="text-fog">{driver.season.podiums} pods</span>
            </div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-1.5 p-4">
            <a
              href={instagramUrl(driver.instagram)}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-hairline bg-white/[0.03] px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-chrome transition hover:border-race-red hover:text-race-red"
            >
              <Icon name="instagram" size={14} /> Instagram
            </a>
            <Link
              to={`/drivers/${driver.slug}`}
              className="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ background: team.color, color: onColor(team.color) }}
            >
              Profile <Icon name="arrow-right" size={14} />
            </Link>
          </div>
        </div>
      </motion.div>
    </article>
  )
}
