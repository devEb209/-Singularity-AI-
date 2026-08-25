export interface Body {
  id: string
  a: number
  period: number
}

export const solarSystem: Body[] = [
  { id: 'mercury', a: 0.39, period: 88 },
  { id: 'venus', a: 0.72, period: 225 },
  { id: 'earth', a: 1, period: 365.25 },
  { id: 'mars', a: 1.52, period: 687 },
  { id: 'jupiter', a: 5.2, period: 4333 },
  { id: 'saturn', a: 9.58, period: 10759 },
  { id: 'uranus', a: 19.2, period: 30687 },
  { id: 'neptune', a: 30.05, period: 60190 },
]

export const kepler = (body: Body, day: number) => {
  const angle = (2 * Math.PI * day) / body.period
  return { id: body.id, x: Number((body.a * Math.cos(angle)).toFixed(5)), z: Number((body.a * Math.sin(angle)).toFixed(5)) }
}

export const observableCatalog = (day = 0) => ({
  format: 'ues-observable-universe-v1' as const,
  claim: 'known-solar-system-kepler-not-full-universe',
  bodies: solarSystem.map(body => kepler(body, day)),
  nBody: false,
  verification: { valid: solarSystem.length === 8 && solarSystem.every(body => body.a > 0) },
})
