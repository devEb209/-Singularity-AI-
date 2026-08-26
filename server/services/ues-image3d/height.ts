import { sample, type GrayImage } from '../ues-image/filters.js'

export const bumpImage = (width = 16, height = 16): GrayImage =>
  sample(width, height, (x, y) => {
    const u = (x / (width - 1)) * 2 - 1
    const v = (y / (height - 1)) * 2 - 1
    return Math.max(0, 1 - Math.hypot(u, v))
  })

export const heightMesh = (image: GrayImage, scale = 0.35) => {
  const vertices: [number, number, number][] = []
  const triangles: [number, number, number][] = []
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      vertices.push([x / (image.width - 1) - 0.5, image.pixels[y * image.width + x] * scale, y / (image.height - 1) - 0.5])
    }
  }
  for (let y = 0; y < image.height - 1; y++) {
    for (let x = 0; x < image.width - 1; x++) {
      const a = y * image.width + x
      const b = a + 1
      const c = a + image.width
      const d = c + 1
      triangles.push([a, c, b], [b, c, d])
    }
  }
  const peak = Math.max(...vertices.map(item => item[1]))
  const edge = vertices.filter(item => Math.abs(item[0]) > 0.45 || Math.abs(item[2]) > 0.45).reduce((sum, item) => sum + item[1], 0)
  return { vertices, triangles, peak, edgeMean: edge / Math.max(1, vertices.length) }
}
