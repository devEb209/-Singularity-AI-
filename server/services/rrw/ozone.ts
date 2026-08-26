import { composeWithStructures } from './structure.js'
import { beerLambert } from './matter.js'
import { solarSpectrum } from './spectrum.js'
import type { RealityNode } from './types.js'

export const ozoneAttenuate = (nodes: RealityNode[], path = 12) => {
  const air = nodes.find(item => item.id === 'atmosphere')
  const o2 = air?.inventory?.find(item => item.substanceId === 'O2')?.moles ?? 0
  const extra = Math.min(1.8, o2 * 0.04)
  const sun = solarSpectrum()
  const uvClear = beerLambert(sun.uv, 0.08, path)
  const uvOzone = beerLambert(sun.uv, 0.08 + extra, path)
  return {
    nodes,
    uvClear,
    uvOzone,
    protects: uvOzone < uvClear,
    o3Inventory: false as const,
    nistAssay: false as const,
  }
}

export const compareOzone = (prompt = 'oceano salgado com um humano e um abrigo') => {
  const stepped = ozoneAttenuate(composeWithStructures(prompt).nodes)
  return { protects: stepped.protects, nistAssay: stepped.nistAssay, o3Inventory: stepped.o3Inventory }
}
