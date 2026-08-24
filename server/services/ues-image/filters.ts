export interface GrayImage { width: number; height: number; pixels: number[] }

export const sample = (width: number, height: number, fn: (x: number, y: number) => number): GrayImage => ({
  width,
  height,
  pixels: Array.from({ length: width * height }, (_, i) => fn(i % width, Math.floor(i / width))),
})

export const at = (image: GrayImage, x: number, y: number) => {
  const xx = Math.max(0, Math.min(image.width - 1, x))
  const yy = Math.max(0, Math.min(image.height - 1, y))
  return image.pixels[yy * image.width + xx]
}

export const downsample = (image: GrayImage, factor: number): GrayImage => {
  const width = Math.max(1, Math.floor(image.width / factor))
  const height = Math.max(1, Math.floor(image.height / factor))
  return sample(width, height, (x, y) => at(image, x * factor, y * factor))
}

export const bilinear = (image: GrayImage, width: number, height: number): GrayImage =>
  sample(width, height, (x, y) => {
    const u = (x / Math.max(1, width - 1)) * (image.width - 1)
    const v = (y / Math.max(1, height - 1)) * (image.height - 1)
    const x0 = Math.floor(u)
    const y0 = Math.floor(v)
    const tx = u - x0
    const ty = v - y0
    const a = at(image, x0, y0)
    const b = at(image, x0 + 1, y0)
    const c = at(image, x0, y0 + 1)
    const d = at(image, x0 + 1, y0 + 1)
    return a * (1 - tx) * (1 - ty) + b * tx * (1 - ty) + c * (1 - tx) * ty + d * tx * ty
  })

export const psnr = (a: GrayImage, b: GrayImage) => {
  const n = Math.min(a.pixels.length, b.pixels.length)
  let mse = 0
  for (let i = 0; i < n; i++) mse += (a.pixels[i] - b.pixels[i]) ** 2
  mse /= n
  if (mse <= 1e-12) return 99
  return Number((10 * Math.log10(1 / mse)).toFixed(3))
}

export const unsharp = (image: GrayImage, amount = 0.35): GrayImage =>
  sample(image.width, image.height, (x, y) => {
    const blur = (
      at(image, x, y) * 4 +
      at(image, x - 1, y) + at(image, x + 1, y) + at(image, x, y - 1) + at(image, x, y + 1)
    ) / 8
    return Math.max(0, Math.min(1, at(image, x, y) + (at(image, x, y) - blur) * amount))
  })
