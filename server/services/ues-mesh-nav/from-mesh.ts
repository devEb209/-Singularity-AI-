import { astar } from '../ues-nav/pathfind.js'
import { funnel, polylineLength, portalsFromPath } from '../ues-navmesh/funnel.js'
import type { Mesh } from '../ues-navmesh/types.js'
import { fillAabb, voxelize } from '../ues-navmesh/voxel.js'
import { walkableLayer, worldToCell } from '../ues-navmesh/walkable.js'
import { composeSemantic } from '../ues-semantic-3d/compose.js'
import { UesAdvancedPipeline } from '../ues-advanced-pipeline.js'
import { booleanSolids, defaultPair } from '../ues-solid/csg.js'

const advanced = new UesAdvancedPipeline({} as never, {} as never)

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

const withFloor = (mesh: Mesh): Mesh => ({
  vertices: [...mesh.vertices, [-3, 0, -3], [3, 0, -3], [3, 0, 3], [-3, 0, 3]],
  triangles: [...mesh.triangles, [mesh.vertices.length, mesh.vertices.length + 1, mesh.vertices.length + 2], [mesh.vertices.length, mesh.vertices.length + 2, mesh.vertices.length + 3]],
})

export const navFromMesh = (mesh: Mesh, origin: [number, number, number] = [-3.2, -0.05, -3.2], cell = 0.32, dim: [number, number, number] = [20, 6, 20]) => {
  const voxels = fillAabb(voxelize(mesh, origin, cell, dim), [-0.45, 0, -0.45], [0.45, 0.9, 0.45])
  const layer = walkableLayer(voxels)
  const start = layer.walkable[worldToCell(voxels, -2.4, -2.4)[1]]?.[worldToCell(voxels, -2.4, -2.4)[0]] ? worldToCell(voxels, -2.4, -2.4) : firstWalkable(layer.walkable)
  const goal = layer.walkable[worldToCell(voxels, 2.4, 2.4)[1]]?.[worldToCell(voxels, 2.4, 2.4)[0]] ? worldToCell(voxels, 2.4, 2.4) : lastWalkable(layer.walkable)
  const path = astar(layer.walkable, layer.cost, start, goal)
  const corridor = path.path.map(item => [item[0], item[1]] as [number, number])
  const pulled = path.found ? funnel(corridor[0], portalsFromPath(corridor), corridor[corridor.length - 1]) : []
  return {
    occupied: voxels.occupied.reduce((sum, value) => sum + value, 0),
    walkable: layer.cells,
    found: path.found,
    cells: path.path.length,
    grid: Number(polylineLength(corridor).toFixed(3)),
    funnel: Number(polylineLength(pulled).toFixed(3)),
    recast: false as const,
  }
}

export const navFromPrompt = (prompt: string) => {
  const semantic = composeSemantic(prompt)
  const generated = advanced.parametricMesh(semantic as never, 4)
  return navFromMesh(withFloor({ vertices: generated.vertices, triangles: generated.triangles }))
}

export const navFromSolid = () => {
  const pair = defaultPair()
  const solid = booleanSolids(pair.left, pair.right, 'subtract')
  return navFromMesh(withFloor(solid.geometry), [-1.6, -0.05, -1.6], 0.2, [16, 6, 16])
}
