/**
 * Clickable regions of the 3D car — every entry pairs a mesh group id with
 * the copy shown in its hover tooltip and detail panel.
 */
export type CarPartId =
  | 'front-wing'
  | 'rear-wing'
  | 'halo'
  | 'engine-cover'
  | 'sidepods'
  | 'tires'
  | 'floor'
  | 'cockpit'

export type CarPart = {
  id: CarPartId
  label: string
  tag: string
  summary: string
  detail: string
}

export const CAR_PARTS: Record<CarPartId, CarPart> = {
  'front-wing': {
    id: 'front-wing',
    label: 'Front Wing',
    tag: 'Aerodynamics',
    summary: 'Generates front downforce and controls flow to the floor.',
    detail:
      'The first thing that meets clean air: stacked flaps angle onto the flow to press the front axle down, while endplates and vanes steer wake around the rotating front tyres. Setup changes here transform turn-in balance.',
  },
  'rear-wing': {
    id: 'rear-wing',
    label: 'Rear Wing + DRS',
    tag: 'Aerodynamics',
    summary: 'Rear stability, straight-line drag — and the overtaking button.',
    detail:
      'Works with the diffuser to load the rear axle. The upper flap opens via DRS on straights, cutting drag and handing a speed advantage in the chase. 2026 cars switch to active, driver-adjustable wings.',
  },
  halo: {
    id: 'halo',
    label: 'Halo',
    tag: 'Safety',
    summary: 'A titanium ring rated to withstand the weight of a bus.',
    detail:
      'Introduced in 2018, the halo deflects wheels and debris away from the cockpit and adds structural integrity in a roll. It is the single safety device credited with saving multiple lives across single-seater series.',
  },
  'engine-cover': {
    id: 'engine-cover',
    label: 'Engine Cover',
    tag: 'Power Unit',
    summary: 'Shrouds the V6 hybrid and its energy recovery systems.',
    detail:
      'Underneath sits the 1.6L V6 turbo-hybrid: an MGU-K harvesting braking energy, an MGU-H spooling the turbo, and a 3.5MJ battery. The cover shapes air into the rear wing while venting heat from the radiators.',
  },
  sidepods: {
    id: 'sidepods',
    label: 'Sidepods',
    tag: 'Cooling',
    summary: 'Radiator housings that sculpt the airflow to the floor.',
    detail:
      'Sidepods package the cooling cores while channeling air through the undercut and along the floor edges. Their shape dictates how much clean flow reaches the diffuser — the biggest downforce lever of the ground-effect era.',
  },
  tires: {
    id: 'tires',
    label: 'Tyres',
    tag: 'Mechanical',
    summary: 'The only contact patch between 800+ hp and the tarmac.',
    detail:
      'Five compounds, three dry choices per weekend, plus intermediates and wets. Tyre window, degradation and warm-up strategy decide more races than raw pace — and the 2026 cars are lighter, kinder to rubber.',
  },
  floor: {
    id: 'floor',
    label: 'Floor + Diffuser',
    tag: 'Aerodynamics',
    summary: 'Ground-effect tunnels generate most of the car’s downforce.',
    detail:
      'Venturi tunnels under the floor accelerate air, dropping pressure and sucking the car onto the road. The diffuser at the rear expands the flow back to ambient pressure — small ride-height changes yield huge grip swings.',
  },
  cockpit: {
    id: 'cockpit',
    label: 'Cockpit',
    tag: 'Driver',
    summary: 'Seven point of restraints, a carbon survival cell and a screen of data.',
    detail:
      'The monocoque is a carbon-fibre survival cell with the driver belted in by a seven-point harness. Behind the wheel: dyno-style rotary controls for brake balance, engine modes, differential and energy deployment.',
  },
}
