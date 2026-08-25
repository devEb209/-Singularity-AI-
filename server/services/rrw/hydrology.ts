import { composeReality } from './compose.js'
import { molesOf, setMoles } from './extent.js'
import { waterMoles } from './exchange.js'
import type { RealityNode } from './types.js'

const addWater = (node: RealityNode, delta: number) =>
  ({ ...node, inventory: setMoles(node.inventory ?? [], 'H2O', Math.max(0, molesOf(node, 'H2O') + delta)) })

const evapFrom = (node: RealityNode | undefined, rate: number) => {
  if (!node) return 0
  const available = molesOf(node, 'H2O')
  const thermal = Math.max(0, node.temperatureK - 255) / 50
  return Math.min(available * 0.08, available * rate * thermal)
}

export const cycleWater = (nodes: RealityNode[], dt = 1) => {
  const before = waterMoles(nodes)
  const ocean = nodes.find(item => item.id === 'ocean')
  const river = nodes.find(item => item.id === 'river')
  const soil = nodes.find(item => item.id === 'soil')
  const air = nodes.find(item => item.id === 'atmosphere')
  const cloud = nodes.find(item => item.id === 'cloud')
  const evapOcean = evapFrom(ocean, 0.012 * dt)
  const evapRiver = evapFrom(river, 0.02 * dt)
  const evapSoil = evapFrom(soil, 0.03 * dt)
  const airWater = air ? molesOf(air, 'H2O') + evapOcean + evapRiver + evapSoil : 0
  const condense = cloud ? Math.min(airWater * 0.18, Math.max(0, 280 - cloud.temperatureK) / 40 * airWater * 0.25) : 0
  const cloudWater = (cloud ? molesOf(cloud, 'H2O') : 0) + condense
  const rain = Math.min(cloudWater * 0.14, cloudWater * Math.max(0.02, (cloud ? 275 - cloud.temperatureK : 0) / 80))
  const toOcean = rain * 0.55
  const toSoil = rain * 0.3
  const toRiver = rain * 0.15
  const soilAfterRain = (soil ? molesOf(soil, 'H2O') : 0) - evapSoil + toSoil
  const percolate = Math.max(0, Math.min(soilAfterRain * 0.08, soilAfterRain - 0.05))
  const riverAfter = (river ? molesOf(river, 'H2O') : 0) - evapRiver + toRiver + percolate
  const runoff = Math.max(0, Math.min(riverAfter * 0.1, riverAfter - 0.2))
  const next = nodes.map(node => {
    if (node.id === 'ocean') return addWater(node, -evapOcean + toOcean + runoff)
    if (node.id === 'river') return addWater(node, -evapRiver + toRiver + percolate - runoff)
    if (node.id === 'soil') return addWater(node, -evapSoil + toSoil - percolate)
    if (node.id === 'atmosphere') return addWater(node, evapOcean + evapRiver + evapSoil - condense)
    if (node.id === 'cloud') return addWater(node, condense - rain)
    return node
  })
  const after = waterMoles(next)
  return {
    nodes: next,
    before,
    after,
    conserved: Math.abs(after - before) < 1e-9,
    evap: evapOcean + evapRiver + evapSoil,
    rain,
    percolate,
    runoff,
    shaderWater: false as const,
  }
}

export const compareHydrology = () => {
  const desert = cycleWater(composeReality('deserto quente e árido').nodes)
  const wetland = cycleWater(composeReality('pântano úmido').nodes)
  const desertSoil = molesOf(desert.nodes.find(item => item.id === 'soil')!, 'H2O')
  const wetSoil = molesOf(wetland.nodes.find(item => item.id === 'soil')!, 'H2O')
  return {
    desertConserved: desert.conserved,
    wetlandConserved: wetland.conserved,
    wetlandWetterSoil: wetSoil > desertSoil,
    desertSoil,
    wetSoil,
    shaderWater: false as const,
  }
}
