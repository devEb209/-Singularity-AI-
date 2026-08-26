export interface RealityFrame {
  origin: [number, number, number]
  timeS: number
  scaleM: number
  earthIsLimit: false
}

export const referenceFrame = (timeS = 0): RealityFrame => ({
  origin: [0, 0, 0],
  timeS,
  scaleM: 1,
  earthIsLimit: false,
})

export const advanceTime = (frame: RealityFrame, dt: number): RealityFrame => ({
  ...frame,
  timeS: frame.timeS + dt,
})

export const scaleOf = (meters: number) => {
  if (meters < 1e-9) return 'atomic-or-smaller'
  if (meters < 1e-3) return 'micro'
  if (meters < 10) return 'human'
  if (meters < 1e6) return 'landscape'
  if (meters < 1e10) return 'planetary'
  return 'celestial'
}
