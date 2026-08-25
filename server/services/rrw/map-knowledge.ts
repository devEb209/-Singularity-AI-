import type { KnowledgeClaim, RealityNode } from './types.js'

export interface TerrainSample {
  height: number
  moisture: number
}

const claim = (id: string, statement: string): KnowledgeClaim => ({
  id,
  statement,
  state: 'LIKELY',
  inferred: true,
  source: 'map-knowledge',
})

export const interpretMap = (grid: TerrainSample[][]) => {
  const claims: KnowledgeClaim[] = []
  const nodes: Pick<RealityNode, 'id' | 'domain' | 'label'>[] = []
  let wetland = 0
  let ridge = 0
  let dry = 0
  grid.forEach((row, z) => {
    row.forEach((cell, x) => {
      if (cell.moisture > 0.55 && cell.height < 0.35) {
        wetland += 1
        claims.push(claim(`wet-${x}-${z}`, `basin ${x},${z} holds water`))
      } else if (cell.height > 0.7) {
        ridge += 1
        claims.push(claim(`ridge-${x}-${z}`, `ridge ${x},${z} is silicate relief`))
      } else if (cell.moisture < 0.2) {
        dry += 1
        claims.push(claim(`dry-${x}-${z}`, `cell ${x},${z} is dry mineral soil`))
      }
    })
  })
  if (wetland) nodes.push({ id: 'map-basin', domain: 'oceans', label: 'reconstructed basin' })
  if (ridge) nodes.push({ id: 'map-ridge', domain: 'geology', label: 'reconstructed ridge' })
  if (dry) nodes.push({ id: 'map-dry', domain: 'geology', label: 'reconstructed dry soil' })
  return {
    claims,
    nodes,
    wetland,
    ridge,
    dry,
    heightfieldIsIdentity: false as const,
    meshIsFoundation: false as const,
    pastedHeightmap: false as const,
    inferenceIsFact: false as const,
  }
}

export const fixtureCoastMap = (): TerrainSample[][] => {
  const grid: TerrainSample[][] = []
  for (let z = 0; z < 8; z++) {
    const row: TerrainSample[] = []
    for (let x = 0; x < 8; x++) {
      const height = z < 3 ? 0.15 + x * 0.02 : 0.45 + (z - 3) * 0.12
      const moisture = z < 3 ? 0.8 - x * 0.04 : 0.25
      row.push({ height, moisture })
    }
    grid.push(row)
  }
  return grid
}
