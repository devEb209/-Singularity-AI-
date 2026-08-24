import { describe, expect, it } from 'vitest'
import { UesAnatomyCore } from './core.js'
import { deformationQuality, linearBlend } from './deform.js'
import { fitBones, skin } from './infer.js'
import { humanoid } from './templates.js'

describe('UES anatomy rig', () => {
  it('normalizes inverse-distance weights and keeps deformation finite', () => {
    const bones = fitBones(humanoid, { min: [-1, 0, -1], max: [1, 2, 1] })
    const vertices: [number, number, number][] = [[0, 0.2, 0], [0, 1.3, 0], [0.4, 0.8, 0]]
    const weights = skin(vertices, bones)
    expect(weights.every(set => Math.abs(set.reduce((sum, item) => sum + item.weight, 0) - 1) < 1e-8)).toBe(true)
    const posed = linearBlend(vertices, bones, weights, 'spine', 0.5)
    expect(deformationQuality(vertices, posed).valid).toBe(true)
  })

  it('infers a multi-bone template from a humanoid prompt', () => {
    const result = new UesAnatomyCore().process('personagem humano')
    expect(result.verification.valid).toBe(true)
    expect(result.verification.boneCount).toBeGreaterThanOrEqual(10)
    expect(result.kind).toBe('humanoid')
  })
})
