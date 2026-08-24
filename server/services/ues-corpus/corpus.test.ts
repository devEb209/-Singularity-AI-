import { describe, expect, it } from 'vitest'
import { byPrompt, catalog } from './catalog.js'
import { UesCorpusCore } from './core.js'
import { meshEntry, toSemantic } from './generate.js'

describe('UES semantic corpus', () => {
  it('holds nine distinct kinds with valid parent graphs and meshes', () => {
    expect(new Set(catalog.map(item => item.kind)).size).toBe(9)
    for (const entry of catalog) {
      const semantic = toSemantic(entry)
      expect(semantic.verification.uniqueParts).toBe(true)
      expect(semantic.verification.allParentsExist).toBe(true)
      expect(meshEntry(entry, 4).mesh.verification.valid).toBe(true)
    }
    expect(byPrompt('personagem humano').kind).toBe('humanoid')
    expect(byPrompt('cadeira de madeira').kind).toBe('chair')
    const result = new UesCorpusCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.specialistDerived).toBe(false)
    expect(result.count).toBe(9)
  })
})
