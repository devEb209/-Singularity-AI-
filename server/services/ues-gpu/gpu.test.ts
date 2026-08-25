import { describe, expect, it } from 'vitest'
import { UesGpuCore } from './core.js'
import { UesGpuDevice } from './device.js'
import { cullSpheres, evaluatePbr, gerstnerField } from './kernels.js'

describe('UES GPU abstraction', () => {
  it('culls far spheres, evaluates PBR and runs compute without requiring WebGPU', () => {
    const planes = [
      { n: [0, 0, 1] as [number, number, number], d: 0.2 },
      { n: [0, 0, -1] as [number, number, number], d: 8 },
    ]
    const vis = cullSpheres([
      { id: 'near', center: [0, 0, 1], radius: 0.2 },
      { id: 'far', center: [0, 0, 40], radius: 0.2 },
    ], planes)
    expect(vis[0].visible).toBe(true)
    expect(vis[1].visible).toBe(false)
    expect(gerstnerField(4, 0).length).toBe(16)
    const lit = evaluatePbr([1, 0, 0], 0.2, 0, 1)
    const dark = evaluatePbr([1, 0, 0], 0.2, 0, -1)
    expect(lit[0]).toBeGreaterThan(dark[0])
    const device = new UesGpuDevice()
    const frame = device.submit([
      { op: 'DispatchCompute', kernel: 'cull', groups: 1 },
      { op: 'DispatchCompute', kernel: 'indirect', groups: 1 },
    ], { spheres: [{ id: 'a', center: [0, 0, 1], radius: 0.2 }], planes, instances: [3] })
    expect(frame.drawn).toBe(3)
    const result = new UesGpuCore().process()
    expect(result.verification.valid).toBe(true)
    expect(result.verification.webgpuRequired).toBe(false)
    expect(result.verification.rasterExecutes).toBe(true)
    expect(result.verification.hardwareGpu).toBe(false)
    expect(result.raster.written).toBeGreaterThan(40)
  })
})
