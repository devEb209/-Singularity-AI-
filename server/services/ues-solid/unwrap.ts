import type { SolidMesh, V3 } from './types.js'

export interface UvIsland {
  face: 'x+' | 'x-' | 'y+' | 'y-' | 'z+' | 'z-' | 'planar'
  uvs: [number, number][]
}

const normalOf = (a: V3, b: V3, c: V3): V3 => {
  const ab: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
  const ac: V3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]
  return [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]]
}

const dominant = (n: V3): UvIsland['face'] => {
  const ax = Math.abs(n[0])
  const ay = Math.abs(n[1])
  const az = Math.abs(n[2])
  if (ax >= ay && ax >= az) return n[0] >= 0 ? 'x+' : 'x-'
  if (ay >= ax && ay >= az) return n[1] >= 0 ? 'y+' : 'y-'
  return n[2] >= 0 ? 'z+' : 'z-'
}

const project = (vertex: V3, face: UvIsland['face']): [number, number] => {
  if (face === 'x+' || face === 'x-') return [vertex[2], vertex[1]]
  if (face === 'z+' || face === 'z-') return [vertex[0], vertex[1]]
  return [vertex[0], vertex[2]]
}

export const unwrapBox = (mesh: SolidMesh) => {
  const islands: UvIsland[] = []
  const uvs: [number, number][] = mesh.vertices.map(() => [0, 0])
  for (const [i0, i1, i2] of mesh.triangles) {
    const face = dominant(normalOf(mesh.vertices[i0], mesh.vertices[i1], mesh.vertices[i2]))
    const coords = [project(mesh.vertices[i0], face), project(mesh.vertices[i1], face), project(mesh.vertices[i2], face)]
    uvs[i0] = coords[0]
    uvs[i1] = coords[1]
    uvs[i2] = coords[2]
    islands.push({ face, uvs: coords })
  }
  const finite = uvs.every(uv => Number.isFinite(uv[0]) && Number.isFinite(uv[1]))
  const used = new Set(islands.map(item => item.face))
  return {
    format: 'ues-solid-uv-v1' as const,
    uvs,
    islands: islands.length,
    faces: [...used],
    verification: { valid: finite && uvs.length === mesh.vertices.length && used.size >= 1 },
  }
}
