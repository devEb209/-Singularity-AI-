import { rightsVerdict } from '../ues-reference/rights.js'
import type { SpatialDataset } from '../ues-space/types.js'
import { sourceById } from './sources.js'
import type { GisCredentials, GisStatus } from './types.js'

export const evaluateSource = (sourceId: string, credentials?: GisCredentials) => {
  const source = sourceById(sourceId)
  if (!source) {
    return {
      status: 'NOT_IMPLEMENTED' as GisStatus,
      allowed: false,
      fetchedRemote: false as const,
      reason: 'unknown-source',
    }
  }
  if (source.status === 'IMPLEMENTED') {
    return { status: source.status, allowed: true, fetchedRemote: false as const, reason: 'internal-fixture' }
  }
  if (source.auth !== 'none' && !credentials?.present) {
    return { status: 'ADAPTER_AVAILABLE' as GisStatus, allowed: false, fetchedRemote: false as const, reason: 'credentials-missing' }
  }
  return {
    status: 'EXTERNAL_DEPENDENCY' as GisStatus,
    allowed: false,
    fetchedRemote: false as const,
    reason: 'remote-fetch-disabled-only-puter-external',
  }
}

export const licenseGate = (dataset: SpatialDataset) => {
  const verdict = rightsVerdict([{
    id: dataset.id,
    title: dataset.source,
    kind: 'license',
    license: dataset.license,
    source: dataset.source,
    values: { kind: dataset.kind },
  }])
  return {
    ...verdict,
    proprietaryCopy: false as const,
    blockedUnknown: dataset.license === 'unknown' || dataset.license === 'all-rights-reserved',
  }
}
