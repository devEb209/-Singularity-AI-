import type { RigidBody } from './types.js'
import { len2 } from './vec.js'

export const sleepIslands = (bodies: RigidBody[], groups: string[][], threshold = 0.0025, hold = 4) => {
  const byId = new Map(bodies.map(body => [body.id, body]))
  const seen = new Set<string>()
  const apply = (members: RigidBody[], wake: boolean) => {
    for (const body of members) {
      seen.add(body.id)
      if (wake) {
        body.still = 0
        body.sleeping = false
        continue
      }
      body.still += 1
      if (body.still >= hold) {
        body.sleeping = true
        body.velocity = [0, 0, 0]
      }
    }
  }
  for (const group of groups) {
    const members = group.map(id => byId.get(id)).filter((item): item is RigidBody => Boolean(item))
    if (!members.length) continue
    const energetic = members.some(item => len2(item.velocity) >= threshold)
    apply(members, energetic)
  }
  for (const body of bodies) {
    if (seen.has(body.id)) continue
    apply([body], len2(body.velocity) >= threshold)
  }
  return bodies
}

export const wakeByImpulse = (bodies: RigidBody[], ids: string[]) => {
  const mark = new Set(ids)
  for (const body of bodies) {
    if (!mark.has(body.id)) continue
    body.sleeping = false
    body.still = 0
  }
  return bodies
}
