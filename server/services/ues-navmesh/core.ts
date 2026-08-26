import { DThesisCore } from '../d-thesis/core.js'
import { astar } from '../ues-nav/pathfind.js'
import { funnel, polylineLength, portalsFromPath } from './funnel.js'
import { fillAabb, roomWithObstacle, voxelize } from './voxel.js'
import { walkableLayer, worldToCell } from './walkable.js'

export class UesNavmeshCore {
  private thesis = new DThesisCore()

  compile() {
    const mesh = roomWithObstacle()
    const voxels = fillAabb(voxelize(mesh), [-0.7, 0, -0.7], [0.7, 1.2, 0.7])
    const layer = walkableLayer(voxels)
    const start = worldToCell(voxels, -3, -3)
    const goal = worldToCell(voxels, 3, 3)
    const snappedStart = layer.walkable[start[1]]?.[start[0]] ? start : firstWalkable(layer.walkable)
    const snappedGoal = layer.walkable[goal[1]]?.[goal[0]] ? goal : lastWalkable(layer.walkable)
    const path = astar(layer.walkable, layer.cost, snappedStart, snappedGoal)
    const corridor = path.path.map(cell => [cell[0], cell[1]] as [number, number])
    const pulled = path.found ? funnel(corridor[0], portalsFromPath(corridor), corridor[corridor.length - 1]) : []
    const gridLen = polylineLength(corridor)
    const funnelLen = polylineLength(pulled)
    const dThesis = this.thesis.evaluate({
      objective: 'Extrair camada caminhável de malha 3D e suavizar corredor com funnel',
      constraints: ['não reivindicar Recast comercial', 'CPU only'],
      resources: ['voxel', 'A*', 'funnel'],
      priorities: { quality: 7, performance: 8, safety: 8, cost: 5, scalability: 7 },
    })
    return {
      format: 'ues-navmesh-v1',
      voxels: { dim: voxels.dim, occupied: voxels.occupied.reduce((sum, value) => sum + value, 0) },
      walkable: layer.cells,
      path: { found: path.found, cells: path.path.length, expanded: path.expanded },
      lengths: { grid: Number(gridLen.toFixed(3)), funnel: Number(funnelLen.toFixed(3)) },
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: path.found && layer.cells > 20 && funnelLen <= gridLen + 1e-6 && pulled.length >= 2,
        recast: false,
      },
      limitations: ['Voxel AABB occupancy + string pulling', 'Not Recast/Detour contour mesh'],
    }
  }
}

const firstWalkable = (walkable: boolean[][]): [number, number] => {
  for (let z = 0; z < walkable.length; z++) {
    for (let x = 0; x < walkable[z].length; x++) if (walkable[z][x]) return [x, z]
  }
  return [0, 0]
}

const lastWalkable = (walkable: boolean[][]): [number, number] => {
  for (let z = walkable.length - 1; z >= 0; z--) {
    for (let x = walkable[z].length - 1; x >= 0; x--) if (walkable[z][x]) return [x, z]
  }
  return [0, 0]
}
