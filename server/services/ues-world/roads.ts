import { astar } from '../ues-nav/pathfind.js'
import { hashSeed, hypot2, inBounds, rng, type Cell } from '../ues-shared/math.js'
import type { RoadGraph, Terrain } from './types.js'

const walkableFromTerrain = (terrain: Terrain) => {
  const walkable = terrain.biomes.map((row, z) => row.map((biome, x) => biome !== 'alpine' || terrain.slopes[z][x] < 1.8))
  const cost = terrain.slopes.map((row, z) => row.map((slope, x) => {
    const biome = terrain.biomes[z][x]
    return 1 + slope * 2.2 + (biome === 'wetland' ? 1.6 : 0) + (biome === 'alpine' ? 3.4 : 0)
  }))
  return { walkable, cost }
}

export const pickSettlementSeeds = (terrain: Terrain, count = 4): Cell[] => {
  const random = rng(terrain.seed ^ 0x51c3)
  const candidates: { cell: Cell; score: number }[] = []
  for (let z = 2; z < terrain.size - 2; z++) {
    for (let x = 2; x < terrain.size - 2; x++) {
      const biome = terrain.biomes[z][x]
      if (biome === 'alpine' || biome === 'wetland') continue
      if (terrain.slopes[z][x] > 0.85) continue
      candidates.push({ cell: [x, z], score: (biome === 'grassland' ? 1.2 : 1) + random() })
    }
  }
  candidates.sort((a, b) => b.score - a.score)
  const chosen: Cell[] = []
  for (const item of candidates) {
    if (chosen.every(other => hypot2(other, item.cell) >= Math.max(6, terrain.size / 6))) {
      chosen.push(item.cell)
      if (chosen.length >= count) break
    }
  }
  if (!chosen.length) chosen.push([Math.floor(terrain.size / 2), Math.floor(terrain.size / 2)])
  return chosen
}

const paint = (cells: boolean[][], path: Cell[], size: number) => {
  for (const [x, z] of path) if (inBounds(x, z, size)) cells[z][x] = true
}

const raster = (a: Cell, b: Cell): Cell[] => {
  const cells: Cell[] = []
  const dx = Math.abs(b[0] - a[0])
  const dz = Math.abs(b[1] - a[1])
  const sx = a[0] < b[0] ? 1 : -1
  const sz = a[1] < b[1] ? 1 : -1
  let err = dx - dz
  let x = a[0]
  let z = a[1]
  while (true) {
    cells.push([x, z])
    if (x === b[0] && z === b[1]) break
    const e2 = 2 * err
    if (e2 > -dz) {
      err -= dz
      x += sx
    }
    if (e2 < dx) {
      err += dx
      z += sz
    }
  }
  return cells
}

export const generateRoads = (terrain: Terrain, seeds = pickSettlementSeeds(terrain)): RoadGraph => {
  const { walkable, cost } = walkableFromTerrain(terrain)
  const cells = Array.from({ length: terrain.size }, () => Array.from({ length: terrain.size }, () => false))
  const nodes = seeds.map((cell, index) => ({ id: `set-${index}`, x: cell[0], z: cell[1], kind: 'settlement' as const }))
  const edges: RoadGraph['edges'] = []
  const used = [0]
  const remaining = seeds.map((_, index) => index).slice(1)
  while (remaining.length) {
    let bestFrom = used[0]
    let bestTo = remaining[0]
    let best = Infinity
    for (const i of used) {
      for (const j of remaining) {
        const d = hypot2(seeds[i], seeds[j])
        if (d < best) {
          best = d
          bestFrom = i
          bestTo = j
        }
      }
    }
    const path = astar(walkable, cost, seeds[bestFrom], seeds[bestTo])
    const line = path.found ? path.path : raster(seeds[bestFrom], seeds[bestTo])
    paint(cells, line, terrain.size)
    edges.push({ from: `set-${Math.min(bestFrom, bestTo)}`, to: `set-${Math.max(bestFrom, bestTo)}`, cells: line, length: Number((path.found ? path.cost : hypot2(seeds[bestFrom], seeds[bestTo])).toFixed(3)) })
    used.push(bestTo)
    remaining.splice(remaining.indexOf(bestTo), 1)
  }
  const gates = seeds.map((cell, index) => ({ id: `gate-${index}`, x: cell[0] < terrain.size / 2 ? 0 : terrain.size - 1, z: cell[1], kind: 'gate' as const }))
  for (const [index, seed] of seeds.entries()) {
    const gate: Cell = [gates[index].x, gates[index].z]
    if (!walkable[gate[1]]?.[gate[0]]) continue
    const path = astar(walkable, cost, seed, gate)
    if (!path.found) continue
    paint(cells, path.path, terrain.size)
    edges.push({ from: `set-${index}`, to: gates[index].id, cells: path.path, length: Number(path.cost.toFixed(3)) })
  }
  const spanning = edges.filter(edge => edge.from.startsWith('set-') && edge.to.startsWith('set-')).length
  return {
    format: 'ues-roads-v1',
    nodes: [...nodes, ...gates],
    edges,
    cells,
    verification: { connected: seeds.length <= 1 || spanning >= seeds.length - 1, nodeCount: nodes.length + gates.length, edgeCount: edges.length },
  }
}

export const roadHash = (graph: RoadGraph) => hashSeed(JSON.stringify({ n: graph.nodes.length, e: graph.edges.length }))
