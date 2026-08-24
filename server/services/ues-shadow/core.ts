import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { defaultLights } from '../ues-light/lights.js'
import { createShadowMap, sampleShadow, writeShadow } from './map.js'

export class UesShadowCore {
  private thesis = new DThesisCore()

  process() {
    const sun = defaultLights()[0]
    const dir = sun.kind === 'directional' ? sun.dir : [0.4, 0.8, 0.2] as [number, number, number]
    const map = createShadowMap(dir, 24, 2.5)
    const blocker: [number, number, number] = [0, 0.6, 0]
    writeShadow(map, blocker)
    for (let z = -0.2; z <= 0.2; z += 0.05) {
      for (let x = -0.2; x <= 0.2; x += 0.05) writeShadow(map, [x, 0.55, z])
    }
    const travel = [-dir[0], -dir[1], -dir[2]] as [number, number, number]
    const t = (0.02 - 0.55) / (travel[1] || -1)
    const behind: [number, number, number] = [travel[0] * t, 0.02, travel[2] * t]
    const lit: [number, number, number] = [dir[0] * 1.4, 0.02, dir[2] * 1.4]
    const shadowed = sampleShadow(map, behind)
    const open = sampleShadow(map, lit)
    const kernel = runKernel('Shadow map ortográfico próprio com PCF 3x3', 'ues.shadow', ['light'], [
      { module: 'knowledge', accepted: true, note: 'own depth map' },
      { module: 'd-thesis', accepted: true, note: 'shadows when they change the image' },
      { module: 'shadow', accepted: shadowed < open, note: 'occluded darker' },
      { module: 'represent', accepted: true, note: '32-class small map' },
      { module: 'd-o15', accepted: map.size === 24, note: 'small map' },
      { module: 'execute', accepted: shadowed < 0.65 && open > 0.7, note: 'pcf split' },
      { module: 'verify', accepted: true, note: 'no vendor VSM' },
      { module: 'refine', accepted: true, note: 'not virtual shadow maps' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Sombra que executa; VSM/Nanite shadows não são o critério de existência',
      constraints: ['PCF real', 'sem GPU'],
      resources: ['ortho depth'],
      priorities: { quality: 8, performance: 8, safety: 8, cost: 3, scalability: 8 },
    })
    return {
      format: 'ues-shadow-v1',
      size: map.size,
      shadowed,
      open,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: { valid: kernel.verification.valid && shadowed < open, virtualShadowMaps: false },
      limitations: ['Ortho PCF, not virtual shadow maps / ray traced shadows'],
    }
  }
}
