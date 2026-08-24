import { at, sample, type GrayImage } from './filters.js'

export const motion = (prev: GrayImage, next: GrayImage, block = 4) => {
  const vectors: { x: number; y: number; dx: number; dy: number }[] = []
  for (let y = 0; y < prev.height; y += block) {
    for (let x = 0; x < prev.width; x += block) {
      let best = { dx: 0, dy: 0, err: Infinity }
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          let err = 0
          for (let j = 0; j < block; j++) {
            for (let i = 0; i < block; i++) err += Math.abs(at(prev, x + i, y + j) - at(next, x + i + dx, y + j + dy))
          }
          if (err < best.err) best = { dx, dy, err }
        }
      }
      vectors.push({ x, y, dx: best.dx, dy: best.dy })
    }
  }
  return vectors
}

export const interpolate = (prev: GrayImage, next: GrayImage, t = 0.5): GrayImage => {
  const vectors = motion(prev, next)
  return sample(prev.width, prev.height, (x, y) => {
    const block = vectors.find(item => x >= item.x && x < item.x + 4 && y >= item.y && y < item.y + 4) ?? { dx: 0, dy: 0 }
    const a = at(prev, x - block.dx * t, y - block.dy * t)
    const b = at(next, x + block.dx * (1 - t), y + block.dy * (1 - t))
    return a * (1 - t) + b * t
  })
}

export const pacing = (intervals: number[]) => {
  const mean = intervals.reduce((sum, value) => sum + value, 0) / Math.max(1, intervals.length)
  const variance = intervals.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(1, intervals.length)
  return { mean: Number(mean.toFixed(4)), stdev: Number(Math.sqrt(variance).toFixed(4)), valid: intervals.every(value => value > 0) }
}
