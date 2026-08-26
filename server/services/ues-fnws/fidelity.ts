import { chooseRepresentation } from '../ues-represent/choose.js'
import { flow, initWater, tickWater, volume } from './cycle.js'

export const waterFidelity = (heights: number[][], viewer: [number, number], distance: number) => {
  const choice = chooseRepresentation({
    domain: 'particle',
    influence: distance < 4 ? 0.8 : distance < 12 ? 0.35 : 0.08,
    distance,
    visible: distance < 20,
    interactive: distance < 6,
    reconstructable: true,
  })
  const initial = initWater(heights)
  if (choice.kind === 'dormant' || choice.kind === 'reconstructable' || !choice.simulate) {
    return { kind: choice.kind, volume: volume(initial), ticks: 0, detailed: false }
  }
  if (choice.kind === 'simplified' || choice.kind === 'procedural') {
    const moved = flow(heights, initial.map(row => row.slice()))
    return { kind: choice.kind, volume: volume(moved), ticks: 1, detailed: false }
  }
  let state = { depth: initial.map(row => row.slice()), evaporated: 0, rained: 0 }
  for (let i = 0; i < 4; i++) state = tickWater(heights, state, 0.015, 0.008)
  return { kind: choice.kind, volume: volume(state.depth), ticks: 4, detailed: true, rained: state.rained }
}
