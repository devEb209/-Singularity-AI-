import { ggxD, smithG } from '../ues-titko/brdf.js'
import type { SurfaceMaterial } from './types.js'
import { clamp01, type V3 } from './vec.js'

export const dielectricF0 = (ior: number) => {
  const eta = (ior - 1) / (ior + 1)
  return eta * eta
}

export const fresnel0 = (albedo: V3, metalness: number, ior = 1.5): V3 => {
  const base = dielectricF0(ior)
  return [
    base * (1 - metalness) + albedo[0] * metalness,
    base * (1 - metalness) + albedo[1] * metalness,
    base * (1 - metalness) + albedo[2] * metalness,
  ]
}

export const schlickRgb = (f0: V3, vDotH: number): V3 => {
  const weight = (1 - clamp01(vDotH)) ** 5
  return [
    f0[0] + (1 - f0[0]) * weight,
    f0[1] + (1 - f0[1]) * weight,
    f0[2] + (1 - f0[2]) * weight,
  ]
}

export const cookTorranceRgb = (
  material: SurfaceMaterial,
  nDotL: number,
  nDotV: number,
  nDotH: number,
  vDotH: number,
): { diffuse: V3; specular: V3 } => {
  const nl = Math.max(0, nDotL)
  const nv = Math.max(1e-4, nDotV)
  const f0 = fresnel0(material.albedo, material.metalness, material.ior)
  const F = schlickRgb(f0, vDotH)
  const D = ggxD(nDotH, material.roughness)
  const G = smithG(nv, Math.max(1e-4, nl), material.roughness)
  const denom = Math.max(1e-4, 4 * nl * nv)
  const specular: V3 = [F[0] * D * G / denom, F[1] * D * G / denom, F[2] * D * G / denom]
  const kd: V3 = [
    (1 - F[0]) * (1 - material.metalness),
    (1 - F[1]) * (1 - material.metalness),
    (1 - F[2]) * (1 - material.metalness),
  ]
  const diffuse: V3 = [
    kd[0] * material.albedo[0] / Math.PI,
    kd[1] * material.albedo[1] / Math.PI,
    kd[2] * material.albedo[2] / Math.PI,
  ]
  return { diffuse, specular }
}

export const evaluateBrdf = (material: SurfaceMaterial, N: V3, V: V3, L: V3, light: V3): V3 => {
  const nDotL = Math.max(0, N[0] * L[0] + N[1] * L[1] + N[2] * L[2])
  const nDotV = Math.max(0, N[0] * V[0] + N[1] * V[1] + N[2] * V[2])
  if (nDotL <= 0 || nDotV <= 0) return [0, 0, 0]
  const H: V3 = [
    V[0] + L[0],
    V[1] + L[1],
    V[2] + L[2],
  ]
  const hLen = Math.hypot(H[0], H[1], H[2]) || 1
  H[0] /= hLen
  H[1] /= hLen
  H[2] /= hLen
  const nDotH = Math.max(0, N[0] * H[0] + N[1] * H[1] + N[2] * H[2])
  const vDotH = Math.max(0, V[0] * H[0] + V[1] * H[1] + V[2] * H[2])
  const lobes = cookTorranceRgb(material, nDotL, nDotV, nDotH, vDotH)
  return [
    (lobes.diffuse[0] + lobes.specular[0]) * nDotL * light[0] + material.emission[0],
    (lobes.diffuse[1] + lobes.specular[1]) * nDotL * light[1] + material.emission[1],
    (lobes.diffuse[2] + lobes.specular[2]) * nDotL * light[2] + material.emission[2],
  ]
}
