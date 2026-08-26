import { climateAt, identitiesPreserved, seedPopulation, tickSociety } from '../ues-lives/society.js'
import { adaptWorld, deviceProfiles } from './do15.js'
import { composeReality } from './compose.js'
import type { RealityNode, Situation } from './types.js'

export const bindSociety = (prompt = 'oceano salgado com humanos', count = 48) => {
  const composed = composeReality(prompt)
  const { people: initial } = seedPopulation(`rrw-${prompt.slice(0, 24)}`, count, Math.min(12, count))
  let people = initial.map(person => ({ ...person, needs: { ...person.needs } }))
  const actions = new Set<string>()
  for (let hour = 0; hour < 12; hour++) {
    people = tickSociety(people, climateAt(hour, false), hour)
    people.forEach(item => actions.add(item.lastAction))
  }
  const extras: RealityNode[] = people.slice(0, 24).map((person, index) => ({
    id: person.id,
    kind: 'living',
    label: person.occupation,
    substanceId: 'H2O',
    temperatureK: 310,
    pressurePa: 101325,
    phase: 'mixture',
    extent: { kind: 'box', min: [index * 0.6, 0, 4], max: [index * 0.6 + 0.4, 1.6, 4.4] },
    living: { species: 'human', identity: person.id, consciousnessClaim: false },
    emissionScale: 0,
    claims: [],
    domain: 'society',
  }))
  const nodes = [...composed.nodes, ...extras]
  const situations: Situation[] = nodes.map(node => ({
    nodeId: node.id,
    distance: node.domain === 'society' ? 6 : 3,
    relevance: node.id === 'human' ? 1 : 0.3,
    interacting: node.id === 'human',
    visible: node.id !== 'planet-ref',
    phenomenon: node.kind,
    precision: 0.3,
  }))
  const weak = adaptWorld(nodes, situations, deviceProfiles.ancient)
  const strong = adaptWorld(nodes, situations, deviceProfiles.dedicated)
  return {
    population: people.length,
    bound: extras.length,
    identities: identitiesPreserved(initial, people),
    actions: [...actions],
    sameIds: weak.adaptations.map(item => item.nodeId).sort().join(',') === strong.adaptations.map(item => item.nodeId).sort().join(','),
    consciousnessClaim: extras.every(item => item.living?.consciousnessClaim === false),
    uniqueFullMinds: false as const,
    scriptedNpc: false as const,
  }
}
