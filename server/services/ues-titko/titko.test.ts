import { describe, expect, it } from 'vitest'
import { UesTitkoCore } from './core.js'
import { bitmapBytes, materials, storedBytes } from './graph.js'
import { samplePatch } from './sample.js'

describe('UES TITKO materials', () => {
  it('stores a graph far smaller than a 16K bitmap and adds detail with octaves', () => {
    const material = materials[0]
    expect(storedBytes(material)).toBeLessThan(400)
    expect(bitmapBytes(16384)).toBeGreaterThan(100_000_000)
    expect(samplePatch(material, 32, 5).gradient).toBeGreaterThan(samplePatch(material, 8, 2).gradient)
    const result = new UesTitkoCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.storedBitmap16k).toBe(false)
  })
})
