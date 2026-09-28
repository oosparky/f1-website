import { useMemo, useState } from 'react'
import { DRIVERS, NATIONALITIES, type Driver } from '@/data/drivers'
import { TEAMS, teamById } from '@/data/teams'
import { cx, onColor } from '@/lib/utils'
import { DriverCard } from './DriverCard'
import { Icon } from '@/components/Icon'
import { Reveal } from '@/components/Reveal'

type TeamFilter = 'all' | Driver['team']

export function DriverGrid() {
  const [query, setQuery] = useState('')
  const [team, setTeam] = useState<TeamFilter>('all')
  const [nat, setNat] = useState('all')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return DRIVERS.filter((d) => {
      if (team !== 'all' && d.team !== team) return false
      if (nat !== 'all' && d.nationality !== nat) return false
      if (!q) return true
      return (
        d.name.toLowerCase().includes(q) ||
        d.nationality.toLowerCase().includes(q) ||
        teamById(d.team).name.toLowerCase().includes(q) ||
        String(d.number) === q
      )
    }).sort((a, b) => b.season.points - a.season.points)
  }, [query, team, nat])

  const dirty = query !== '' || team !== 'all' || nat !== 'all'
  const clear = () => {
    setQuery('')
    setTeam('all')
    setNat('all')
  }

  return (
    <div>
      {/* ------------------- toolbar ------------------- */}
      <div className="glass rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search drivers</span>
            <Icon
              name="search"
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, team, nationality or number…"
              className="w-full rounded-xl border border-hairline bg-carbon-950/70 py-3 pl-10 pr-4 text-sm text-chalk placeholder:text-mute focus:border-race-red focus:outline-none"
            />
          </label>

          <div className="flex items-center gap-3">
            <label className="relative">
              <span className="sr-only">Filter by nationality</span>
              <select
                value={nat}
                onChange={(e) => setNat(e.target.value)}
                className="appearance-none rounded-xl border border-hairline bg-carbon-950/70 py-3 pl-4 pr-9 text-sm text-chalk focus:border-race-red focus:outline-none"
              >
                <option value="all">All nationalities</option>
                {NATIONALITIES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <Icon
                name="chevron-down"
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-mute"
              />
            </label>

            {dirty && (
              <button
                type="button"
                onClick={clear}
                className="flex items-center gap-1.5 rounded-xl border border-hairline px-3 py-3 text-xs font-semibold uppercase tracking-wider text-fog transition hover:border-race-red hover:text-race-red"
              >
                <Icon name="close" size={13} /> Clear
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.3em] text-mute">
            Teams
          </span>
          <button
            type="button"
            onClick={() => setTeam('all')}
            aria-pressed={team === 'all'}
            className={cx(
              'rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition',
              team === 'all'
                ? 'border-chalk bg-chalk text-carbon-950'
                : 'border-hairline text-fog hover:border-chrome hover:text-chalk',
            )}
          >
            All
          </button>
          {TEAMS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTeam(t.id)}
              aria-pressed={team === t.id}
              className={cx(
                'flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition',
                team === t.id ? 'border-transparent' : 'border-hairline text-fog hover:text-chalk',
              )}
              style={
                team === t.id
                  ? { background: t.color, color: onColor(t.color) }
                  : { borderColor: `${t.color}55` }
              }
            >
              <span className="size-2 rounded-full" style={{ background: t.color }} />
              {t.short}
            </button>
          ))}
        </div>
      </div>

      {/* ------------------- results ------------------- */}
      <p className="mt-6 text-sm text-mute" role="status">
        {results.length} {results.length === 1 ? 'driver' : 'drivers'}
        {dirty && ' matching filters'}
      </p>

      {results.length === 0 ? (
        <div className="glass mt-4 rounded-2xl p-10 text-center">
          <p className="font-display text-3xl">No match</p>
          <p className="mt-2 text-sm text-fog">Try a different name, team or nationality.</p>
          <button
            type="button"
            onClick={clear}
            className="mt-5 rounded-lg bg-race-red px-5 py-2.5 text-sm font-semibold text-carbon-950 transition hover:brightness-110"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((d, i) => (
            <Reveal key={d.slug} delay={Math.min(i * 0.06, 0.3)}>
              <DriverCard driver={d} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  )
}
