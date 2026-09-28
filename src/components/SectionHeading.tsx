import { Reveal } from './Reveal'

type Props = {
  index?: string
  kicker?: string
  title: string
  lead?: string
  align?: 'left' | 'center'
  /** Page-top headings use h1 so every route has a top-level heading. */
  as?: 'h1' | 'h2'
}

export function SectionHeading({ index, kicker, title, lead, align = 'left', as = 'h2' }: Props) {
  const Heading = as
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-3xl'}>
      <Reveal>
        <div
          className={`flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-mute ${align === 'center' ? 'justify-center' : ''}`}
        >
          {index && <span className="text-race-red">{index}</span>}
          <span className="h-px w-8 bg-hairline" />
          <span>{kicker ?? 'Section'}</span>
        </div>
      </Reveal>
      <Reveal delay={0.05}>
        <Heading className="mt-4 text-4xl sm:text-5xl md:text-6xl">{title}</Heading>
      </Reveal>
      {lead && (
        <Reveal delay={0.1}>
          <p className="mt-4 text-base leading-relaxed text-fog sm:text-lg">{lead}</p>
        </Reveal>
      )}
    </div>
  )
}
