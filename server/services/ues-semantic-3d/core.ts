import { DThesisCore } from '../d-thesis/core.js'
import { UesAdvancedPipeline } from '../ues-advanced-pipeline.js'
import { geometryReport } from '../ues-critic/geometry.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { compileMaterialPrompt } from '../ues-titko/pbr.js'
import { composeSemantic } from './compose.js'

const advanced = new UesAdvancedPipeline({} as never, {} as never)

export class UesSemantic3dCore {
  private thesis = new DThesisCore()

  process(prompt = 'lanterna de mao com cabo e lente') {
    const semantic = composeSemantic(prompt)
    const mesh = advanced.parametricMesh(semantic as never, 5)
    const critic = geometryReport({ vertices: mesh.vertices, triangles: mesh.triangles })
    const material = compileMaterialPrompt(prompt)
    const kernel = runKernel(`Gerar 3D arbitrário para ${prompt}`, 'ues.semantic-3d', ['semantic-graph', 'parametric-mesh', 'titko'], [
      { module: 'knowledge', accepted: true, note: prompt },
      { module: 'd-thesis', accepted: true, note: 'open class, not 9-kind lock' },
      { module: 'semantic-3d', accepted: semantic.verification.uniqueParts && semantic.verification.allParentsExist, note: semantic.identity.kind },
      { module: 'represent', accepted: true, note: 'parametric parts' },
      { module: 'd-o15', accepted: true, note: 'segments=5' },
      { module: 'execute', accepted: mesh.verification.valid, note: `${mesh.vertices.length} verts` },
      { module: 'verify', accepted: mesh.verification.valid && Math.abs(critic.volume) > 1e-6, note: `volume ${critic.volume}` },
      { module: 'refine', accepted: true, note: 'no specialist geometry claimed' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: `Estrutura semântica → geometria para ${prompt}`,
      constraints: ['não limitar a 9 kinds', 'não reivindicar especialista Puter', 'sem ferramenta externa obrigatória'],
      resources: ['lexicon aberto', 'parametric mesh', 'critics'],
      priorities: { quality: 8, performance: 7, safety: 8, cost: 4, scalability: 8 },
    })
    return {
      format: 'ues-semantic-3d-v1',
      semantic,
      mesh: { vertices: mesh.vertices.length, triangles: mesh.triangles.length, valid: mesh.verification.valid },
      critic: { volume: critic.volume, intersections: critic.intersections, skinny: critic.skinny, assemblySelfIntersectExpected: semantic.parts.length > 1 },
      material: { id: material.id, class: material.class, storedBitmap16k: false },
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: semantic.verification.uniqueParts && semantic.verification.allParentsExist && mesh.verification.valid && Math.abs(critic.volume) > 1e-6 && kernel.verification.valid,
        catalogBound: false,
        specialistDerived: false,
      },
      limitations: ['Open-class parametric assembly', 'Not learned image-to-3D'],
    }
  }
}
