import type { ArtifactRecord } from '../../domain.js'

export interface ShipGate {
  id: string
  pass: boolean
  detail: string
}

export const requiredTypes = [
  'production.ues-advanced',
  'production.ues-craft',
  'production.ues-continuum',
  'production.ues-forge',
  'production.ues-emulation',
  'production.ues-realis',
]

export const evaluateGates = (artifacts: ArtifactRecord[]): ShipGate[] => {
  const verified = artifacts.filter(item => item.status === 'verified')
  const types = new Set(verified.map(item => item.type))
  const rejected = artifacts.filter(item => item.status === 'rejected')
  return [
    { id: 'has-verified', pass: verified.length > 0, detail: `${verified.length} verified artifacts` },
    { id: 'no-rejected-head', pass: rejected.length === 0 || verified.length > rejected.length, detail: `${rejected.length} rejected` },
    { id: 'core-or-advanced', pass: types.has('runtime.ues-core') || types.has('production.ues-advanced'), detail: 'owned runtime present' },
    { id: 'world-present', pass: types.has('production.ues-emulation') || types.has('production.ues-realis') || types.has('runtime.ues-living-world'), detail: 'world/emulation artifact' },
    { id: 'material-honest', pass: !verified.some(item => item.verification.storedBitmap16k === true), detail: 'no fake 16K bitmap claim' },
    { id: 'nasa-honest', pass: !verified.some(item => item.verification.nasa === true), detail: 'no fake NASA claim' },
    { id: 'vision-honest', pass: !verified.some(item => item.verification.vision === true), detail: 'no fake vision claim' },
    { id: 'coverage', pass: requiredTypes.filter(type => types.has(type)).length >= 2, detail: 'at least two production pipelines' },
  ]
}

export const shipReady = (gates: ShipGate[]) => gates.every(item => item.pass)
