import type { WaveSample } from './types.js'

export const gerstner = (x: number, z: number, time: number, amplitude = 0.05, wave = 0.7, omega = 1.3) =>
  amplitude * Math.sin(wave * x + wave * 0.4 * z - omega * time)

export const oceanWaves = (heights: number[][], time: number): WaveSample[] => {
  const samples: WaveSample[] = []
  for (let z = 0; z < heights.length; z += 3) {
    for (let x = 0; x < heights.length; x += 3) {
      if (heights[z][x] > 0) continue
      samples.push({ x, z, eta: Number(gerstner(x, z, time).toFixed(5)) })
    }
  }
  return samples
}

export const pressure = (depth: number) => Number((1000 * 9.81 * Math.max(0, depth)).toFixed(3))
