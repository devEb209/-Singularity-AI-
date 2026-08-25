export interface GBuffer {
  width: number
  height: number
  albedo: Float32Array
  normal: Float32Array
  world: Float32Array
  uv: Float32Array
  roughness: Float32Array
  metalness: Float32Array
  emission: Float32Array
  depth: Float32Array
  material: Int16Array
  written: number
}

export const createGBuffer = (width: number, height: number): GBuffer => ({
  width,
  height,
  albedo: new Float32Array(width * height * 3),
  normal: new Float32Array(width * height * 3),
  world: new Float32Array(width * height * 3),
  uv: new Float32Array(width * height * 2),
  roughness: new Float32Array(width * height),
  metalness: new Float32Array(width * height),
  emission: new Float32Array(width * height * 3),
  depth: new Float32Array(width * height).fill(1),
  material: new Int16Array(width * height).fill(-1),
  written: 0,
})

export const writeGBuffer = (
  buffer: GBuffer,
  x: number,
  y: number,
  z: number,
  sample: {
    albedo: [number, number, number]
    normal: [number, number, number]
    world: [number, number, number]
    uv: [number, number]
    roughness: number
    metalness: number
    emission: [number, number, number]
    material: number
  },
) => {
  if (x < 0 || y < 0 || x >= buffer.width || y >= buffer.height) return false
  const index = y * buffer.width + x
  if (z >= buffer.depth[index]) return false
  if (buffer.material[index] < 0) buffer.written += 1
  buffer.depth[index] = z
  buffer.material[index] = sample.material
  buffer.roughness[index] = sample.roughness
  buffer.metalness[index] = sample.metalness
  const c = index * 3
  buffer.albedo[c] = sample.albedo[0]
  buffer.albedo[c + 1] = sample.albedo[1]
  buffer.albedo[c + 2] = sample.albedo[2]
  buffer.normal[c] = sample.normal[0]
  buffer.normal[c + 1] = sample.normal[1]
  buffer.normal[c + 2] = sample.normal[2]
  buffer.world[c] = sample.world[0]
  buffer.world[c + 1] = sample.world[1]
  buffer.world[c + 2] = sample.world[2]
  buffer.emission[c] = sample.emission[0]
  buffer.emission[c + 1] = sample.emission[1]
  buffer.emission[c + 2] = sample.emission[2]
  buffer.uv[index * 2] = sample.uv[0]
  buffer.uv[index * 2 + 1] = sample.uv[1]
  return true
}
