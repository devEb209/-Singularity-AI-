export interface Aabb {
  id: string
  position: [number, number, number]
  velocity: [number, number, number]
  half: [number, number, number]
}

export interface CcdHit {
  a: string
  b: string
  toi: number
  normal: [number, number, number]
}

const overlap1 = (pa: number, ha: number, pb: number, hb: number) => ha + hb - Math.abs(pa - pb)

export const sweptAabb = (a: Aabb, b: Aabb, dt: number): CcdHit | undefined => {
  let tEnter = 0
  let tExit = dt
  const normal: [number, number, number] = [0, 1, 0]
  for (let axis = 0; axis < 3; axis++) {
    const rel = a.velocity[axis] - b.velocity[axis]
    const dist = overlap1(a.position[axis], a.half[axis], b.position[axis], b.half[axis])
    if (Math.abs(rel) < 1e-9) {
      if (dist <= 0) return undefined
      continue
    }
    const sign = rel > 0 ? -1 : 1
    const enter = (sign * (a.half[axis] + b.half[axis]) - (a.position[axis] - b.position[axis])) / rel
    const exit = (-sign * (a.half[axis] + b.half[axis]) - (a.position[axis] - b.position[axis])) / rel
    const first = Math.min(enter, exit)
    const last = Math.max(enter, exit)
    if (first > tEnter) {
      tEnter = first
      normal[0] = 0
      normal[1] = 0
      normal[2] = 0
      normal[axis] = a.position[axis] < b.position[axis] ? -1 : 1
    }
    tExit = Math.min(tExit, last)
    if (tEnter > tExit) return undefined
  }
  if (tEnter < 0 || tEnter > dt) return undefined
  return { a: a.id, b: b.id, toi: Number(tEnter.toFixed(5)), normal }
}

export const islands = (hits: CcdHit[]) => {
  const parent = new Map<string, string>()
  const find = (id: string): string => {
    const p = parent.get(id) ?? id
    if (p !== id) parent.set(id, find(p))
    return parent.get(id) ?? id
  }
  const unite = (a: string, b: string) => {
    const pa = find(a)
    const pb = find(b)
    if (pa !== pb) parent.set(pa, pb)
  }
  for (const hit of hits) {
    if (!parent.has(hit.a)) parent.set(hit.a, hit.a)
    if (!parent.has(hit.b)) parent.set(hit.b, hit.b)
    unite(hit.a, hit.b)
  }
  const groups = new Map<string, string[]>()
  for (const id of parent.keys()) {
    const root = find(id)
    groups.set(root, [...(groups.get(root) ?? []), id])
  }
  return [...groups.values()]
}
