const rms = (values: number[]) => Math.sqrt(values.reduce((sum, value) => sum + value * value, 0) / Math.max(1, values.length))

export const crossfade = (samples: number[], window = 32) => {
  const out = samples.slice()
  const w = Math.min(window, Math.floor(samples.length / 4))
  for (let i = 0; i < w; i++) {
    const t = i / Math.max(1, w - 1)
    out[i] = samples[i] * t + samples[samples.length - w + i] * (1 - t)
    out[samples.length - w + i] = samples[samples.length - w + i] * t + samples[i] * (1 - t)
  }
  return out
}

export const loopSeam = (samples: number[], window = 32) => {
  const w = Math.min(window, Math.floor(samples.length / 4))
  const head = samples.slice(0, w)
  const tail = samples.slice(-w)
  const raw = rms(head.map((value, index) => value - tail[index]))
  const faded = crossfade(samples, w)
  const after = rms(faded.slice(0, w).map((value, index) => value - faded[faded.length - w + index]))
  return { raw: Number(raw.toFixed(6)), after: Number(after.toFixed(6)), improved: after <= raw + 1e-9, window: w }
}
