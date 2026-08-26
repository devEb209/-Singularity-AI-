import type { NmnCharacter } from '../nmn/types.js'
import type { RealityNode } from './types.js'

export const bindLiving = (character: Pick<NmnCharacter, 'id' | 'identity' | 'location' | 'fidelity'>): RealityNode => ({
  id: `living-${character.id}`,
  kind: 'living',
  label: character.identity.name,
  substanceId: 'H2O',
  temperatureK: 310,
  pressurePa: 101325,
  phase: 'mixture',
  extent: { kind: 'box', min: [0, 0, 0], max: [0.5, 1.7, 0.4] },
  living: { species: 'human', identity: character.identity.name, consciousnessClaim: false },
  emissionScale: 0,
  claims: [{ id: `nmn-${character.id}`, statement: `occupation ${character.identity.occupation}`, state: 'LIKELY', inferred: true, source: 'nmn-bind' }],
})

export const livingIsSeparateEngine = () => false
