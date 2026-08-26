import { geometricMass } from './extent.js'
import { referenceFrame } from './spacetime.js'
import type { RealityNode } from './types.js'

const G = 6.6743e-11

export const keplerPeriod = (semiMajorM: number, mu: number) =>
  2 * Math.PI * Math.sqrt((semiMajorM ** 3) / Math.max(1e-12, mu))

export const describeOrbit = (nodes: RealityNode[], semiMajorM: number) => {
  const star = nodes.find(item => item.id === 'star-sol')
  const planet = nodes.find(item => item.id === 'planet-ref')
  const mu = G * Math.max(geometricMass(star ?? planet ?? nodes[0]), 1)
  const period = keplerPeriod(semiMajorM, mu)
  return {
    semiMajorM,
    periodS: period,
    frame: referenceFrame(),
    earthIsLimit: false as const,
    skybox: false as const,
    nasaLive: false as const,
  }
}

export const compareOrbits = (nodes: RealityNode[]) => {
  const near = describeOrbit(nodes, 1.5e11)
  const far = describeOrbit(nodes, 3e11)
  return { near, far, fartherSlower: far.periodS > near.periodS }
}
