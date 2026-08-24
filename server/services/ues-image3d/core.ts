import { DThesisCore } from '../d-thesis/core.js'
import { inspect } from '../ues-retopo/inspect.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { UesSemantic3dCore } from '../ues-semantic-3d/core.js'
import { compileMaterialPrompt } from '../ues-titko/pbr.js'
import { bumpImage, heightMesh } from './height.js'
import { image3dProviders } from './providers.js'

export class UesImage3dCore {
  private thesis = new DThesisCore()
  private semantic = new UesSemantic3dCore()

  process(prompt = 'colina a partir de referencia de luminancia') {
    const image = bumpImage(12, 12)
    const mesh = heightMesh(image)
    const topology = inspect({ vertices: mesh.vertices, triangles: mesh.triangles })
    const open = this.semantic.process(prompt)
    const material = compileMaterialPrompt(prompt)
    const kernel = runKernel(`Image/text → 3D interno para ${prompt}`, 'ues.image3d', ['semantic-3d', 'solid'], [
      { module: 'knowledge', accepted: true, note: 'luminance field, not learned vision' },
      { module: 'd-thesis', accepted: true, note: 'fallback when Puter vision absent' },
      { module: 'image3d', accepted: mesh.peak > 0.2, note: 'center higher' },
      { module: 'represent', accepted: true, note: 'heightfield mesh' },
      { module: 'd-o15', accepted: true, note: '12x12' },
      { module: 'execute', accepted: topology.valid && open.verification.valid, note: 'mesh + semantic' },
      { module: 'verify', accepted: !image3dProviders[1].executable, note: 'vision adapter' },
      { module: 'refine', accepted: !material.storedBitmap16k, note: 'titko' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Converter referência em malha sem tornar Puter obrigatório',
      constraints: ['não fingir visão aprendida', 'fallback interno'],
      resources: ['heightfield', 'semantic-3d'],
      priorities: { quality: 8, performance: 7, safety: 8, cost: 4, scalability: 7 },
    })
    return {
      format: 'ues-image3d-v1',
      prompt,
      providers: image3dProviders,
      mesh: { vertices: mesh.vertices.length, triangles: mesh.triangles.length, peak: Number(mesh.peak.toFixed(4)) },
      topology,
      semantic: { kind: open.semantic.identity.kind, catalogBound: open.verification.catalogBound },
      material: { id: material.id, storedBitmap16k: material.storedBitmap16k },
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: kernel.verification.valid && mesh.peak > 0.2 && topology.valid && !image3dProviders[1].executable,
        learnedVision: false,
        puterRequired: false,
      },
      limitations: ['Luminance heightfield + open-class fallback', 'Not a learned multi-view reconstructor'],
    }
  }
}
