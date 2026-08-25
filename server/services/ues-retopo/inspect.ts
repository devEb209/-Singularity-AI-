import type { Mesh, TopologyReport, Tri } from './types.js'

const edgeKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`)

export const inspect = (mesh: Mesh): TopologyReport => {
  const used = new Set<number>()
  const edges = new Map<string, number>()
  let degenerate = 0
  for (const face of mesh.triangles) {
    if (new Set(face).size < 3) {
      degenerate += 1
      continue
    }
    face.forEach(index => used.add(index))
    for (let i = 0; i < 3; i++) {
      const key = edgeKey(face[i], face[(i + 1) % 3])
      edges.set(key, (edges.get(key) ?? 0) + 1)
    }
  }
  const counts = [...edges.values()]
  const boundaryEdges = counts.filter(count => count === 1).length
  const nonManifoldEdges = counts.filter(count => count > 2).length
  const unusedVertices = mesh.vertices.length - used.size
  const manifold = nonManifoldEdges === 0 && degenerate === 0
  const watertight = manifold && boundaryEdges === 0 && unusedVertices === 0
  return {
    vertexCount: mesh.vertices.length,
    triangleCount: mesh.triangles.length,
    unusedVertices,
    degenerateFaces: degenerate,
    boundaryEdges,
    nonManifoldEdges,
    manifold,
    watertight,
    valid: mesh.vertices.length > 0 && mesh.triangles.length > 0 && degenerate === 0,
  }
}

export const boundaryLoops = (triangles: Tri[]) => {
  const use = new Map<string, [number, number][]>()
  for (const face of triangles) {
    for (let i = 0; i < 3; i++) {
      const a = face[i]
      const b = face[(i + 1) % 3]
      const key = a < b ? `${a}-${b}` : `${b}-${a}`
      const list = use.get(key) ?? []
      list.push([a, b])
      use.set(key, list)
    }
  }
  const next = new Map<number, number>()
  for (const [key, dirs] of use) {
    if (dirs.length !== 1) continue
    next.set(dirs[0][0], dirs[0][1])
    void key
  }
  const loops: number[][] = []
  const seen = new Set<number>()
  for (const start of next.keys()) {
    if (seen.has(start)) continue
    const loop: number[] = [start]
    seen.add(start)
    let cursor = next.get(start)
    while (cursor !== undefined && cursor !== start && !seen.has(cursor)) {
      loop.push(cursor)
      seen.add(cursor)
      cursor = next.get(cursor)
    }
    if (loop.length >= 3) loops.push(loop)
  }
  return loops
}
