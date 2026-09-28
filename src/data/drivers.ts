/**
 * 2026 grid — standings as of the Italian Grand Prix.
 *
 * Points / wins / championships are the figures supplied for this project.
 * Career poles, podiums, races, points, DNFs and the 2026 podium counts are
 * reasonable figures for the same point in the season — edit anything here,
 * everything else on the site reads from these objects.
 */
import type { TeamId } from './teams'

export type CareerStats = {
  championships: number
  wins: number
  poles: number
  podiums: number
  debut: number
  races: number
  points: number
  dnfs: number
}

export type SeasonStats = {
  points: number
  wins: number
  podiums: number
}

export type Driver = {
  slug: string
  name: string
  first: string
  last: string
  number: number
  nationality: string
  flag: string
  team: TeamId
  instagram: string
  headline: string
  bio: string
  career: CareerStats
  season: SeasonStats
}

export const DRIVERS: Driver[] = [
  {
    slug: 'kimi-antonelli',
    name: 'Kimi Antonelli',
    first: 'Kimi',
    last: 'Antonelli',
    number: 12,
    nationality: 'Italian',
    flag: '🇮🇹',
    team: 'mercedes',
    instagram: 'kimi.antonelli',
    headline: 'Mercedes’ young gun leading the 2026 charge',
    bio: 'Thrust into a works Mercedes seat straight from junior formulae, Antonelli has turned potential into wins. Seven victories in2026 have made him the surprise championship leader and the youngest front-runner of his generation.',
    career: { championships: 0, wins: 7, poles: 3, podiums: 16, debut: 2025, races: 42, points: 452, dnfs: 5 },
    season: { points: 267, wins: 7, podiums: 12 },
  },
  {
    slug: 'george-russell',
    name: 'George Russell',
    first: 'George',
    last: 'Russell',
    number: 63,
    nationality: 'British',
    flag: '🇬🇧',
    team: 'mercedes',
    instagram: 'georgerussell63',
    headline: 'The qualifying specialist turned team leader',
    bio: 'A Williams graduate who dragged midfield machinery onto podiums, Russell now leads Mercedes’ experienced core. Razor-sharp on Saturdays and relentless in race trim, he remains in the fight at every round.',
    career: { championships: 0, wins: 7, poles: 5, podiums: 31, debut: 2019, races: 148, points: 1010, dnfs: 15 },
    season: { points: 201, wins: 1, podiums: 9 },
  },
  {
    slug: 'lewis-hamilton',
    name: 'Lewis Hamilton',
    first: 'Lewis',
    last: 'Hamilton',
    number: 44,
    nationality: 'British',
    flag: '🇬🇧',
    team: 'ferrari',
    instagram: 'lewishamilton',
    headline: 'Seven titles, one red dream',
    bio: 'The most successful driver in Formula 1 history chased his childhood dream to Maranello. With 105+ wins and a record-breaking haul of poles, Hamilton is chasing the one trophy missing from his cabinet: a title in red.',
    career: { championships: 7, wins: 105, poles: 104, podiums: 202, debut: 2007, races: 372, points: 5100, dnfs: 26 },
    season: { points: 191, wins: 0, podiums: 8 },
  },
  {
    slug: 'lando-norris',
    name: 'Lando Norris',
    first: 'Lando',
    last: 'Norris',
    number: 1,
    nationality: 'British',
    flag: '🇬🇧',
    team: 'mclaren',
    instagram: 'landonorris',
    headline: 'The reigning world champion carrying number 1',
    bio: 'Norris ended McLaren’s title drought in 2025 and now runs the number one plate. Aggressive in wheel-to-wheel combat and lethal in the wet, he is the benchmark the whole grid is chasing.',
    career: { championships: 1, wins: 14, poles: 9, podiums: 46, debut: 2019, races: 147, points: 1130, dnfs: 18 },
    season: { points: 171, wins: 1, podiums: 9 },
  },
  {
    slug: 'charles-leclerc',
    name: 'Charles Leclerc',
    first: 'Charles',
    last: 'Leclerc',
    number: 16,
    nationality: 'Monegasque',
    flag: '🇲🇨',
    team: 'ferrari',
    instagram: 'charles_leclerc',
    headline: 'Qualifying wizard chasing his first crown',
    bio: 'Born in Monaco and forged at the Enzo Ferrari circuit, Leclerc is one of the fastest single-lap talents on the grid. Eight career wins and a string of poles have kept the tifosi dreaming of a drivers’ title.',
    career: { championships: 0, wins: 8, poles: 26, podiums: 47, debut: 2018, races: 167, points: 1540, dnfs: 30 },
    season: { points: 155, wins: 0, podiums: 7 },
  },
  {
    slug: 'max-verstappen',
    name: 'Max Verstappen',
    first: 'Max',
    last: 'Verstappen',
    number: 3,
    nationality: 'Dutch',
    flag: '🇳🇱',
    team: 'redbull',
    instagram: 'maxverstappen1',
    headline: 'Four-time champion hunting a fifth',
    bio: 'The youngest-ever winner in F1 history redefined the modern era with four consecutive titles between 2021 and 2024. Brutally efficient in the wet and peerless in race craft, Verstappen remains the sport’s most feared competitor.',
    career: { championships: 4, wins: 71, poles: 43, podiums: 116, debut: 2015, races: 221, points: 3410, dnfs: 31 },
    season: { points: 127, wins: 0, podiums: 9 },
  },
  {
    slug: 'oscar-piastri',
    name: 'Oscar Piastri',
    first: 'Oscar',
    last: 'Piastri',
    number: 81,
    nationality: 'Australian',
    flag: '🇦🇺',
    team: 'mclaren',
    instagram: 'oscarpiastri',
    headline: 'Ice-cool Australian in the papaya seat',
    bio: 'Champion in every junior category he touched, Piastri graduated to F1 and won immediately. Methodical, unflappable and rapid, he is the quiet half of McLaren’s explosive driver pairing.',
    career: { championships: 0, wins: 8, poles: 8, podiums: 31, debut: 2023, races: 87, points: 620, dnfs: 8 },
    season: { points: 116, wins: 0, podiums: 6 },
  },
  {
    slug: 'isack-hadjar',
    name: 'Isack Hadjar',
    first: 'Isack',
    last: 'Hadjar',
    number: 6,
    nationality: 'French',
    flag: '🇫🇷',
    team: 'redbull',
    instagram: 'isackhadjar',
    headline: 'Rookie promoted to the top seat',
    bio: 'A single podium and a string of points finishes earned Hadjar the call-up from Racing Bulls to Red Bull. Paris-born and fearless, he is the breakout rookie of the 2026 season.',
    career: { championships: 0, wins: 0, poles: 0, podiums: 1, debut: 2025, races: 40, points: 92, dnfs: 6 },
    season: { points: 71, wins: 0, podiums: 1 },
  },
]

export const driverBySlug = (slug: string): Driver | undefined =>
  DRIVERS.find((d) => d.slug === slug)

export const NATIONALITIES = [...new Set(DRIVERS.map((d) => d.nationality))].sort()

export const instagramUrl = (handle: string) => `https://www.instagram.com/${handle}/`
