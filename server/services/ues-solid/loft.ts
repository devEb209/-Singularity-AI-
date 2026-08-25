import type { SolidMesh, V3 } from './types.js'

const ring = (y: number, hx: number, hz: number): V3[] => [
  [-hx, y, -hz], [hx, y, -hz], [hx, y, hz], [-hx, y, hz],
]

export const loftProfiles = (bottom: { y: number; hx: number; hz: number }, top: { y: number; hx: number; hz: number }): SolidMesh => {
  const a = ring(bottom.y, bottom.hx, bottom.hz)
  const b = ring(top.y, top.hx, top.hz)
  const vertices = [...a, ...b]
  const triangles: SolidMesh['triangles'] = [
    [0, 2, 1], [0, 3, 2],
    [4, 5, 6], [4, 6, 7],
  ]
  for (let i = 0; i < 4; i++) {
    const n = (i + 1) % 4
    triangles.push([i, n, 4 + n], [i, 4 + n, 4 + i])
  }
  return { vertices, triangles }
}

export const sweepPolyline = (path: V3[], radius = 0.12, sides = 6): SolidMesh => {
  const vertices: V3[] = []
  const triangles: SolidMesh['triangles'] = []
  for (let i = 0; i < path.length; i++) {
    const prev = path[Math.max(0, i - 1)]
    const next = path[Math.min(path.length - 1, i + 1)]
    const tx = next[0] - prev[0]
    const ty = next[1] - prev[1]
    const tz = next[2] - prev[2]
    const len = Math.hypot(tx, ty, tz) || 1
    const tangent: V3 = [tx / len, ty / len, tz / len]
    const helper: V3 = Math.abs(tangent[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]
    const bx = helper[1] * tangent[2] - helper[2] * tangent[1]
    const by = helper[2] * tangent[0] - helper[0] * tangent[2]
    const bz = helper[0] * tangent[1] - helper[1] * tangent[0]
    const bLen = Math.hypot(bx, by, bz) || 1
    const binormal: V3 = [bx / bLen, by / bLen, bz / bLen]
    const nx = tangent[1] * binormal[2] - tangent[2] * binormal[1]
    const ny = tangent[2] * binormal[0] - tangent[0] * binormal[2]
    const nz = tangent[0] * binormal[1] - tangent[1] * binormal[0]
    for (let s = 0; s < sides; s++) {
      const ang = (s / sides) * Math.PI * 2
      const c = Math.cos(ang)
      const si = Math.sin(ang)
      vertices.push([
        path[i][0] + (binormal[0] * c + nx * si) * radius,
        path[i][1] + (binormal[1] * c + ny * si) * radius,
        path[i][2] + (binormal[2] * c + nz * si) * radius,
      ])
    }
  }
  for (let i = 0; i < path.length - 1; i++) {
    for (let s = 0; s < sides; s++) {
      const a = i * sides + s
      const b = i * sides + (s + 1) % sides
      const c = (i + 1) * sides + s
      const d = (i + 1) * sides + (s + 1) % sides
      triangles.push([a, c, b], [b, c, d])
    }
  }
  return { vertices, triangles }
}
