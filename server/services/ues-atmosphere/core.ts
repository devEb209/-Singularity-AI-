import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { defaultLights } from '../ues-light/lights.js'
import { sampleSky } from './sky.js'

export class UesAtmosphereCore {
  private thesis = new DThesisCore()

  process() {
    const sun = defaultLights()[0]
    const sunDir = sun.kind === 'directional' ? sun.dir : [0, 1, 0] as [number, number, number]
    const zenith = sampleSky([0, 1, 0], sunDir)
    const horizon = sampleSky([1, 0, 0], sunDir)
    const ground = sampleSky([0, -1, 0], sunDir)
    const towardSun = sampleSky(sunDir, sunDir)
    const kernel = runKernel('Céu analítico da UES; Preetham/Hosek externos são adapters', 'ues.atmosphere', ['light'], [
      { module: 'knowledge', accepted: true, note: 'analytical sky' },
      { module: 'd-thesis', accepted: true, note: 'reference atmosphere, not NASA' },
      { module: 'atmosphere', accepted: zenith[2] > horizon[2], note: 'zenith bluer' },
      { module: 'represent', accepted: true, note: 'direction sample' },
      { module: 'd-o15', accepted: true, note: 'no sky cubemap store' },
      { module: 'execute', accepted: towardSun[0] > zenith[0] && ground[1] < horizon[1], note: 'sun disc + ground' },
      { module: 'verify', accepted: zenith.every(Number.isFinite), note: 'finite' },
      { module: 'refine', accepted: true, note: 'measured spectral sky remains next' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Iluminação de céu própria; datasets espectrais externos ampliam',
      constraints: ['não exigir NASA', 'não fingir path tracing'],
      resources: ['analytical sky'],
      priorities: { quality: 8, performance: 8, safety: 8, cost: 3, scalability: 8 },
    })
    return {
      format: 'ues-atmosphere-v1',
      zenith,
      horizon,
      ground,
      sun: towardSun,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: { valid: kernel.verification.valid && towardSun[0] > zenith[0], nasaRequired: false },
      limitations: ['Analytical gradient + sun disc', 'Not Hosek-Wilkie measured'],
    }
  }
}
