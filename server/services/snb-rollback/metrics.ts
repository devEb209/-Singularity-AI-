import type { ArtifactRecord } from '../../domain.js'
import type { MetricPoint } from './types.js'

const numeric = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined

const collect = (record: Record<string, unknown>, prefix = ''): Record<string, number> => {
  const out: Record<string, number> = {}
  for (const [key, value] of Object.entries(record)) {
    const path = prefix ? `${prefix}.${key}` : key
    const n = numeric(value)
    if (n !== undefined) out[path] = n
    else if (value && typeof value === 'object' && !Array.isArray(value)) Object.assign(out, collect(value as Record<string, unknown>, path))
  }
  return out
}

export const numericFields = (artifact: ArtifactRecord) => ({
  ...collect(artifact.metadata),
  ...collect(artifact.verification),
})

export const compareMetrics = (baseline: ArtifactRecord, candidate: ArtifactRecord): MetricPoint[] => {
  const left = numericFields(baseline)
  const right = numericFields(candidate)
  const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort()
  return keys.map(key => {
    const a = left[key] ?? 0
    const b = right[key] ?? 0
    const delta = Number((b - a).toFixed(6))
    const qualityLike = /gpp|ssim|psnr|score|quality|valid|land|walkable|continuity/.test(key)
    const costLike = /error|risk|mse|lost|rejected/.test(key)
    const regresses = qualityLike ? b + 1e-9 < a * 0.97 : costLike ? b > a * 1.08 + 1e-9 : false
    return { key, baseline: a, candidate: b, delta, regresses }
  })
}

export const keysOf = (record: Record<string, unknown>): string[] =>
  Object.keys(record).sort()
