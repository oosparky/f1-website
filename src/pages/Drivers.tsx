import { DriverGrid } from '@/components/drivers/DriverGrid'
import { SectionHeading } from '@/components/SectionHeading'

export default function Drivers() {
  return (
    <div id="top" className="relative z-10 min-h-screen px-5 pb-24 pt-32 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="01"
          as="h1"
          kicker="Drivers"
          title="The 2026 grid"
          lead="Eight championship contenders with career records, season numbers and official Instagram links. Search, or filter by team and nationality."
        />
        <div className="mt-10">
          <DriverGrid />
        </div>
      </div>
    </div>
  )
}
