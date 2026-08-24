import { describe, expect, it } from 'vitest'
import { probeWebGpu, probeWebGpuSync } from '../ues-gpu/webgpu.js'
import { emitPbrWgsl } from '../ues-shader/pbr-emit.js'
import { createCamera } from './camera.js'
import { UesRadianceCore } from './core.js'
import { demoScene } from './mesh.js'
import { projectVertex } from './project.js'

describe('UES radiance PBR frame', () => {
  it('projects the look-at target into the frame and keeps winding usable', () => {
    const camera = createCamera(48, 32)
    const clip = projectVertex({ p: [0, 0.42, 0], n: [0, 1, 0], uv: [0.5, 0.5], material: 0 }, camera, 48, 32)
    expect(clip).not.toBeNull()
    expect(clip!.x).toBeGreaterThan(16)
    expect(clip!.x).toBeLessThan(32)
    expect(clip!.y).toBeGreaterThan(8)
    expect(clip!.y).toBeLessThan(24)
    expect(clip!.z).toBeGreaterThan(0)
    expect(clip!.z).toBeLessThan(1)
    expect(demoScene().length).toBeGreaterThan(20)
  })

  it('renders metal ≠ plastic, writes a deterministic frame and refuses Unreal claims', async () => {
    const result = new UesRadianceCore().process(48, 32)
    expect(result.frame.written).toBeGreaterThan(200)
    expect(result.stats.metalPixels).toBeGreaterThan(20)
    expect(result.stats.plasticPixels).toBeGreaterThan(20)
    expect(result.stats.meanPlastic[0]).toBeGreaterThan(result.stats.meanPlastic[1] + 0.05)
    expect(Math.abs(result.stats.meanMetal[0] - result.stats.meanMetal[1])).toBeLessThan(0.35)
    expect(result.checksum).toHaveLength(64)
    expect(result.verification.valid).toBe(true)
    expect(result.verification.beatsUnreal).toBe(false)
    expect(result.verification.beatsAnyCurrentGame).toBe(false)
    expect(result.verification.nanite).toBe(false)
    expect(result.verification.lumen).toBe(false)
    expect(result.verification.hardwareGpu).toBe(false)
    expect(result.verification.rasterExecutes).toBe(true)
    expect(emitPbrWgsl()).toContain('ues_cook_torrance')
    expect(emitPbrWgsl()).toContain('ues_ggx_d')
    expect(probeWebGpuSync().available).toBe(false)
    const hardware = await probeWebGpu()
    expect(hardware.available).toBe(false)
    expect(hardware.reason).toBe('no-navigator-gpu')
  })
})
