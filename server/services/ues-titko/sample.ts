import type { TitkoMaterial } from './graph.js'

const wave = (u: number, v: number, freq: number, phase: number) =>
  0.5 + 0.5 * Math.sin(u * freq * Math.PI * 2 + phase) * Math.cos(v * freq * Math.PI * 2 + phase * 0.6)

export const sampleChannel = (material: TitkoMaterial, u: number, v: number, octaves: number) => {
  let value = 0
  let amp = 1
  let freq = 1
  let norm = 0
  for (let i = 0; i < octaves; i++) {
    value += amp * wave(u + material.seed * 0.01, v, freq, material.seed * 0.1 + i)
    norm += amp
    amp *= 0.5
    freq *= 2
  }
  return value / Math.max(1e-6, norm)
}

export const samplePatch = (material: TitkoMaterial, resolution: number, octaves: number) => {
  const pixels: number[] = []
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const u = x / Math.max(1, resolution - 1)
      const v = y / Math.max(1, resolution - 1)
      const base = sampleChannel(material, u, v, octaves)
      const grain = octaves > 3 ? 0.18 * Math.sin((u * 48 + v * 31 + material.seed) * Math.PI) : 0
      pixels.push(Math.max(0, Math.min(1, base + grain)))
    }
  }
  const mean = pixels.reduce((sum, value) => sum + value, 0) / pixels.length
  const variance = pixels.reduce((sum, value) => sum + (value - mean) ** 2, 0) / pixels.length
  let gradient = 0
  for (let i = 1; i < pixels.length; i++) gradient += Math.abs(pixels[i] - pixels[i - 1])
  return { resolution, octaves, mean: Number(mean.toFixed(5)), variance: Number(variance.toFixed(6)), gradient: Number(gradient.toFixed(4)), pixels: pixels.length }
}

export const budgetedResolution = (tier: 'low' | 'balanced' | 'high') => (tier === 'low' ? 16 : tier === 'high' ? 64 : 32)
