import { orderEvents, type RealityEvent } from './clock.js'

export interface CausalEvent extends RealityEvent {
  requires: string[]
  produces: string[]
}

export const scheduleCausalDay = (): CausalEvent[] => [
  { at: 0, kind: 'observe', note: 'observer couples to ocean and fire', requires: [], produces: ['observation'] },
  { at: 0.15, kind: 'grasp', note: 'human reaches iron tool', requires: ['observation'], produces: ['grasp'] },
  { at: 0.35, kind: 'evolve', note: 'heat, chemistry and phase', requires: ['observation'], produces: ['heat'] },
  { at: 0.55, kind: 'hydro', note: 'water continuum materialization', requires: ['heat'], produces: ['hydro'] },
  { at: 0.75, kind: 'rain', note: 'atmosphere exchanges with ocean', requires: ['hydro'], produces: ['rain'] },
]

export const readyAt = (events: CausalEvent[], produced: Set<string>, time: number) =>
  events.filter(item => item.at <= time && item.requires.every(key => produced.has(key)))

export const runCausal = () => {
  const events = orderEvents(scheduleCausalDay()) as CausalEvent[]
  const produced = new Set<string>()
  const fired: string[] = []
  for (const event of events) {
    if (!event.requires.every(key => produced.has(key))) continue
    fired.push(event.kind)
    for (const key of event.produces) produced.add(key)
  }
  return { order: fired, produced: [...produced], gameplayLoop: false as const }
}
