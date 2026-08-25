import type { RealityNode } from './types.js'

export const climateAt = (nodes: RealityNode[], point: [number, number, number]) => {
  const ocean = nodes.find(item => item.id === 'ocean')
  const air = nodes.find(item => item.id === 'atmosphere')
  const cloud = nodes.find(item => item.id === 'cloud')
  const height = point[1]
  const lapse = air ? air.temperatureK - height * 6.5 : 288 - height * 6.5
  const moisture = (ocean ? 0.55 : 0.2) + (cloud ? 0.2 : 0)
  return {
    temperatureK: Number(lapse.toFixed(3)),
    moisture: Number(Math.max(0, Math.min(1, moisture)).toFixed(3)),
    pressurePa: Math.round(101325 * Math.exp(-height / 8500)),
    nasaRequired: false as const,
  }
}
