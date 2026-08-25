import { latLon } from '../ues-space/latlon.js'

export const heightAt = (seed: number, x: number, z: number, size: number, seaLevel = 0) => {
  const { lat, lon } = latLon(x, z, size)
  const wobble = (seed % 23) * 0.15
  const c1 = Math.exp(-((lon + 50 + wobble) ** 2) / 3000 - ((lat - 18) ** 2) / 2400)
  const c2 = Math.exp(-((lon - 70 - wobble) ** 2) / 3400 - ((lat + 8) ** 2) / 2600)
  const c3 = Math.exp(-((lon + 130) ** 2) / 2200 - ((lat + 32) ** 2) / 1700)
  const continent = Math.max(c1, c2 * 0.92, c3 * 0.78)
  const ridge = Math.sin((lon + (seed % 17)) * 0.075) * Math.cos((lat + (seed % 11)) * 0.1) * 0.22
  return Number((continent * 1.4 + ridge - 0.24 - seaLevel).toFixed(5))
}

export const heightField = (seed: number, size: number, seaLevel = 0) =>
  Array.from({ length: size }, (_, z) => Array.from({ length: size }, (_, x) => heightAt(seed, x, z, size, seaLevel)))
