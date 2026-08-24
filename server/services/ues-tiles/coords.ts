import type { Vec3 } from './types.js'

export const WGS84 = { a: 6378137, f: 1 / 298.257223563 }
export const WGS84_E2 = WGS84.f * (2 - WGS84.f)

export const geodeticToEcef = (latDeg: number, lonDeg: number, height = 0): Vec3 => {
  const lat = (latDeg * Math.PI) / 180
  const lon = (lonDeg * Math.PI) / 180
  const sl = Math.sin(lat)
  const cl = Math.cos(lat)
  const so = Math.sin(lon)
  const co = Math.cos(lon)
  const n = WGS84.a / Math.sqrt(1 - WGS84_E2 * sl * sl)
  return [
    (n + height) * cl * co,
    (n + height) * cl * so,
    (n * (1 - WGS84_E2) + height) * sl,
  ]
}

export const ecefToEnu = (ecef: Vec3, originLat: number, originLon: number, originH = 0): Vec3 => {
  const origin = geodeticToEcef(originLat, originLon, originH)
  const dx = ecef[0] - origin[0]
  const dy = ecef[1] - origin[1]
  const dz = ecef[2] - origin[2]
  const lat = (originLat * Math.PI) / 180
  const lon = (originLon * Math.PI) / 180
  const sl = Math.sin(lat)
  const cl = Math.cos(lat)
  const so = Math.sin(lon)
  const co = Math.cos(lon)
  return [
    -so * dx + co * dy,
    -sl * co * dx - sl * so * dy + cl * dz,
    cl * co * dx + cl * so * dy + sl * dz,
  ]
}

export const radiansToDeg = (value: number) => (value * 180) / Math.PI

export const regionCornersEcef = (west: number, south: number, east: number, north: number, minH: number, maxH: number): Vec3[] => {
  const lats = [radiansToDeg(south), radiansToDeg(north)]
  const lons = [radiansToDeg(west), radiansToDeg(east)]
  const heights = [minH, maxH]
  const corners: Vec3[] = []
  for (const lat of lats) for (const lon of lons) for (const h of heights) corners.push(geodeticToEcef(lat, lon, h))
  return corners
}

export const centroid = (points: Vec3[]): Vec3 => {
  const n = Math.max(1, points.length)
  return [
    points.reduce((sum, item) => sum + item[0], 0) / n,
    points.reduce((sum, item) => sum + item[1], 0) / n,
    points.reduce((sum, item) => sum + item[2], 0) / n,
  ]
}

export const distance3 = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
