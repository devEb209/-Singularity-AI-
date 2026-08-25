import { DThesisCore } from '../d-thesis/core.js'
import { ingestSpatial } from '../ues-space/ingest.js'
import { fixtureLayers } from './fixture.js'
import { combineKnowledge, normalizeDataset } from './normalize.js'
import { licenseGate } from './policy.js'
import { probeRemote } from './remote.js'
import { gisSources } from './sources.js'
import type { GisIngestResult } from './types.js'

export class UesGisCore {
  private thesis = new DThesisCore()

  sources() {
    return gisSources.map(item => ({
      id: item.id,
      name: item.name,
      family: item.family,
      status: item.status,
      auth: item.auth,
      vendorLock: item.vendorLock,
      fetchedRemote: item.fetchedRemote,
    }))
  }

  ingest(sourceId = 'internal-fixture'): GisIngestResult {
    const remote = probeRemote(sourceId)
    const layers = sourceId === 'internal-fixture' ? fixtureLayers() : []
    const fields = layers.map(normalizeDataset)
    const licenses = layers.map(licenseGate)
    const ingested = layers.map(ingestSpatial)
    const knowledge = combineKnowledge(fields)
    const dThesis = this.thesis.evaluate({
      objective: 'Ingerir dados espaciais reais quando licenciados e normalizá-los como conhecimento 3D, sem copiar conteúdo proprietário',
      constraints: ['não fingir NASA', 'não copiar tiles proprietários', 'somente Puter como serviço externo'],
      resources: ['internal-fixture', 'adapter-contracts'],
      priorities: { quality: 8, performance: 8, safety: 10, cost: 4, scalability: 9 },
    })
    const valid = sourceId === 'internal-fixture'
      && fields.length === 5
      && licenses.every(item => item.allowed)
      && ingested.every(item => item.verification.valid)
      && knowledge.landRatio > 0
      && knowledge.landRatio < 1
      && !remote.fetchedRemote
    return {
      format: 'ues-gis-ingest-v1',
      sourceId,
      status: sourceId === 'internal-fixture' ? 'IMPLEMENTED' : remote.status,
      fetchedRemote: false,
      nasa: false,
      google: false,
      cesium: false,
      fields,
      knowledge: 'spatial-3d-rules-not-2d-map',
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: { valid, liveRemote: false, proprietaryCopy: false },
      limitations: [
        'Internal fixture is operational',
        'Live NASA/USGS/OpenTopography/Google/Cesium remain adapter-available',
        'No remote bytes are fetched in V1',
      ],
    }
  }
}
