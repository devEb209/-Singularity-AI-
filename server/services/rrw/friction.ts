export const kineticFriction = (velocity: [number, number, number], mu = 0.35, normalForce = 1) => {
  const speed = Math.hypot(velocity[0], velocity[1], velocity[2])
  if (speed < 1e-9) return { next: [0, 0, 0] as [number, number, number], applied: 0, rigidbodyAsset: false as const }
  const applied = Math.min(mu * Math.max(0, normalForce), speed)
  const scale = (speed - applied) / speed
  return {
    next: [velocity[0] * scale, velocity[1] * scale, velocity[2] * scale] as [number, number, number],
    applied,
    slowed: applied > 0,
    rigidbodyAsset: false as const,
  }
}
