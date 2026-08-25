import { centroid, distance3, geodeticToEcef, regionCornersEcef } from './coords.js'
import type { BoundingVolume, TileBox, TileSphere, Vec3 } from './types.js'

export const boxCorners = (box: TileBox): Vec3[] => {
  const signs: Vec3[] = [
    [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1],
    [1, -1, -1], [1, -1, 1], [1, 1, -1], [1, 1, 1],
  ]
  return signs.map(([sx, sy, sz]) => [
    box.center[0] + sx * box.ux[0] + sy * box.uy[0] + sz * box.uz[0],
    box.center[1] + sx * box.ux[1] + sy * box.uy[1] + sz * box.uz[1],
    box.center[2] + sx * box.ux[2] + sy * box.uy[2] + sz * box.uz[2],
  ])
}

export const volumeSphere = (volume: BoundingVolume): TileSphere => {
  if (volume.kind === 'sphere') return volume.sphere
  if (volume.kind === 'box') {
    const corners = boxCorners(volume.box)
    return { center: volume.box.center, radius: Math.max(...corners.map(item => distance3(item, volume.box.center))) }
  }
  const corners = regionCornersEcef(
    volume.region.west, volume.region.south, volume.region.east, volume.region.north,
    volume.region.minHeight, volume.region.maxHeight,
  )
  const center = centroid(corners)
  return { center, radius: Math.max(...corners.map(item => distance3(item, center))) }
}

export const volumeCenter = (volume: BoundingVolume): Vec3 => {
  if (volume.kind === 'sphere') return volume.sphere.center
  if (volume.kind === 'box') return volume.box.center
  return geodeticToEcef(
    ((volume.region.south + volume.region.north) * 90) / Math.PI,
    ((volume.region.west + volume.region.east) * 90) / Math.PI,
    (volume.region.minHeight + volume.region.maxHeight) / 2,
  )
}

export const parseBoundingVolume = (raw: { box?: number[]; sphere?: number[]; region?: number[] }): BoundingVolume => {
  if (raw.sphere && raw.sphere.length === 4) {
    return { kind: 'sphere', sphere: { center: [raw.sphere[0], raw.sphere[1], raw.sphere[2]], radius: raw.sphere[3] } }
  }
  if (raw.box && raw.box.length === 12) {
    return {
      kind: 'box',
      box: {
        center: [raw.box[0], raw.box[1], raw.box[2]],
        ux: [raw.box[3], raw.box[4], raw.box[5]],
        uy: [raw.box[6], raw.box[7], raw.box[8]],
        uz: [raw.box[9], raw.box[10], raw.box[11]],
      },
    }
  }
  if (raw.region && raw.region.length === 6) {
    return {
      kind: 'region',
      region: {
        west: raw.region[0], south: raw.region[1], east: raw.region[2], north: raw.region[3],
        minHeight: raw.region[4], maxHeight: raw.region[5],
      },
    }
  }
  throw new Error('unsupported-bounding-volume')
}
