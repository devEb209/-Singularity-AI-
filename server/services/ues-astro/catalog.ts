import { kepler, solarSystem } from '../ues-planet/universe.js'

export interface StarFix {
  id: string
  ra: number
  dec: number
}

export interface DeepSky {
  id: string
  kind: 'galaxy' | 'nebula' | 'cluster'
  ra: number
  dec: number
}

export const moon = { id: 'moon', a: 0.00257, period: 27.32 }
export const sun = { id: 'sun', a: 0, period: 1 }

export const brightStars: StarFix[] = [
  { id: 'sirius', ra: 101.287, dec: -16.716 },
  { id: 'vega', ra: 279.234, dec: 38.783 },
  { id: 'betelgeuse', ra: 88.793, dec: 7.407 },
]

export const messierSample: DeepSky[] = [
  { id: 'm31', kind: 'galaxy', ra: 10.685, dec: 41.269 },
  { id: 'm42', kind: 'nebula', ra: 83.822, dec: -5.391 },
  { id: 'm51', kind: 'galaxy', ra: 202.47, dec: 47.195 },
]

export const direction = (ra: number, dec: number) => {
  const a = (ra * Math.PI) / 180
  const d = (dec * Math.PI) / 180
  return {
    x: Number((Math.cos(d) * Math.cos(a)).toFixed(5)),
    y: Number((Math.cos(d) * Math.sin(a)).toFixed(5)),
    z: Number(Math.sin(d).toFixed(5)),
  }
}

export const localCatalog = (day = 80) => ({
  format: 'ues-astro-catalog-v1' as const,
  claim: 'sample-of-known-bodies-not-complete-observable-universe',
  planets: solarSystem.map(body => kepler(body, day)),
  moon: kepler(moon, day),
  sun: { id: sun.id, x: 0, z: 0 },
  stars: brightStars.map(star => ({ id: star.id, ...direction(star.ra, star.dec) })),
  deepSky: messierSample.map(item => ({ id: item.id, kind: item.kind, ...direction(item.ra, item.dec) })),
  nBody: false as const,
  completeSky: false as const,
})
