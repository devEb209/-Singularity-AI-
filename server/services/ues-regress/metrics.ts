import { psnr, type GrayImage } from '../ues-image/filters.js'

export const mse = (a: GrayImage, b: GrayImage) => {
  const n = Math.min(a.pixels.length, b.pixels.length)
  let sum = 0
  for (let i = 0; i < n; i++) sum += (a.pixels[i] - b.pixels[i]) ** 2
  return n ? sum / n : 0
}

export const ssimLite = (a: GrayImage, b: GrayImage, window = 8) => {
  const width = Math.min(a.width, b.width)
  const height = Math.min(a.height, b.height)
  const c1 = 0.01 ** 2
  const c2 = 0.03 ** 2
  let acc = 0
  let count = 0
  for (let y = 0; y + window <= height; y += window) {
    for (let x = 0; x + window <= width; x += window) {
      let sx = 0
      let sy = 0
      let sxx = 0
      let syy = 0
      let sxy = 0
      const n = window * window
      for (let j = 0; j < window; j++) {
        for (let i = 0; i < window; i++) {
          const left = a.pixels[(y + j) * a.width + (x + i)]
          const right = b.pixels[(y + j) * b.width + (x + i)]
          sx += left
          sy += right
          sxx += left * left
          syy += right * right
          sxy += left * right
        }
      }
      const mx = sx / n
      const my = sy / n
      const vx = sxx / n - mx * mx
      const vy = syy / n - my * my
      const cov = sxy / n - mx * my
      acc += (2 * mx * my + c1) * (2 * cov + c2) / ((mx * mx + my * my + c1) * (vx + vy + c2))
      count += 1
    }
  }
  return Number((acc / Math.max(1, count)).toFixed(5))
}

export const compare = (a: GrayImage, b: GrayImage) => {
  const score = psnr(a, b)
  const structural = ssimLite(a, b)
  return {
    mse: Number(mse(a, b).toFixed(6)),
    psnr: score,
    ssim: structural,
    accept: score >= 12 && structural >= 0.45,
  }
}
