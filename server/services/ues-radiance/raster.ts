import { writeGBuffer, type GBuffer } from '../ues-gbuffer/layout.js'
import { writeShadow, type ShadowMap } from '../ues-shadow/map.js'
import type { SurfaceMaterial } from '../ues-light/types.js'
import type { Texture2D } from '../ues-texture/types.js'
import { sampleBilinear } from '../ues-texture/sample.js'
import type { ClipVertex } from './project.js'

const edge = (a: ClipVertex, b: ClipVertex, x: number, y: number) =>
  (x - a.x) * (b.y - a.y) - (y - a.y) * (b.x - a.x)

export const rasterizeTriangle = (
  buffer: GBuffer,
  a: ClipVertex,
  b: ClipVertex,
  c: ClipVertex,
  materials: SurfaceMaterial[],
  textures: (Texture2D | undefined)[],
) => {
  const area = edge(a, b, c.x, c.y)
  if (Math.abs(area) < 1e-6) return 0
  const minX = Math.max(0, Math.floor(Math.min(a.x, b.x, c.x)))
  const maxX = Math.min(buffer.width - 1, Math.ceil(Math.max(a.x, b.x, c.x)))
  const minY = Math.max(0, Math.floor(Math.min(a.y, b.y, c.y)))
  const maxY = Math.min(buffer.height - 1, Math.ceil(Math.max(a.y, b.y, c.y)))
  let written = 0
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const w0 = edge(b, c, x + 0.5, y + 0.5) / area
      const w1 = edge(c, a, x + 0.5, y + 0.5) / area
      const w2 = edge(a, b, x + 0.5, y + 0.5) / area
      if (w0 < 0 || w1 < 0 || w2 < 0) continue
      const invW = w0 * a.invW + w1 * b.invW + w2 * c.invW
      if (invW <= 1e-8) continue
      const z = w0 * a.z + w1 * b.z + w2 * c.z
      const world: [number, number, number] = [
        (w0 * a.wx + w1 * b.wx + w2 * c.wx) / invW,
        (w0 * a.wy + w1 * b.wy + w2 * c.wy) / invW,
        (w0 * a.wz + w1 * b.wz + w2 * c.wz) / invW,
      ]
      const normal: [number, number, number] = [
        (w0 * a.nx + w1 * b.nx + w2 * c.nx) / invW,
        (w0 * a.ny + w1 * b.ny + w2 * c.ny) / invW,
        (w0 * a.nz + w1 * b.nz + w2 * c.nz) / invW,
      ]
      const nLen = Math.hypot(normal[0], normal[1], normal[2]) || 1
      normal[0] /= nLen
      normal[1] /= nLen
      normal[2] /= nLen
      const uv: [number, number] = [
        (w0 * a.u + w1 * b.u + w2 * c.u) / invW,
        (w0 * a.v + w1 * b.v + w2 * c.v) / invW,
      ]
      const materialId = a.material
      const material = materials[materialId] ?? materials[0]
      const texture = textures[materialId]
      const albedo = texture ? sampleBilinear(texture, uv[0], uv[1]) : material.albedo
      if (writeGBuffer(buffer, x, y, z, {
        albedo,
        normal,
        world,
        uv,
        roughness: material.roughness,
        metalness: material.metalness,
        emission: material.emission,
        material: materialId,
      })) written += 1
    }
  }
  return written
}

export const rasterizeShadow = (map: ShadowMap, a: { p: [number, number, number] }, b: { p: [number, number, number] }, c: { p: [number, number, number] }) => {
  const samples = 6
  let written = 0
  for (let i = 0; i <= samples; i++) {
    for (let j = 0; j <= samples - i; j++) {
      const w0 = i / samples
      const w1 = j / samples
      const w2 = 1 - w0 - w1
      const p: [number, number, number] = [
        a.p[0] * w0 + b.p[0] * w1 + c.p[0] * w2,
        a.p[1] * w0 + b.p[1] * w1 + c.p[1] * w2,
        a.p[2] * w0 + b.p[2] * w1 + c.p[2] * w2,
      ]
      if (writeShadow(map, p)) written += 1
    }
  }
  return written
}
