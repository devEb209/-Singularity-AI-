import type { ArtifactRecord } from '../../domain.js'
import type { Store } from '../../repositories/store.js'

export const previousVerified = (store: Store, userId: string, candidate: ArtifactRecord) => {
  const siblings = store.listArtifacts(userId, candidate.projectId)
    .filter(item => item.type === candidate.type && item.id !== candidate.id)
    .sort((a, b) => b.version - a.version)
  return siblings.find(item => item.status === 'verified' || item.status === 'superseded')
}

export const applyDecision = (store: Store, userId: string, candidate: ArtifactRecord, action: 'accept' | 'rollback') => {
  if (action === 'accept') {
    return { candidate, restored: undefined }
  }
  const prior = previousVerified(store, userId, candidate)
  candidate.status = 'rejected'
  candidate.verification = { ...candidate.verification, rolledBack: true, valid: false }
  store.updateArtifact(candidate)
  if (prior && prior.status === 'superseded') {
    prior.status = 'verified'
    store.updateArtifact(prior)
  }
  return { candidate, restored: prior }
}
