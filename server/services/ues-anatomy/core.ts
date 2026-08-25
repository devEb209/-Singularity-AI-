import { UesAdvancedPipeline } from '../ues-advanced-pipeline.js'
import { DThesisCore } from '../d-thesis/core.js'
import { deformationQuality, linearBlend } from './deform.js'
import { chooseTemplate, fitBones, skin } from './infer.js'
import type { V3 } from './types.js'

export class UesAnatomyCore {
  private thesis = new DThesisCore()
  private advanced = new UesAdvancedPipeline({} as never, {} as never)

  process(prompt = 'humano') {
    const semantic = this.advanced.semanticObject(prompt)
    const mesh = this.advanced.parametricMesh(semantic, 5)
    const min: V3 = [Infinity, Infinity, Infinity]
    const max: V3 = [-Infinity, -Infinity, -Infinity]
    for (const vertex of mesh.vertices) {
      for (let axis = 0; axis < 3; axis++) {
        min[axis] = Math.min(min[axis], vertex[axis])
        max[axis] = Math.max(max[axis], vertex[axis])
      }
    }
    const template = chooseTemplate(semantic.identity.kind)
    const bones = fitBones(template, { min, max })
    const weights = skin(mesh.vertices, bones)
    const normalized = weights.every(set => Math.abs(set.reduce((sum, item) => sum + item.weight, 0) - 1) < 1e-6)
    const posed = linearBlend(mesh.vertices, bones, weights, bones.find(item => item.role === 'spine')?.id ?? bones[0].id, 0.4)
    const quality = deformationQuality(mesh.vertices, posed)
    const dThesis = this.thesis.evaluate({
      objective: 'Inferir esqueleto anatômico e pesos de pele a partir de partes semânticas',
      constraints: ['não reivindicar captura de performance', 'pesos normalizados'],
      resources: ['semantic parts', 'CPU'],
      priorities: { quality: 8, performance: 6, safety: 8, cost: 5, scalability: 6 },
    })
    return {
      format: 'ues-anatomy-v1',
      kind: semantic.identity.kind,
      bones: bones.map(bone => ({ id: bone.id, parent: bone.parent, role: bone.role })),
      influences: 2,
      quality,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: normalized && quality.valid && bones.length >= 6,
        normalized,
        boneCount: bones.length,
      },
      limitations: ['Template fit, not scanned anatomy'],
    }
  }
}
