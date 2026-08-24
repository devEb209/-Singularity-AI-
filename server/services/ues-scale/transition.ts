import { hashSeed } from '../ues-shared/math.js'
import { geodeticToEcef } from '../ues-tiles/coords.js'
import { pathBetween, stack, type ScaleRung } from './ladder.js'

export interface ContinuityToken {
  worldId: string
  ecef: [number, number, number]
  heading: number
  focus: ScaleRung
}

export const tokenOf = (worldId: string, lat: number, lon: number, heading: number, focus: ScaleRung): ContinuityToken => ({
  worldId,
  ecef: geodeticToEcef(lat, lon, 0).map(value => Number(value.toFixed(3))) as [number, number, number],
  heading,
  focus,
})

export const transition = (from: ScaleRung, to: ScaleRung, worldId: string, lat: number, lon: number) => {
  const before = tokenOf(worldId, lat, lon, 0.2, from)
  const after = tokenOf(worldId, lat, lon, 0.2, to)
  const layers = stack(to)
  return {
    format: 'ues-scale-transition-v1' as const,
    path: pathBetween(from, to),
    before,
    after,
    layers,
    representationSwap: true,
    perceivedJump: before.ecef.some((value, index) => value !== after.ecef[index]),
    sameWorld: before.worldId === after.worldId,
    seed: hashSeed(worldId),
  }
}
