import { composeReality } from './compose.js'
import type { RealityNode, RealityRelation } from './types.js'

const has = (hay: string, keys: string[]) => keys.some(key => hay.includes(key))

export const parseStructures = (prompt: string) => {
  const hay = prompt.toLowerCase()
  const wantsShelter = has(hay, ['abrigo', 'casa', 'shelter', 'cabana', 'teto', 'habitar', 'morar', 'povoado', 'aldeia'])
  const wantsPath = has(hay, ['caminho', 'trilha', 'path', 'estrada', 'ponte', 'abrigo', 'habitar'])
  return { wantsShelter, wantsPath, meshPrefab: false as const }
}

export const shelterNode = (): RealityNode => ({
  id: 'shelter',
  kind: 'structure',
  label: 'silicate shelter',
  substanceId: 'SiO2',
  temperatureK: 292,
  pressurePa: 101325,
  phase: 'solid',
  extent: { kind: 'box', min: [1.2, 0, 2.4], max: [2.4, 1.8, 3.6] },
  emissionScale: 0,
  claims: [],
  inventory: [{ substanceId: 'SiO2', moles: 24 }],
  domain: 'society',
})

export const pathNode = (): RealityNode => ({
  id: 'path',
  kind: 'structure',
  label: 'packed earth path',
  substanceId: 'SiO2',
  temperatureK: 291,
  pressurePa: 101325,
  phase: 'solid',
  extent: { kind: 'box', min: [-2.2, -0.05, 0.8], max: [0.5, 0.08, 3.7] },
  emissionScale: 0,
  claims: [],
  inventory: [{ substanceId: 'SiO2', moles: 8 }],
  domain: 'society',
})

export const placeStructures = (nodes: RealityNode[], relations: RealityRelation[], prompt: string) => {
  const wanted = parseStructures(prompt)
  const extra: RealityNode[] = []
  const nextRelations = [...relations]
  if (wanted.wantsShelter && !nodes.some(item => item.id === 'shelter')) {
    extra.push(shelterNode())
    nextRelations.push({ from: 'human', to: 'shelter', kind: 'on' })
    nextRelations.push({ from: 'shelter', to: 'terrain', kind: 'on' })
  }
  if (wanted.wantsPath && !nodes.some(item => item.id === 'path')) {
    extra.push(pathNode())
    nextRelations.push({ from: 'path', to: 'terrain', kind: 'on' })
  }
  return {
    nodes: [...nodes, ...extra],
    relations: nextRelations,
    added: extra.map(item => item.id),
    meshPrefab: false as const,
    assetHouse: false as const,
  }
}

export const composeWithStructures = (prompt: string) => {
  const composed = composeReality(prompt)
  const placed = placeStructures(composed.nodes, composed.relations, prompt)
  return {
    ...composed,
    nodes: placed.nodes,
    relations: placed.relations,
    structures: placed.added,
    meshPrefab: placed.meshPrefab,
  }
}
