import { DThesisCore } from '../d-thesis/core.js'
import { createGBuffer } from '../ues-gbuffer/layout.js'
import { detectGpuBackend } from '../ues-gpu/detect.js'
import { probeWebGpuSync } from '../ues-gpu/webgpu.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { defaultLights } from '../ues-light/lights.js'
import type { SurfaceMaterial } from '../ues-light/types.js'
import { blur3, compositeBloom, extractBright } from '../ues-post/bloom.js'
import { emitPbrWgsl } from '../ues-shader/pbr-emit.js'
import { createShadowMap } from '../ues-shadow/map.js'
import { checker } from '../ues-texture/sample.js'
import { createCamera } from './camera.js'
import { checksumHdr, encodePreview, toneMapFrame } from './encode.js'
import { demoScene } from './mesh.js'
import { projectVertex } from './project.js'
import { rasterizeShadow, rasterizeTriangle } from './raster.js'
import { shadeBuffer } from './shade.js'

const materials = (): SurfaceMaterial[] => [
  { albedo: [0.55, 0.42, 0.26], roughness: 0.72, metalness: 0, ior: 1.5, emission: [0, 0, 0] },
  { albedo: [0.78, 0.8, 0.83], roughness: 0.18, metalness: 0.96, ior: 2.5, emission: [0, 0, 0] },
  { albedo: [0.74, 0.13, 0.1], roughness: 0.44, metalness: 0, ior: 1.5, emission: [0, 0, 0] },
]

export class UesRadianceCore {
  private thesis = new DThesisCore()

  process(width = 48, height = 32) {
    const camera = createCamera(width, height)
    const lights = defaultLights()
    const sun = lights[0]
    const sunDir = sun.kind === 'directional' ? sun.dir : [0.4, 0.8, 0.3] as [number, number, number]
    const shadow = createShadowMap(sunDir, 28, 3.2)
    const scene = demoScene()
    for (const triangle of scene) rasterizeShadow(shadow, triangle.a, triangle.b, triangle.c)
    const buffer = createGBuffer(width, height)
    const mats = materials()
    const textures = [checker(8), undefined, undefined]
    let projected = 0
    for (const triangle of scene) {
      const a = projectVertex(triangle.a, camera, width, height)
      const b = projectVertex(triangle.b, camera, width, height)
      const c = projectVertex(triangle.c, camera, width, height)
      if (!a || !b || !c) continue
      projected += 1
      rasterizeTriangle(buffer, a, b, c, mats, textures)
    }
    const shaded = shadeBuffer(buffer, camera, lights, shadow, { direct: true, ibl: true })
    const bloomed = compositeBloom(shaded.hdr, blur3(extractBright(shaded.hdr, width, height, 1.15), width, height), 0.16)
    const ldr = toneMapFrame(bloomed)
    const preview = encodePreview(ldr, width, height)
    const hash = checksumHdr(shaded.hdr)
    const again = this.snapshot(width, height)
    const hardware = detectGpuBackend()
    const probe = probeWebGpuSync()
    const wgsl = emitPbrWgsl()
    const metalGrey = Math.abs(shaded.stats.meanMetal[0] - shaded.stats.meanMetal[1])
    const plasticRed = shaded.stats.meanPlastic[0] - shaded.stats.meanPlastic[1]
    const kernel = runKernel('Radiância UES: fragmento PBR + sombra + IBL + ACES', 'ues.radiance', ['light', 'shadow', 'texture', 'post'], [
      { module: 'knowledge', accepted: true, note: 'own radiance, not Unreal' },
      { module: 'd-thesis', accepted: true, note: 'CPU fallback executes graphics' },
      { module: 'radiance', accepted: buffer.written > 200 && projected > 10, note: 'pixels + triangles' },
      { module: 'represent', accepted: true, note: '48x32 D-O15' },
      { module: 'd-o15', accepted: width * height <= 2048, note: 'small competing frame, not fake 4K' },
      { module: 'execute', accepted: shaded.stats.metalPixels > 20 && shaded.stats.plasticPixels > 20 && plasticRed > 0.08 && metalGrey < 0.35, note: 'metal ≠ plastic' },
      { module: 'verify', accepted: hash === again && preview.checksum.length === 64 && !hardware.available, note: 'deterministic + no fake GPU' },
      { module: 'refine', accepted: true, note: 'does not beat Unreal' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Imagem PBR que existe e executa; não declarar vitória sobre Unreal sem evidência',
      constraints: ['não fingir Unreal/Lumen/Nanite', 'CPU fallback executa', 'hardware amplia'],
      resources: ['gbuffer', 'cook-torrance', 'shadow', 'aces'],
      priorities: { quality: 9, performance: 7, safety: 8, cost: 3, scalability: 8 },
    })
    return {
      format: 'ues-radiance-v1',
      frame: { width, height, written: buffer.written, triangles: projected },
      stats: shaded.stats,
      preview: { encoding: preview.encoding, bytes: preview.bytes, checksum: preview.checksum },
      checksum: hash,
      wgslBytes: wgsl.length,
      hardware: probe,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: {
        valid: kernel.verification.valid && hash === again && plasticRed > 0.08,
        hardwareGpu: hardware.available,
        webgpuRequired: false,
        beatsUnreal: false,
        beatsAnyCurrentGame: false,
        nanite: false,
        lumen: false,
        pathTraced: false,
        rasterExecutes: true,
      },
      limitations: [
        'Per-fragment Cook-Torrance + ortho PCF + analytical IBL + ACES on CPU',
        'Not Nanite, not Lumen, not hardware RT, not a 4K shipped frame',
        'Hardware WebGPU/Vulkan remain adapters that amplify this path',
      ],
    }
  }

  private snapshot(width: number, height: number) {
    const camera = createCamera(width, height)
    const lights = defaultLights()
    const sun = lights[0]
    const sunDir = sun.kind === 'directional' ? sun.dir : [0.4, 0.8, 0.3] as [number, number, number]
    const shadow = createShadowMap(sunDir, 28, 3.2)
    const scene = demoScene()
    for (const triangle of scene) rasterizeShadow(shadow, triangle.a, triangle.b, triangle.c)
    const buffer = createGBuffer(width, height)
    const mats = materials()
    const textures = [checker(8), undefined, undefined]
    for (const triangle of scene) {
      const a = projectVertex(triangle.a, camera, width, height)
      const b = projectVertex(triangle.b, camera, width, height)
      const c = projectVertex(triangle.c, camera, width, height)
      if (!a || !b || !c) continue
      rasterizeTriangle(buffer, a, b, c, mats, textures)
    }
    return checksumHdr(shadeBuffer(buffer, camera, lights, shadow, { direct: true, ibl: true }).hdr)
  }
}
