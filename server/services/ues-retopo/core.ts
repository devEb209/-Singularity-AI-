import { UesAdvancedPipeline } from '../ues-advanced-pipeline.js'
import { DThesisCore } from '../d-thesis/core.js'
import { remeshAlongFlow } from './edgeflow.js'
import { inspect } from './inspect.js'
import { repair } from './repair.js'
import type { Mesh, Tri, V3 } from './types.js'

const brokenDisk = (): Mesh => {
  const vertices: V3[] = [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1], [0.0004, 0, 0], [0.5, 0.2, 0.5]]
  const triangles: Tri[] = [[0, 1, 5], [1, 2, 5], [2, 3, 5], [0, 0, 1]]
  return { vertices, triangles }
}

export class UesRetopoCore {
  private thesis = new DThesisCore()
  private advanced = new UesAdvancedPipeline({} as never, {} as never)

  process(prompt = 'humanoid character') {
    const semantic = this.advanced.semanticObject(prompt)
    const generated = this.advanced.parametricMesh(semantic, 6)
    const source: Mesh = { vertices: generated.vertices, triangles: generated.triangles }
    const damaged = brokenDisk()
    const before = inspect(damaged)
    const fixed = repair(damaged)
    const afterRepair = inspect(fixed)
    const flowed = remeshAlongFlow(source, generated.partRanges)
    const afterFlow = inspect(flowed)
    const dThesis = this.thesis.evaluate({
      objective: 'Reparar topologia e remalhar com viés de edge-flow semântico',
      constraints: ['não reivindicar QuadriFlow', 'CPU only'],
      resources: ['mesh', 'partRanges'],
      priorities: { quality: 8, performance: 7, safety: 8, cost: 5, scalability: 6 },
    })
    return {
      format: 'ues-retopo-v1',
      before,
      afterRepair,
      afterFlow,
      reduction: {
        inputVertices: source.vertices.length,
        outputVertices: flowed.vertices.length,
      },
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: afterRepair.degenerateFaces === 0 && afterRepair.manifold && afterFlow.valid && flowed.vertices.length < source.vertices.length,
        holeFilled: afterRepair.boundaryEdges < before.boundaryEdges || afterRepair.watertight,
        anisotropic: true,
      },
      limitations: ['Anisotropic clustering, not commercial edge-flow solvers'],
    }
  }
}
