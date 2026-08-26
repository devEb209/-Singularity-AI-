import { booleanSolids } from '../ues-solid/csg.js'
import { loftProfiles } from '../ues-solid/loft.js'
import { bumpImage } from './height.js'
import { distanceField, maskOf, symmetryScore } from './silhouette.js'
import type { GrayImage } from '../ues-image/filters.js'

export const reconstructObject = (image: GrayImage, prompt = 'objeto') => {
  const mask = maskOf(image)
  const field = distanceField(image)
  const occupied = mask.filter(Boolean).length
  const peak = Math.max(...field.filter(value => Number.isFinite(value)))
  const symmetry = symmetryScore(image)
  const body = loftProfiles(
    { y: 0, hx: 0.28 + symmetry * 0.08, hz: 0.22 },
    { y: 0.15 + Math.min(0.45, peak * 0.04), hx: 0.16, hz: 0.14 },
  )
  const cut = booleanSolids(
    { id: 'body', kind: 'box', center: [0, 0.2, 0], radius: [0.35, 0.22, 0.28] },
    { id: 'indent', kind: 'sphere', center: [0.12, 0.28, 0], radius: [0.14, 0.14, 0.14] },
    /recorte|buraco|hole/.test(prompt) ? 'subtract' : 'union',
  )
  return {
    format: 'ues-image3d-reconstruct-v1' as const,
    occupied,
    peak,
    symmetry,
    loft: { vertices: body.vertices.length, triangles: body.triangles.length },
    csg: { cells: cut.counts.result, op: cut.op },
    method: ['silhouette', 'distance', 'symmetry', 'loft', 'csg'] as const,
    learnedVision: false as const,
  }
}

export const reconstructPair = (a: GrayImage, b: GrayImage, prompt: string) => {
  const first = reconstructObject(a, prompt)
  const second = reconstructObject(b, prompt)
  return {
    ...first,
    views: 2,
    peak: Number(((first.peak + second.peak) / 2).toFixed(4)),
    symmetry: Number(((first.symmetry + second.symmetry) / 2).toFixed(4)),
  }
}

export const fixturePair = () => ({ a: bumpImage(12, 12), b: bumpImage(10, 10) })
