export const spatialize = (samples: number[], azimuth: number, sampleRate = 8000) => {
  const delay = Math.round((0.09 / 343) * Math.sin(azimuth) * sampleRate)
  const contralateral = 10 ** ((-6 * Math.abs(Math.sin(azimuth))) / 20)
  const left: number[] = Array.from({ length: samples.length + Math.abs(delay) }, () => 0)
  const right = left.slice()
  for (let i = 0; i < samples.length; i++) {
    const pinna = samples[i] - 0.22 * (samples[i - 6] ?? 0)
    if (azimuth < 0) {
      left[i] += pinna
      right[i + Math.max(0, -delay)] += pinna * contralateral
    } else {
      right[i] += pinna
      left[i + Math.max(0, delay)] += pinna * contralateral
    }
  }
  const energy = (channel: number[]) => channel.reduce((sum, value) => sum + value * value, 0)
  return {
    left,
    right,
    delay,
    contralateral,
    leftEnergy: energy(left),
    rightEnergy: energy(right),
    measuredHrtf: false,
  }
}
