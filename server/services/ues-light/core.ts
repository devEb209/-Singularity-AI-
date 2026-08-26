import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { evaluateBrdf, fresnel0 } from './brdf.js'
import { splitSumAmbient } from './ibl.js'
import { defaultLights, sampleLight } from './lights.js'
import type { SurfaceMaterial } from './types.js'
import { luminance, type V3 } from './vec.js'

const chrome: SurfaceMaterial = { albedo: [0.78, 0.8, 0.82], roughness: 0.16, metalness: 0.96, ior: 2.5, emission: [0, 0, 0] }
const plastic: SurfaceMaterial = { albedo: [0.78, 0.8, 0.82], roughness: 0.16, metalness: 0, ior: 1.5, emission: [0, 0, 0] }

export class UesLightCore {
  private thesis = new DThesisCore()

  process() {
    const N: V3 = [0, 1, 0]
    const metal = evaluateBrdf(chrome, N, N, N, [3.2, 3.1, 2.9])
    const dielectric = evaluateBrdf(plastic, N, N, N, [3.2, 3.1, 2.9])
    const dark = evaluateBrdf(chrome, N, N, [0, -1, 0], [3.2, 3.1, 2.9])
    const lights = defaultLights()
    const sample = sampleLight(lights[1], [0, 0.4, 0])
    const ibl = splitSumAmbient(chrome.albedo, 1, N, N, 0.2, lights[0].kind === 'directional' ? lights[0].dir : N)
    const f0Metal = fresnel0(chrome.albedo, 1, chrome.ior)
    const f0Plastic = fresnel0(plastic.albedo, 0, plastic.ior)
    const kernel = runKernel('Iluminação PBR própria da UES: Cook-Torrance RGB + IBL analítico', 'ues.light', ['titko', 'atmosphere'], [
      { module: 'knowledge', accepted: true, note: 'GGX Smith Schlick' },
      { module: 'd-thesis', accepted: true, note: 'graphics when the objective needs it' },
      { module: 'light', accepted: luminance(metal) > luminance(dielectric), note: 'metal highlight' },
      { module: 'represent', accepted: true, note: 'RGB lobes, not a slider' },
      { module: 'd-o15', accepted: true, note: 'analytic IBL, no cubemap store' },
      { module: 'execute', accepted: luminance(dark) === 0 && (sample?.intensity ?? 0) > 0 && luminance(ibl) > 0, note: 'backface + point + ibl' },
      { module: 'verify', accepted: f0Metal[0] > 0.5 && f0Plastic[0] < 0.08, note: 'F0 split' },
      { module: 'refine', accepted: true, note: 'not Lumen / not path traced' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'BRDF que executa; Lumen/path tracing não são o critério de existência',
      constraints: ['não fingir Unreal', 'não exigir GPU'],
      resources: ['cook-torrance', 'lights', 'ibl'],
      priorities: { quality: 9, performance: 8, safety: 8, cost: 3, scalability: 8 },
    })
    return {
      format: 'ues-light-v1',
      metal,
      dielectric,
      ibl,
      lights: lights.length,
      f0: { metal: f0Metal, dielectric: f0Plastic },
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: kernel.verification.valid && luminance(metal) > luminance(dielectric) && luminance(ibl) > 0,
        lumen: false,
        pathTraced: false,
        hardwareGpu: false,
      },
      limitations: ['Analytical IBL, not measured HDRI', 'Not Lumen / not hardware RT'],
    }
  }
}
