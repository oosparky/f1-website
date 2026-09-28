import { teamById, type TeamId } from '@/data/teams'

/**
 * Placeholder "headshot": a team-liveried helmet plate with the car number.
 * Swap the <svg> for an <img src={driver.photo}> when real portraits exist.
 */
export function Headshot({
  name,
  number,
  team,
  className = '',
}: {
  name: string
  number: number
  team: TeamId
  className?: string
}) {
  const t = teamById(team)
  const uid = `hs-${number}`
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={`${name} helmet avatar`}
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id={`${uid}-bg`} cx="50%" cy="38%" r="75%">
          <stop offset="0%" stopColor={t.color} stopOpacity="0.34" />
          <stop offset="60%" stopColor="#0a0b0e" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#050507" />
        </radialGradient>
        <linearGradient id={`${uid}-shell`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2f3f5" />
          <stop offset="55%" stopColor="#c9ccd3" />
          <stop offset="100%" stopColor="#8d919b" />
        </linearGradient>
        <linearGradient id={`${uid}-visor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b3f49" />
          <stop offset="100%" stopColor="#0b0c10" />
        </linearGradient>
      </defs>

      <rect width="200" height="200" fill={`url(#${uid}-bg)`} />

      {/* helmet */}
      <g>
        <path
          d="M100 44c-31 0-55 23-55 53v14c0 9 7 16 16 16h78c9 0 16-7 16-16V97c0-30-24-53-55-53Z"
          fill={`url(#${uid}-shell)`}
        />
        {/* chin bar */}
        <path d="M64 122h72v10c0 6-5 11-11 11H75c-6 0-11-5-11-11v-10Z" fill={`url(#${uid}-shell)`} />
        {/* visor */}
        <path
          d="M56 84c14-7 30-10 44-10s30 3 44 10v24c0 6-5 11-11 11H67c-6 0-11-5-11-11V84Z"
          fill={`url(#${uid}-visor)`}
        />
        {/* livery stripe */}
        <path d="M45 74c16-9 34-13 55-13s39 4 55 13v9c-16-9-34-13-55-13s-39 4-55 13v-9Z" fill={t.color} />
        <path d="M100 44c-8 0-15 1-22 4l6 17c5-2 10-3 16-3s11 1 16 3l6-17c-7-3-14-4-22-4Z" fill={t.livery.accent} />
        {/* highlight */}
        <path d="M78 50c8-4 15-6 22-6s14 2 22 6c-8 4-15 6-22 6s-14-2-22-6Z" fill="#ffffff" opacity="0.35" />
      </g>

      {/* number */}
      <text
        x="164"
        y="188"
        textAnchor="end"
        fontFamily="Saira Condensed, Arial Narrow, sans-serif"
        fontWeight="800"
        fontSize="58"
        fill="#f4f5f7"
        opacity="0.92"
      >
        {number}
      </text>
      <rect x="16" y="166" width="46" height="4" fill={t.color} />
    </svg>
  )
}
