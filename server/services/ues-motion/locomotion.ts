export interface Pose { time: number; footY: number; descending: boolean }

export const footLock = (footY: number, groundY: number, descending: boolean, threshold = 0.06) => {
  const contact = descending && footY - groundY <= threshold
  return { locked: contact, footY: contact ? groundY : footY, reason: contact ? 'lock on predicted ground contact' : 'swing' }
}

export const blend = (a: number[], b: number[], t: number) => {
  const u = Math.max(0, Math.min(1, t))
  const s = u * u * (3 - 2 * u)
  return a.map((value, index) => value * (1 - s) + (b[index] ?? value) * s)
}

export const stride = (samples = 16) => {
  const frames: Pose[] = Array.from({ length: samples }, (_, i) => {
    const time = i / (samples - 1)
    const footY = 0.12 + Math.max(0, Math.sin(time * Math.PI * 2)) * 0.18
    return { time, footY, descending: i > 0 && footY < 0.12 + Math.max(0, Math.sin((i - 1) / (samples - 1) * Math.PI * 2)) * 0.18 }
  })
  const locked = frames.map(frame => ({ ...frame, lock: footLock(frame.footY, 0.12, frame.descending) }))
  const continuity = locked.every((frame, i) => i === 0 || Math.abs(frame.lock.footY - locked[i - 1].lock.footY) < 0.25)
  return {
    format: 'ues-motion-v1',
    frames: locked,
    blendExample: blend([0, 0, 0], [1, 0.2, 0], 0.5),
    verification: { valid: continuity && locked.some(frame => frame.lock.locked), continuity, contactExists: locked.some(frame => frame.lock.locked) },
  }
}
