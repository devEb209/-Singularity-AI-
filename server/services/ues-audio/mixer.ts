import { clamp } from '../ues-shared/math.js'

export interface AudioClip {
  id: string
  samples: number[]
  sampleRate: number
  gain: number
  delay: number
}

export const tone = (frequency: number, duration: number, sampleRate = 8000) => {
  const count = Math.floor(clamp(duration, 0.02, 2) * sampleRate)
  return Array.from({ length: count }, (_, i) => Math.sin(2 * Math.PI * frequency * i / sampleRate) * Math.min(1, i / (sampleRate * 0.01), (count - i) / (sampleRate * 0.02)))
}

export const loudness = (samples: number[]) => {
  if (!samples.length) return { peak: 0, rms: 0, clipping: false }
  const peak = Math.max(...samples.map(Math.abs))
  const rms = Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / samples.length)
  return { peak: Number(peak.toFixed(6)), rms: Number(rms.toFixed(6)), clipping: peak > 1 }
}

export const normalize = (samples: number[], ceiling = 0.98) => {
  const peak = Math.max(...samples.map(Math.abs), 1e-9)
  if (peak <= 1) return samples
  const scale = ceiling / peak
  return samples.map(value => value * scale)
}

export const spatialGain = (listener: [number, number], source: [number, number], rolloff = 0.35) => {
  const distance = Math.hypot(listener[0] - source[0], listener[1] - source[1])
  return Number((1 / (1 + distance * rolloff)).toFixed(4))
}

export const mix = (clips: AudioClip[], sampleRate = 8000) => {
  const length = Math.max(1, ...clips.map(clip => clip.delay + clip.samples.length))
  const mixed = Array.from({ length }, () => 0)
  for (const clip of clips) {
    if (clip.sampleRate !== sampleRate) continue
    for (let i = 0; i < clip.samples.length; i++) mixed[clip.delay + i] += clip.samples[i] * clip.gain
  }
  const gated = normalize(mixed)
  const metrics = loudness(gated)
  return {
    format: 'ues-audio-mix-v1',
    sampleRate,
    channels: 1,
    samples: gated,
    metrics,
    verification: { finite: gated.every(Number.isFinite), clipping: metrics.clipping, mixedClips: clips.length },
  }
}

export const syncEvents = (events: { tick: number; clipId: string }[], tick: number) => events.filter(event => event.tick === tick)
