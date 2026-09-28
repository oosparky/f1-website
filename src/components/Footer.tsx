import { DRIVERS } from '@/data/drivers'
import { Link } from '@/lib/router'
import { Icon } from './Icon'

export function Footer() {
  return (
    <footer className="relative border-t border-hairline bg-carbon-900">
      <div aria-hidden="true" className="pit-stripe absolute inset-x-0 top-0 h-[3px] opacity-70" />

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center bg-race-red text-carbon-950">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="currentColor" />
              </svg>
            </span>
            <span className="font-display text-xl font-extrabold tracking-wide">
              APEX<span className="text-race-red">26</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-fog">
            An interactive 3D take on the 2026 Formula 1 season — rotate the car, switch liveries,
            inspect every part.
          </p>
        </div>

        <div>
          <h3 className="text-sm uppercase tracking-[0.25em] text-mute">Navigate</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { to: '/', label: 'Home' },
              { to: '/drivers', label: 'Drivers' },
              { to: '/teams', label: 'Teams' },
              { to: '/about', label: 'About / Contact' },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-fog transition-colors hover:text-chalk">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm uppercase tracking-[0.25em] text-mute">Championship</h3>
          <ul className="mt-4 space-y-2 text-sm text-fog">
            <li>2026 season · 11 teams</li>
            <li>Standings after Italian GP</li>
            <li>
              <Link to="/drivers" className="transition-colors hover:text-chalk">
                {DRIVERS.length} featured drivers
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm uppercase tracking-[0.25em] text-mute">Data</h3>
          <p className="mt-4 text-sm leading-relaxed text-fog">
            All stats live in{' '}
            <code className="rounded bg-carbon-800 px-1.5 py-0.5 text-xs text-chrome">
              src/data/
            </code>{' '}
            — edit the drivers, teams or standings there and the whole site updates.
          </p>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-5 text-xs text-mute sm:flex-row">
          <p>© 2026 APEX 26 — a demo project, not affiliated with Formula 1.</p>
          <a
            href="#top"
            className="flex items-center gap-1.5 transition-colors hover:text-chalk"
            aria-label="Back to top"
          >
            Back to top <Icon name="arrow-right" size={13} className="rotate-[-90deg]" />
          </a>
        </div>
      </div>
    </footer>
  )
}
