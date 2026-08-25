import { catalogSnapshot, registerDomain, registerPhenomenon } from './catalog.js'
import type { KnowledgeClaim, PhenomenonSpec, RealityDomain, RealityNode } from './types.js'
import { createHash } from 'node:crypto'

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'open'

export const ingestDomain = (name: string, family = name, typicalDescription: RealityDomain['typicalDescription'] = 'law') =>
  registerDomain({
    id: `ingested-${slug(name)}`,
    name,
    family,
    conserved: [],
    typicalDescription,
    closed: false,
    source: 'ingested',
  })

export const ingestPhenomenon = (id: string, family: string, knowledge: string[]): PhenomenonSpec =>
  registerPhenomenon({
    id: slug(id),
    family,
    requiredKnowledge: knowledge,
    conserved: [],
    defaultDescription: 'law',
    closedList: false,
  })

export const representUnknown = (statement: string): RealityNode => {
  const digest = createHash('sha256').update(statement).digest('hex').slice(0, 10)
  const claim: KnowledgeClaim = {
    id: `open-${digest}`,
    statement,
    state: 'UNKNOWN',
    inferred: true,
    source: 'open-ingest',
  }
  return {
    id: `unknown-${digest}`,
    kind: 'phenomenon',
    label: statement.slice(0, 80),
    temperatureK: 288,
    pressurePa: 101325,
    phase: 'mixture',
    extent: { kind: 'relation', op: 'union', of: [] },
    emissionScale: 0,
    claims: [claim],
    domain: 'information',
  }
}

export const ingestStatement = (statement: string) => {
  const node = representUnknown(statement)
  ingestPhenomenon(node.id, 'information', [statement.slice(0, 80)])
  return {
    node,
    catalog: catalogSnapshot(),
    inferenceIsFact: false as const,
    simulatedExplicitly: false as const,
    description: 'law' as const,
  }
}
