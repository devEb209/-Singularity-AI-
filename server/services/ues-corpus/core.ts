import { DThesisCore } from '../d-thesis/core.js'
import { UesSemantic3dCore } from '../ues-semantic-3d/core.js'
import { catalog } from './catalog.js'
import { meshEntry } from './generate.js'

export class UesCorpusCore {
  private thesis = new DThesisCore()
  private open = new UesSemantic3dCore()

  process(prompt = 'corpus semantico') {
    const built = catalog.map(entry => meshEntry(entry, 5))
    const kinds = new Set(built.map(item => item.entry.kind))
    const valid = built.every(item => item.semantic.verification.uniqueParts && item.semantic.verification.allParentsExist && item.mesh.verification.valid)
    const openClass = this.open.process(prompt)
    const dThesis = this.thesis.evaluate({
      objective: `Corpus semântico + classe aberta para ${prompt}`,
      constraints: ['não reivindicar especialista Puter', 'geometria paramétrica + aberta'],
      resources: ['catalog', 'semantic-3d', 'CPU'],
      priorities: { quality: 8, performance: 7, safety: 8, cost: 5, scalability: 8 },
    })
    return {
      format: 'ues-corpus-v1',
      count: built.length,
      kinds: [...kinds],
      items: built.map(item => ({
        id: item.entry.id,
        kind: item.entry.kind,
        parts: item.entry.parts.length,
        vertices: item.mesh.vertices.length,
        triangles: item.mesh.triangles.length,
        valid: item.mesh.verification.valid,
      })),
      openClass: { kind: openClass.semantic.identity.kind, valid: openClass.verification.valid, catalogBound: openClass.verification.catalogBound },
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: { valid: valid && built.length >= 6 && kinds.size >= 6 && openClass.verification.valid, specialistDerived: false, catalogOnly: false },
      limitations: ['Catalog + open-class compiler', 'Not specialist-derived scans'],
    }
  }
}
