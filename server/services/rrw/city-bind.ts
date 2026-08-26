import { climateAt, identitiesPreserved, seedPopulation, tickSociety } from '../ues-lives/society.js'
import { adaptWorld, deviceProfiles } from './do15.js'
import { composeReality } from './compose.js'
import { placeStructures } from './structure.js'
import type { RealityNode, Situation } from './types.js'

export const bindCity = (prompt = 'oceano salgado com humanos e um abrigo', count = 96) => {
  const composed = composeReality(prompt)
  const placed = placeStructures(composed.nodes, composed.relations, `${prompt} habitar abrigo`)
  const { people: initial } = seedPopulation(`rrw-city-${prompt.slice(0, 20)}`, count, Math.min(16, count))
  let people = initial.map(person => ({ ...person, needs: { ...person.needs } }))
  const actions = new Set<string>()
  let workHours = 0
  for (let hour = 0; hour < 24; hour++) {
    people = tickSociety(people, climateAt(hour, false), hour)
    for (const person of people) {
      actions.add(person.lastAction)
      if (person.lastAction === 'work') workHours += 1
    }
  }
  const extras: RealityNode[] = people.slice(0, 32).map((person, index) => ({
    id: person.id,
    kind: 'living',
    label: person.occupation,
    substanceId: 'H2O',
    temperatureK: 310,
    pressurePa: 101325,
    phase: 'mixture',
    extent: { kind: 'box', min: [index * 0.45, 0, 5], max: [index * 0.45 + 0.35, 1.6, 5.35] },
    living: { species: 'human', identity: person.id, consciousnessClaim: false },
    emissionScale: 0,
    claims: [],
    domain: 'society',
  }))
  const nodes = [...placed.nodes, ...extras]
  const situations: Situation[] = nodes.map(node => ({
    nodeId: node.id,
    distance: node.domain === 'society' ? 8 : 3,
    relevance: node.id === 'human' || node.id === 'shelter' ? 1 : node.domain === 'society' ? 0.15 : 0.3,
    interacting: node.id === 'human' || node.id === 'shelter',
    visible: node.id !== 'planet-ref' && node.domain !== 'society',
    phenomenon: node.kind,
    precision: node.domain === 'society' ? 0.15 : 0.35,
  }))
  const weak = adaptWorld(nodes, situations, deviceProfiles.ancient)
  const strong = adaptWorld(nodes, situations, deviceProfiles.dedicated)
  const dormant = weak.adaptations.filter(item => item.description === 'dormant-reconstructable').length
  return {
    population: people.length,
    bound: extras.length,
    structures: placed.added,
    identities: identitiesPreserved(initial, people),
    workSeen: workHours > 0,
    sameIds: weak.adaptations.map(item => item.nodeId).sort().join(',') === strong.adaptations.map(item => item.nodeId).sort().join(','),
    dormant,
    consciousnessClaim: extras.every(item => item.living?.consciousnessClaim === false),
    uniqueFullMinds: false as const,
    recast: false as const,
  }
}
