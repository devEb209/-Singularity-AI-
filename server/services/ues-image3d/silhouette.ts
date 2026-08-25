import { at, type GrayImage } from '../ues-image/filters.js'

export const maskOf = (image: GrayImage, threshold = 0.18) =>
  image.pixels.map(value => value >= threshold)

export const distanceField = (image: GrayImage, threshold = 0.18) => {
  const mask = maskOf(image, threshold)
  const field: number[] = mask.map(bit => (bit ? 1e6 : 0))
  const width = image.width
  const height = image.height
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      if (!mask[i]) continue
      let best = field[i]
      if (x > 0) best = Math.min(best, field[i - 1] + 1)
      if (y > 0) best = Math.min(best, field[i - width] + 1)
      field[i] = best
    }
  }
  for (let y = height - 1; y >= 0; y--) {
    for (let x = width - 1; x >= 0; x--) {
      const i = y * width + x
      if (!mask[i]) continue
      let best = field[i]
      if (x + 1 < width) best = Math.min(best, field[i + 1] + 1)
      if (y + 1 < height) best = Math.min(best, field[i + width] + 1)
      field[i] = best
    }
  }
  return field
}

export const symmetryScore = (image: GrayImage) => {
  let same = 0
  let total = 0
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < Math.floor(image.width / 2); x++) {
      const a = at(image, x, y)
      const b = at(image, image.width - 1 - x, y)
      same += 1 - Math.abs(a - b)
      total += 1
    }
  }
  return Number((same / Math.max(1, total)).toFixed(4))
}
