import { foodWeb } from './ecology.js'
import { atomC, convertMoles } from './pool.js'
import { composeWithStructures } from './structure.js'
import type { RealityRelation } from './types.js'

export const stepTrophic = (nodes: ReturnType<typeof composeWithStructures>['nodes'], relations: RealityRelation[] = []) => {
  const before = atomC(nodes)
  const graze = convertMoles(nodes, 'tree', 'C6H10O5', 1, 'animal', 'C6H12O6', 1, 0.04)
  const hunt = convertMoles(graze.nodes, 'animal', 'C6H12O6', 1, 'human', 'C6H12O6', 1, 0.02)
  const web = [...relations, ...foodWeb(hunt.nodes)]
  return {
    nodes: hunt.nodes,
    relations: web,
    before,
    after: atomC(hunt.nodes),
    conserved: Math.abs(atomC(hunt.nodes) - before) < 1e-9,
    grazed: graze.take > 0,
    uniqueFullMinds: false as const,
    rpgLoot: false as const,
  }
}

export const compareTrophic = (prompt = 'floresta com um humano e um abrigo') => {
  const composed = composeWithStructures(prompt)
  const stepped = stepTrophic(composed.nodes, composed.relations)
  return { conserved: stepped.conserved, grazed: stepped.grazed, rpgLoot: stepped.rpgLoot }
}
