import { norm, type V3 } from '../ues-light/vec.js'

export interface WorldVertex {
  p: V3
  n: V3
  uv: [number, number]
  material: number
}

export interface WorldTriangle {
  a: WorldVertex
  b: WorldVertex
  c: WorldVertex
}

const vertex = (p: V3, n: V3, uv: [number, number], material: number): WorldVertex => ({ p, n, uv, material })

export const plane = (center: V3, hx: number, hz: number, material: number): WorldTriangle[] => {
  const n: V3 = [0, 1, 0]
  const a = vertex([center[0] - hx, center[1], center[2] - hz], n, [0, 0], material)
  const b = vertex([center[0] + hx, center[1], center[2] - hz], n, [1, 0], material)
  const c = vertex([center[0] + hx, center[1], center[2] + hz], n, [1, 1], material)
  const d = vertex([center[0] - hx, center[1], center[2] + hz], n, [0, 1], material)
  return [{ a, b, c }, { a, b: c, c: d }]
}

export const box = (center: V3, half: V3, material: number): WorldTriangle[] => {
  const faces: { n: V3; u: V3; v: V3 }[] = [
    { n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1] },
    { n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, -1] },
    { n: [1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
    { n: [-1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] },
    { n: [0, 0, 1], u: [-1, 0, 0], v: [0, 1, 0] },
    { n: [0, 0, -1], u: [1, 0, 0], v: [0, 1, 0] },
  ]
  const tris: WorldTriangle[] = []
  for (const face of faces) {
    const origin: V3 = [
      center[0] + face.n[0] * half[0],
      center[1] + face.n[1] * half[1],
      center[2] + face.n[2] * half[2],
    ]
    const hu = face.u[0] ? half[0] : face.u[2] ? half[2] : half[1]
    const hv = face.v[1] ? half[1] : face.v[2] ? half[2] : half[0]
    const p = (su: number, sv: number, uv: [number, number]) => vertex([
      origin[0] + face.u[0] * su * hu + face.v[0] * sv * hv,
      origin[1] + face.u[1] * su * hu + face.v[1] * sv * hv,
      origin[2] + face.u[2] * su * hu + face.v[2] * sv * hv,
    ], face.n, uv, material)
    const a = p(-1, -1, [0, 0])
    const b = p(1, -1, [1, 0])
    const c = p(1, 1, [1, 1])
    const d = p(-1, 1, [0, 1])
    tris.push({ a, b, c }, { a, b: c, c: d })
  }
  return tris
}

export const sphere = (center: V3, radius: number, material: number, divisions = 2): WorldTriangle[] => {
  const verts: V3[] = [
    [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
  ]
  let faces: [number, number, number][] = [
    [0, 2, 4], [2, 1, 4], [1, 3, 4], [3, 0, 4],
    [2, 0, 5], [1, 2, 5], [3, 1, 5], [0, 3, 5],
  ]
  const midpoint = new Map<string, number>()
  const mid = (i: number, j: number) => {
    const key = i < j ? `${i}:${j}` : `${j}:${i}`
    const cached = midpoint.get(key)
    if (cached !== undefined) return cached
    const mixed = norm([
      (verts[i][0] + verts[j][0]) / 2,
      (verts[i][1] + verts[j][1]) / 2,
      (verts[i][2] + verts[j][2]) / 2,
    ])
    const id = verts.length
    verts.push(mixed)
    midpoint.set(key, id)
    return id
  }
  for (let step = 0; step < divisions; step++) {
    const next: [number, number, number][] = []
    midpoint.clear()
    for (const [a, b, c] of faces) {
      const ab = mid(a, b)
      const bc = mid(b, c)
      const ca = mid(c, a)
      next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca])
    }
    faces = next
  }
  return faces.map(([ia, ib, ic]) => {
    const pa = verts[ia]
    const pb = verts[ib]
    const pc = verts[ic]
    const va = vertex([center[0] + pa[0] * radius, center[1] + pa[1] * radius, center[2] + pa[2] * radius], pa, [pa[0] * 0.5 + 0.5, pa[1] * 0.5 + 0.5], material)
    const vb = vertex([center[0] + pb[0] * radius, center[1] + pb[1] * radius, center[2] + pb[2] * radius], pb, [pb[0] * 0.5 + 0.5, pb[1] * 0.5 + 0.5], material)
    const vc = vertex([center[0] + pc[0] * radius, center[1] + pc[1] * radius, center[2] + pc[2] * radius], pc, [pc[0] * 0.5 + 0.5, pc[1] * 0.5 + 0.5], material)
    return { a: va, b: vb, c: vc }
  })
}

export const demoScene = () => [
  ...plane([0, 0, 0], 3.2, 3.2, 0),
  ...sphere([-0.85, 0.46, 0.12], 0.46, 1, 2),
  ...box([0.88, 0.34, 0.08], [0.34, 0.34, 0.34], 2),
]
