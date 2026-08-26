import { chooseRepresentation } from '../ues-represent/choose.js'
import { flow, initWater, tickWater, volume } from './cycle.js'
import { shallowStep } from './shallow.js'
import { oceanWaves, pressure } from './waves.js'

export type WaterLevel = 'dormant' | 'aggregate' | 'shallow' | 'detailed'

export const waterLevel = (distance: number, influence: number): WaterLevel => {
  const choice = chooseRepresentation({
    domain: 'particle',
    influence,
    distance,
    visible: distance < 24,
    interactive: distance < 6,
    reconstructable: true,
  })
  if (choice.kind === 'dormant' || choice.kind === 'reconstructable') return 'dormant'
  if (choice.kind === 'procedural' || choice.kind === 'simplified') return 'aggregate'
  if (choice.kind === 'instanced') return 'shallow'
  return 'detailed'
}

export const runLevel = (heights: number[][], level: WaterLevel, wind = 0, objects: { x: number; z: number; radius: number }[] = []) => {
  const initial = initWater(heights)
  if (level === 'dormant') return { level, volume: volume(initial), ticks: 0, waves: 0, pressure: 0, displaced: 0 }
  if (level === 'aggregate') {
    const moved = flow(heights, initial.map(row => row.slice()), 0.25)
    return { level, volume: volume(moved), ticks: 1, waves: 0, pressure: pressure(volume(moved) / (heights.length ** 2)), displaced: 0 }
  }
  if (level === 'shallow') {
    const step = shallowStep(initial, heights, 0.12)
    return { level, volume: step.volume, ticks: 1, waves: 0, pressure: pressure(0.2), displaced: 0 }
  }
  let state = { depth: initial.map(row => row.slice()), evaporated: 0, rained: 0 }
  for (let i = 0; i < 3; i++) state = tickWater(heights, state, wind > 0.4 ? 0.012 : 0.006, 0.004)
  let displaced = 0
  for (const object of objects) {
    const x = Math.max(0, Math.min(heights.length - 1, Math.round(object.x)))
    const z = Math.max(0, Math.min(heights.length - 1, Math.round(object.z)))
    const take = Math.min(state.depth[z][x], object.radius * 0.15)
    state.depth[z][x] -= take
    displaced += take
  }
  return {
    level,
    volume: volume(state.depth),
    ticks: 3,
    waves: oceanWaves(heights, 0.8 + wind).length,
    pressure: pressure(0.35),
    displaced: Number(displaced.toFixed(5)),
  }
}
