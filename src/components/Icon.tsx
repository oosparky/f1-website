export type IconName =
  | 'menu'
  | 'close'
  | 'arrow-right'
  | 'arrow-left'
  | 'external'
  | 'instagram'
  | 'mail'
  | 'search'
  | 'volume'
  | 'volume-off'
  | 'rotate'
  | 'zoom'
  | 'trophy'
  | 'target'
  | 'flag'
  | 'calendar'
  | 'check'
  | 'chevron-down'
  | 'car'

type Props = React.SVGProps<SVGSVGElement> & { name: IconName; size?: number }

const PATHS: Record<IconName, React.ReactNode> = {
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  close: <path d="M5 5l14 14M19 5L5 19" />,
  'arrow-right': <path d="M4 12h16m-6-6 6 6-6 6" />,
  'arrow-left': <path d="M20 12H4m6-6-6 6 6 6" />,
  external: <path d="M14 4h6v6M20 4 10 14M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />,
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  volume: <path d="M11 5 6 9H3v6h3l5 4V5Zm4.5 3.5a5 5 0 0 1 0 7M18 6a8 8 0 0 1 0 12" />,
  'volume-off': <path d="M11 5 6 9H3v6h3l5 4V5Zm5 5 4 4m0-4-4 4" />,
  rotate: (
    <>
      <path d="M12 3a9 9 0 1 0 9 9" />
      <path d="M12 3v4M12 3H8" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  zoom: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5M8 11h6M11 8v6" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4a3 3 0 0 0 3 3M17 6h3a3 3 0 0 1-3 3M9 20h6M12 14v6" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.5" />
    </>
  ),
  flag: <path d="M5 21V4m0 0h10l-1.5 3L15 10H5" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  check: <path d="m4 12 5 5L20 6" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  car: (
    <>
      <path d="M3 13h18M5.5 13 7 8h10l1.5 5M4 13v4M20 13v4" />
      <circle cx="7.5" cy="17" r="1.8" />
      <circle cx="16.5" cy="17" r="1.8" />
    </>
  ),
}

export function Icon({ name, size = 18, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  )
}
