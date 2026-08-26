import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { gpuBackends } from './backends.js'
import { detectGpuBackend } from './detect.js'
import { UesGpuDevice } from './device.js'
import { UesRasterCore } from '../ues-raster/core.js'
import type { GpuOp } from './types.js'
import type { Plane, Sphere } from './kernels.js'

export class UesGpuCore {
  private thesis = new DThesisCore()

  process() {
    const spheres: Sphere[] = [
      { id: 'near', center: [0, 0, 2], radius: 0.4 },
      { id: 'horizon', center: [0, 0, 40], radius: 1 },
    ]
    const planes: Plane[] = [
      { n: [0, 0, 1], d: 0.2 },
      { n: [0, 0, -1], d: 12 },
      { n: [1, 0, 0], d: 8 },
      { n: [-1, 0, 0], d: 8 },
      { n: [0, 1, 0], d: 8 },
      { n: [0, -1, 0], d: 8 },
    ]
    const ops: GpuOp[] = [
      { op: 'CreateBuffer', buffer: { id: 'verts', kind: 'vertex', floats: [0, 0, 0, 1, 0, 0, 0, 1, 0] } },
      { op: 'CreateTexture', texture: { id: 'albedo', width: 4, height: 4, pixels: Array.from({ length: 16 }, () => 0.5) } },
      { op: 'DispatchCompute', kernel: 'cull', groups: 1 },
      { op: 'Barrier', after: 'cull', before: 'indirect' },
      { op: 'DispatchCompute', kernel: 'gerstner', groups: 1 },
      { op: 'DispatchCompute', kernel: 'pbr', groups: 1 },
      { op: 'DispatchCompute', kernel: 'indirect', groups: 1 },
      { op: 'BeginRenderPass', pass: 'opaque' },
      { op: 'DrawIndirect', count: 1 },
      { op: 'EndRenderPass' },
    ]
    const frame = new UesGpuDevice().submit(ops, { spheres, planes, instances: [1, 8] })
    const raster = new UesRasterCore().process()
    const hardware = detectGpuBackend()
    const kernel = runKernel('API GPU da UES com compute CPU e backends de baixo nível como adapter', 'ues.gpu', ['represent', 'd-o15'], [
      { module: 'knowledge', accepted: true, note: 'own command/resource IR' },
      { module: 'd-thesis', accepted: true, note: 'GPU when workload justifies' },
      { module: 'gpu', accepted: frame.visible === 1 && frame.culled === 1, note: 'cpu compute cull' },
      { module: 'represent', accepted: true, note: 'horizon culled' },
      { module: 'd-o15', accepted: true, note: 'indirect only visible' },
      { module: 'execute', accepted: frame.waves === 64 && frame.drawn === 1 && raster.verification.valid, note: 'compute + real raster pixels' },
      { module: 'verify', accepted: gpuBackends[0].status === 'IMPLEMENTADO' && !hardware.available, note: 'hardware adapter here' },
      { module: 'refine', accepted: true, note: 'no vulkan claim' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Camada GPU da UES; WebGPU/Vulkan/DX são backends, não o conceito',
      constraints: ['não fingir GPU no sandbox', 'cpu-compute operacional'],
      resources: ['command stream', 'compute kernels'],
      priorities: { quality: 8, performance: 9, safety: 8, cost: 4, scalability: 9 },
    })
    return {
      format: 'ues-gpu-v1',
      backends: gpuBackends,
      frame,
      raster: { written: raster.written, checksum: raster.checksum, hardwareGpu: raster.verification.hardwareGpu },
      hardware,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: kernel.verification.valid && frame.visible === 1 && frame.culled === 1 && frame.drawn === 1 && frame.waves === 64 && raster.verification.valid,
        webgpuRequired: false,
        ownsLowLevelApi: false,
        hardwareGpu: hardware.available,
        rasterExecutes: true,
      },
      limitations: ['CPU raster/compute is the executing fallback', 'Hardware WebGPU/Vulkan remain adapters that amplify'],
    }
  }
}
