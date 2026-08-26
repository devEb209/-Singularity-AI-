import { cloneNodes } from './extent.js'
import { iterateRefine } from './iterate.js'
import { persistRealityGraph } from './persist-graph.js'
import { openSession, type RealitySession } from './session.js'
import { placeStructures } from './structure.js'

export type SessionEdit = 'add-shelter' | 'break-ocean' | 'move-human'

export const applyEdit = (session: RealitySession, command: SessionEdit): RealitySession => {
  let nodes = cloneNodes(session.nodes)
  let relations = session.relations.map(item => ({ ...item }))
  if (command === 'add-shelter') {
    const placed = placeStructures(nodes, relations, 'abrigo para habitar')
    nodes = placed.nodes
    relations = placed.relations
  }
  if (command === 'break-ocean') {
    nodes = nodes.map(node => (node.id === 'ocean' ? { ...node, phase: 'gas' as const } : node))
  }
  if (command === 'move-human') {
    nodes = nodes.map(node => {
      if (node.id !== 'human' || !node.extent.min || !node.extent.max) return node
      return {
        ...node,
        extent: {
          ...node.extent,
          min: [node.extent.min[0] + 0.25, node.extent.min[1], node.extent.min[2]] as [number, number, number],
          max: [node.extent.max[0] + 0.25, node.extent.max[1], node.extent.max[2]] as [number, number, number],
        },
      }
    })
  }
  const frozen = persistRealityGraph(nodes, relations)
  return {
    ...session,
    nodes,
    relations,
    checksum: frozen.checksum,
    payload: frozen.payload,
    lineage: [...session.lineage, frozen.checksum],
  }
}

export const editAndRefine = (prompt = 'oceano salgado com um humano') => {
  let session = openSession(prompt)
  session = applyEdit(session, 'add-shelter')
  session = applyEdit(session, 'break-ocean')
  const refined = iterateRefine(session.nodes, 4)
  return {
    session,
    hasShelter: session.nodes.some(item => item.id === 'shelter'),
    settled: refined.settled,
    remaining: refined.remainingPhaseMismatches,
    meshViewport: false as const,
  }
}
