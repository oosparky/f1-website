/**
 * The four teams represented on this site (2026 season).
 * Colours drive UI accents AND the 3D car liveries.
 */
export type TeamId = 'mercedes' | 'ferrari' | 'mclaren' | 'redbull'

export type Livery = {
  /** main bodywork */
  primary: string
  /** wings / nose / engine cover contrast */
  secondary: string
  /** stripe + detail highlights */
  accent: string
}

export type Team = {
  id: TeamId
  name: string
  short: string
  powerUnit: string
  base: string
  /** UI accent colour */
  color: string
  livery: Livery
  /** Drivers' 2026 points combined (as of Italian GP) */
  points2026: number
  blurb: string
}

export const TEAMS: Team[] = [
  {
    id: 'mercedes',
    name: 'Mercedes-AMG Petronas',
    short: 'Mercedes',
    powerUnit: 'Mercedes',
    base: 'Brackley, UK',
    color: '#00d2b4',
    livery: { primary: '#101318', secondary: '#00d2b4', accent: '#c9ced6' },
    points2026: 468,
    blurb:
      'The silver arrows lean into the 2026 regulation reset with a young, aggressive line-up — Antonelli alongside Russell.',
  },
  {
    id: 'ferrari',
    name: 'Scuderia Ferrari HP',
    short: 'Ferrari',
    powerUnit: 'Ferrari',
    base: 'Maranello, Italy',
    color: '#e10600',
    livery: { primary: '#e10600', secondary: '#141418', accent: '#ffd24a' },
    points2026: 346,
    blurb:
      'Rosso corsa, the prancing horse and the most decorated driver in history chasing number eight.',
  },
  {
    id: 'mclaren',
    name: 'McLaren Formula 1 Team',
    short: 'McLaren',
    powerUnit: 'Mercedes',
    base: 'Woking, UK',
    color: '#ff7a00',
    livery: { primary: '#ff7a00', secondary: '#16181e', accent: '#2e7bff' },
    points2026: 287,
    blurb:
      'The papaya crew — reigning constructors’ momentum, Norris and Piastri trading blows all season.',
  },
  {
    id: 'redbull',
    name: 'Oracle Red Bull Racing',
    short: 'Red Bull',
    powerUnit: 'Red Bull Ford',
    base: 'Milton Keynes, UK',
    color: '#3671c6',
    livery: { primary: '#14245c', secondary: '#e10600', accent: '#ffd400' },
    points2026: 198,
    blurb:
      'Four-time champion Verstappen with rookie sensation Hadjar, powered by the new Red Bull Ford unit.',
  },
]

export const teamById = (id: TeamId): Team => TEAMS.find((t) => t.id === id)!
