import type { PbrLayers } from './pbr.js'

const saturate = (value: number) => Math.max(0, Math.min(1, value))

export const ggxD = (nDotH: number, roughness: number) => {
  const a = Math.max(0.045, roughness * roughness)
  const a2 = a * a
  const d = nDotH * nDotH * (a2 - 1) + 1
  return a2 / (Math.PI * d * d)
}

export const schlickF = (f0: number, vDotH: number) => f0 + (1 - f0) * (1 - vDotH) ** 5

export const smithG = (nDotV: number, nDotL: number, roughness: number) => {
  const k = (roughness + 1) ** 2 / 8
  const gV = nDotV / (nDotV * (1 - k) + k)
  const gL = nDotL / (nDotL * (1 - k) + k)
  return gV * gL
}

export const cookTorrance = (layers: PbrLayers, nDotL: number, nDotV: number, nDotH: number, vDotH: number) => {
  const f0 = layers.metalness > 0.5 ? 0.9 : ((layers.ior - 1) / (layers.ior + 1)) ** 2
  const d = ggxD(nDotH, layers.roughness)
  const f = schlickF(f0, vDotH)
  const g = smithG(nDotV, nDotL, layers.roughness)
  const specular = (d * f * g) / Math.max(1e-4, 4 * nDotL * nDotV)
  const diffuse = ((1 - layers.metalness) * (layers.albedo[0] + layers.albedo[1] + layers.albedo[2]) / 3) / Math.PI
  return { specular: Number(specular.toFixed(6)), diffuse: Number(diffuse.toFixed(6)), energy: Number((specular + diffuse).toFixed(6)) }
}

export const energyCheck = (layers: PbrLayers) => {
  const samples = [
    cookTorrance(layers, 1, 1, 1, 1),
    cookTorrance(layers, 0.7, 0.7, 0.85, 0.8),
    cookTorrance(layers, 0.35, 0.5, 0.4, 0.45),
  ]
  const maxEnergy = Math.max(...samples.map(item => item.energy))
  const maxSpecular = Math.max(...samples.map(item => item.specular))
  return {
    samples,
    maxEnergy,
    maxSpecular,
    conserved: maxEnergy < 8 && maxSpecular < 6 && samples[0].diffuse >= 0,
  }
}

export const heightNormal = (height: (u: number, v: number) => number, u: number, v: number, eps = 1 / 64) => {
  const du = height(u + eps, v) - height(u - eps, v)
  const dv = height(u, v + eps) - height(u, v - eps)
  const n = [-du / (2 * eps), 1, -dv / (2 * eps)]
  const len = Math.hypot(n[0], n[1], n[2]) || 1
  return [n[0] / len, n[1] / len, n[2] / len] as [number, number, number]
}

export const lambert = (layers: PbrLayers) => saturate((1 - layers.metalness) * (layers.albedo[0] + layers.albedo[1] + layers.albedo[2]) / 3)
