import type { AgentStep } from './types.js'

const sample = (count = 8): [number, number][] => Array.from({ length: count }, (_, i) => {
  const a = (i / count) * Math.PI * 2
  return [Math.cos(a), Math.sin(a)]
})

export const avoid = (agents: AgentStep[], speed = 1): AgentStep[] => {
  const dirs = sample(8)
  return agents.map(agent => {
    let best = agent.preferred
    let bestScore = -Infinity
    for (const dir of [[...agent.preferred] as [number, number], ...dirs]) {
      const vx = dir[0] * speed
      const vz = dir[1] * speed
      let score = vx * agent.preferred[0] + vz * agent.preferred[1]
      for (const other of agents) {
        if (other.id === agent.id) continue
        const relX = other.position[0] - agent.position[0]
        const relZ = other.position[1] - agent.position[1]
        const relVx = vx - other.velocity[0]
        const relVz = vz - other.velocity[1]
        const closing = relX * relVx + relZ * relVz
        const dist = Math.hypot(relX, relZ)
        if (dist < agent.radius + other.radius + 0.2 && closing > 0) score -= 4 / Math.max(0.2, dist)
      }
      if (score > bestScore) {
        bestScore = score
        best = [vx, vz]
      }
    }
    const nextX = agent.position[0] + best[0]
    const nextZ = agent.position[1] + best[1]
    return { ...agent, velocity: best, position: [nextX, nextZ] }
  })
}
