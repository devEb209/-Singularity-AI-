export type RealityEventKind = 'evolve' | 'rain' | 'observe' | 'grasp' | 'hydro'

export interface RealityEvent {
  at: number
  kind: RealityEventKind
  note: string
}

export const scheduleDay = (): RealityEvent[] => [
  { at: 0, kind: 'observe', note: 'observer couples to ocean and fire' },
  { at: 0.2, kind: 'grasp', note: 'human reaches iron tool' },
  { at: 0.5, kind: 'evolve', note: 'heat and phase' },
  { at: 0.8, kind: 'hydro', note: 'water continuum materialization' },
  { at: 1, kind: 'rain', note: 'atmosphere exchanges with ocean' },
]

export const orderEvents = (events: RealityEvent[]) => [...events].sort((a, b) => a.at - b.at)
