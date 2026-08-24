import { describe, expect, it } from 'vitest'
import { UesImage3dCore } from './core.js'
import { bumpImage, heightMesh } from './height.js'

describe('UES image/text to 3D fallback', () => {
  it('raises the bright center into a mesh without claiming learned vision', () => {
    const mesh = heightMesh(bumpImage(8, 8))
    expect(mesh.peak).toBeGreaterThan(0.2)
    expect(mesh.triangles.length).toBeGreaterThan(0)
    const result = new UesImage3dCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.learnedVision).toBe(false)
    expect(result.verification.puterRequired).toBe(false)
    expect(result.verification.heightfieldOnly).toBe(false)
    expect(result.reconstruct.method).toContain('csg')
  })
})
