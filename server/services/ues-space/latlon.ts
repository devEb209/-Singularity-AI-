import type { LatLon } from './types.js'

export const latLon = (x: number, z: number, size: number): LatLon => ({
  lat: ((z / Math.max(1, size - 1)) - 0.5) * 180,
  lon: ((x / Math.max(1, size - 1)) - 0.5) * 360,
})

export const latLonToCell = (lat: number, lon: number, size: number): [number, number] => [
  Math.max(0, Math.min(size - 1, Math.round(((lon / 360) + 0.5) * (size - 1)))),
  Math.max(0, Math.min(size - 1, Math.round(((lat / 180) + 0.5) * (size - 1)))),
]
