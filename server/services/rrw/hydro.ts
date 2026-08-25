import { initWater, tickWater, volume } from '../ues-fnws/cycle.js'
import { describeWater } from './water.js'

export const materializeOcean = (temperatureK = 287) => {
  const heights = [
    [-1, -1, -0.4],
    [-1, 0.2, 0.1],
    [-0.8, 0.4, 0.3],
  ]
  const start = initWater(heights)
  const before = volume(start)
  const next = tickWater(heights, { depth: start, evaporated: 0, rained: 0 }, 0, 0)
  const after = volume(next.depth)
  const substance = describeWater(temperatureK)
  return {
    formula: substance.formula,
    shaderWater: substance.shaderWater,
    heightfieldIsIdentity: false as const,
    fnwsIsIdentity: false as const,
    conserved: Math.abs(after - before) < 1e-9,
    volume: Number(after.toFixed(6)),
  }
}
