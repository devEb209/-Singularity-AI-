import { cross, dot, norm, type V3 } from '../ues-light/vec.js'

export interface ShadowMap {
  size: number
  extent: number
  depth: Float32Array
  right: V3
  up: V3
  forward: V3
  origin: V3
  near: number
  far: number
  bias: number
}

export const createShadowMap = (sunDir: V3, size = 32, extent = 3.4): ShadowMap => {
  const incoming = norm(sunDir)
  const forward = norm([-incoming[0], -incoming[1], -incoming[2]])
  const right = Math.abs(forward[1]) > 0.92 ? norm(cross([1, 0, 0], forward)) : norm(cross(forward, [0, 1, 0]))
  const up = cross(right, forward)
  return {
    size,
    extent,
    depth: new Float32Array(size * size).fill(1),
    right,
    up,
    forward,
    origin: [0, 0.2, 0],
    near: -4,
    far: 4,
    bias: 0.012,
  }
}

export const worldToShadow = (map: ShadowMap, world: V3) => {
  const rel: V3 = [world[0] - map.origin[0], world[1] - map.origin[1], world[2] - map.origin[2]]
  const x = dot(rel, map.right)
  const y = dot(rel, map.up)
  const z = dot(rel, map.forward)
  const u = (x / map.extent) * 0.5 + 0.5
  const v = (y / map.extent) * 0.5 + 0.5
  const depth = (z - map.near) / (map.far - map.near)
  return { u, v, depth }
}

export const writeShadow = (map: ShadowMap, world: V3) => {
  const hit = worldToShadow(map, world)
  if (hit.u < 0 || hit.v < 0 || hit.u >= 1 || hit.v >= 1) return false
  const x = Math.min(map.size - 1, Math.max(0, Math.floor(hit.u * map.size)))
  const y = Math.min(map.size - 1, Math.max(0, Math.floor(hit.v * map.size)))
  const index = y * map.size + x
  if (hit.depth >= map.depth[index]) return false
  map.depth[index] = hit.depth
  return true
}

export const sampleShadow = (map: ShadowMap, world: V3) => {
  const hit = worldToShadow(map, world)
  if (hit.u < 0 || hit.v < 0 || hit.u >= 1 || hit.v >= 1) return 1
  let lit = 0
  let taps = 0
  for (let oy = -1; oy <= 1; oy++) {
    for (let ox = -1; ox <= 1; ox++) {
      const u = hit.u + ox / map.size
      const v = hit.v + oy / map.size
      if (u < 0 || v < 0 || u >= 1 || v >= 1) continue
      const x = Math.min(map.size - 1, Math.max(0, Math.floor(u * map.size)))
      const y = Math.min(map.size - 1, Math.max(0, Math.floor(v * map.size)))
      const stored = map.depth[y * map.size + x]
      lit += hit.depth <= stored + map.bias ? 1 : 0
      taps += 1
    }
  }
  return taps ? lit / taps : 1
}
