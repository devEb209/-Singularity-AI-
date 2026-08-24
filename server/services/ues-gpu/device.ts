import type { GpuBuffer, GpuOp, GpuTexture } from './types.js'
import { cullSpheres, evaluatePbr, expandIndirect, gerstnerField, type Plane, type Sphere } from './kernels.js'

export class UesGpuDevice {
  buffers = new Map<string, GpuBuffer>()
  textures = new Map<string, GpuTexture>()
  lastCull: { id: string; visible: boolean }[] = []
  lastWaves: number[] = []
  lastShaded: [number, number, number] = [0, 0, 0]
  drawn = 0

  submit(ops: GpuOp[], scene: { spheres: Sphere[]; planes: Plane[]; instances: number[] }) {
    for (const op of ops) {
      if (op.op === 'CreateBuffer') this.buffers.set(op.buffer.id, op.buffer)
      if (op.op === 'CreateTexture') this.textures.set(op.texture.id, op.texture)
      if (op.op === 'DispatchCompute' && op.kernel === 'cull') this.lastCull = cullSpheres(scene.spheres, scene.planes)
      if (op.op === 'DispatchCompute' && op.kernel === 'gerstner') this.lastWaves = gerstnerField(8, 0.4)
      if (op.op === 'DispatchCompute' && op.kernel === 'pbr') this.lastShaded = evaluatePbr([0.6, 0.2, 0.1], 0.35, 0.05, 0.8)
      if (op.op === 'DispatchCompute' && op.kernel === 'indirect') {
        this.drawn = expandIndirect(this.lastCull.map(item => item.visible), scene.instances)
      }
    }
    return {
      buffers: this.buffers.size,
      textures: this.textures.size,
      visible: this.lastCull.filter(item => item.visible).length,
      culled: this.lastCull.filter(item => !item.visible).length,
      waves: this.lastWaves.length,
      shaded: this.lastShaded,
      drawn: this.drawn,
    }
  }
}
