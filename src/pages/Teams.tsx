import { Reveal } from '@/components/Reveal'
import { SectionHeading } from '@/components/SectionHeading'
import { DRIVERS } from '@/data/drivers'
import { TEAMS } from '@/data/teams'
import { Icon } from '@/components/Icon'
import { Link } from '@/lib/router'
import { engineSound } from '@/lib/sound'

const SWATCH_KEYS = ['primary', 'secondary', 'accent'] as const

export default function Teams() {
  return (
    <div id="top" className="relative z-10 min-h-screen px-5 pb-24 pt-32 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="02"
          as="h1"
          kicker="Teams"
          title="Four liveries, one grid"
          lead="The teams represented on this site — with their 2026 power units, driver line-ups and the exact colours used on the 3D car."
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {TEAMS.map((team, i) => {
            const drivers = DRIVERS.filter((d) => d.team === team.id)
            return (
              <Reveal key={team.id} delay={i * 0.07}>
                <article className="glass group relative flex h-full flex-col overflow-hidden rounded-2xl p-6">
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-1.5"
                    style={{ background: `linear-gradient(90deg, ${team.color}, transparent 85%)` }}
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full opacity-25 blur-3xl transition-opacity group-hover:opacity-40"
                    style={{ background: team.color }}
                  />

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-mute">
                        {team.base}
                      </p>
                      <h3 className="mt-1.5 text-3xl">{team.short}</h3>
                      <p className="mt-1 text-sm text-fog">{team.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-4xl font-extrabold tabular-stats" style={{ color: team.color }}>
                        {team.points2026}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-mute">2026 pts</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-fog">{team.blurb}</p>

                  <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border border-hairline bg-carbon-950/50 px-3 py-2">
                      <dt className="text-[10px] uppercase tracking-[0.2em] text-mute">Power unit</dt>
                      <dd className="mt-0.5 font-semibold text-chrome">{team.powerUnit}</dd>
                    </div>
                    <div className="rounded-lg border border-hairline bg-carbon-950/50 px-3 py-2">
                      <dt className="text-[10px] uppercase tracking-[0.2em] text-mute">Livery</dt>
                      <dd className="mt-1 flex gap-1.5">
                        {SWATCH_KEYS.map((k) => (
                          <span
                            key={k}
                            className="size-4 rounded-sm border border-white/10"
                            style={{ background: team.livery[k] }}
                            title={team.livery[k]}
                          />
                        ))}
                      </dd>
                    </div>
                  </dl>

                  <ul className="mt-5 space-y-2">
                    {drivers.map((d) => (
                      <li key={d.slug}>
                        <Link
                          to={`/drivers/${d.slug}`}
                          className="flex items-center justify-between rounded-lg border border-hairline bg-white/[0.02] px-3 py-2.5 transition hover:border-chrome/60"
                        >
                          <span className="flex items-center gap-3">
                            <span
                              className="grid size-7 place-items-center rounded font-display text-sm font-extrabold"
                              style={{ background: `${team.color}22`, color: team.color }}
                            >
                              {d.number}
                            </span>
                            <span className="text-sm font-semibold text-chalk">{d.name}</span>
                          </span>
                          <span className="flex items-center gap-2 text-xs text-mute tabular-stats">
                            {d.season.points} pts
                            <Icon name="arrow-right" size={13} />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={`/?team=${team.id}`}
                    onClick={() => engineSound.rev(0.7)}
                    className="mt-5 flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] transition"
                    style={{ borderColor: `${team.color}66`, color: team.color }}
                  >
                    <Icon name="car" size={15} /> View livery in 3D
                  </Link>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </div>
  )
}
