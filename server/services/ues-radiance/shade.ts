import { cameraRay, sampleSky } from '../ues-atmosphere/sky.js'
import type { GBuffer } from '../ues-gbuffer/layout.js'
import { evaluateBrdf } from '../ues-light/brdf.js'
import { splitSumAmbient } from '../ues-light/ibl.js'
import { sampleLight } from '../ues-light/lights.js'
import type { SceneLight } from '../ues-light/types.js'
import { add, norm, reflect, scale, sub, type V3 } from '../ues-light/vec.js'
import { sampleShadow, type ShadowMap } from '../ues-shadow/map.js'
import type { Camera } from './camera.js'

export const shadeBuffer = (
  buffer: GBuffer,
  camera: Camera,
  lights: SceneLight[],
  shadow: ShadowMap,
  options: { direct: boolean; ibl: boolean },
) => {
  const hdr = new Float32Array(buffer.width * buffer.height * 3)
  const sun = lights.find(item => item.kind === 'directional')
  const sunDir = sun && sun.kind === 'directional' ? sun.dir : [0.4, 0.8, 0.3] as V3
  const tanHalf = Math.tan(camera.fovY / 2)
  let metalPixels = 0
  let plasticPixels = 0
  let shadowed = 0
  let litGround = 0
  let shadowAccum = 0
  let litAccum = 0
  const metalSum: V3 = [0, 0, 0]
  const plasticSum: V3 = [0, 0, 0]
  for (let y = 0; y < buffer.height; y++) {
    for (let x = 0; x < buffer.width; x++) {
      const index = y * buffer.width + x
      const out = index * 3
      if (buffer.material[index] < 0) {
        const ndcX = ((x + 0.5) / buffer.width) * 2 - 1
        const ndcY = 1 - ((y + 0.5) / buffer.height) * 2
        const ray = cameraRay(camera.forward, camera.right, camera.camUp, ndcX, ndcY, tanHalf, camera.aspect)
        const sky = sampleSky(ray, sunDir)
        hdr[out] = sky[0]
        hdr[out + 1] = sky[1]
        hdr[out + 2] = sky[2]
        continue
      }
      const world: V3 = [buffer.world[out], buffer.world[out + 1], buffer.world[out + 2]]
      const N = norm([buffer.normal[out], buffer.normal[out + 1], buffer.normal[out + 2]])
      const V = norm(sub(camera.eye, world))
      const albedo: V3 = [buffer.albedo[out], buffer.albedo[out + 1], buffer.albedo[out + 2]]
      const material = {
        albedo,
        roughness: buffer.roughness[index],
        metalness: buffer.metalness[index],
        ior: buffer.metalness[index] > 0.5 ? 2.5 : 1.5,
        emission: [buffer.emission[out], buffer.emission[out + 1], buffer.emission[out + 2]] as V3,
      }
      let color: V3 = [...material.emission]
      if (options.direct) {
        for (const light of lights) {
          const sample = sampleLight(light, world)
          if (!sample || sample.intensity <= 0) continue
          const visibility = sample.castsShadow ? sampleShadow(shadow, [world[0] + N[0] * 0.03, world[1] + N[1] * 0.03, world[2] + N[2] * 0.03]) : 1
          if (sample.castsShadow && visibility < 0.45 && buffer.material[index] === 0) {
            shadowed += 1
            shadowAccum += visibility
          } else if (buffer.material[index] === 0) {
            litGround += 1
            litAccum += visibility
          }
          const lit = evaluateBrdf(material, N, V, sample.L, scale(sample.color, sample.intensity * visibility))
          color = add(color, lit)
        }
      }
      if (options.ibl) {
        const R = reflect(scale(V, -1), N)
        color = add(color, splitSumAmbient(albedo, material.metalness, N, R, material.roughness, sunDir))
      }
      hdr[out] = color[0]
      hdr[out + 1] = color[1]
      hdr[out + 2] = color[2]
      if (buffer.material[index] === 1) {
        metalPixels += 1
        metalSum[0] += color[0]
        metalSum[1] += color[1]
        metalSum[2] += color[2]
      }
      if (buffer.material[index] === 2) {
        plasticPixels += 1
        plasticSum[0] += color[0]
        plasticSum[1] += color[1]
        plasticSum[2] += color[2]
      }
    }
  }
  return {
    hdr,
    stats: {
      written: buffer.written,
      metalPixels,
      plasticPixels,
      shadowed,
      litGround,
      meanMetal: metalPixels ? metalSum.map(value => value / metalPixels) as V3 : [0, 0, 0],
      meanPlastic: plasticPixels ? plasticSum.map(value => value / plasticPixels) as V3 : [0, 0, 0],
      meanShadow: shadowed ? shadowAccum / shadowed : 1,
      meanLit: litGround ? litAccum / litGround : 0,
    },
  }
}
