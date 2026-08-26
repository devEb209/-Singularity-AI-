import { acousticTravel } from './acoustics.js'
import { centerOf, distanceBetween } from './extent.js'
import { composeWithStructures } from './structure.js'
import type { RealityNode, RealityRelation } from './types.js'

export const utter = (nodes: RealityNode[], speakerId: string, text: string, relations: RealityRelation[] = []) => {
  const speaker = nodes.find(item => item.id === speakerId)
  const air = nodes.find(item => item.id === 'atmosphere')
  if (!speaker || !air) {
    return { nodes, relations, heard: 0, seconds: 0, tts: false as const, llmVoice: false as const }
  }
  const from = centerOf(speaker)
  const claim = {
    id: `utter-${speakerId}-${text.slice(0, 24)}`,
    statement: `utterance: ${text}`,
    state: 'KNOWN' as const,
    inferred: false,
    source: 'speech-knowledge',
  }
  const listeners = nodes.filter(item => item.id !== speakerId && (item.kind === 'living' || item.living) && distanceBetween(speaker, item) < 12)
  const next = nodes.map(node => {
    if (node.id === speakerId) return { ...node, claims: [...node.claims, claim] }
    if (listeners.some(item => item.id === node.id)) return { ...node, claims: [...node.claims, claim] }
    return node
  })
  const first = listeners[0]
  const travel = first ? acousticTravel(from, centerOf(first), air) : { seconds: 0, shaderAudio: false as const }
  const nextRelations = first && !relations.some(item => item.from === speakerId && item.to === first.id && item.kind === 'speaks-to')
    ? [...relations, { from: speakerId, to: first.id, kind: 'speaks-to' as const }]
    : relations
  return {
    nodes: next,
    relations: nextRelations,
    heard: listeners.length,
    seconds: travel.seconds,
    tts: false as const,
    llmVoice: false as const,
    shaderAudio: false as const,
  }
}

export const compareSpeech = (prompt = 'oceano salgado com um humano') => {
  const composed = composeWithStructures(prompt)
  const spoken = utter(composed.nodes, 'human', 'preciso de água', composed.relations)
  const animal = spoken.nodes.find(item => item.id === 'animal')
  return {
    heard: spoken.heard > 0,
    animalHeard: Boolean(animal?.claims.some(item => item.statement.includes('preciso de água'))),
    tts: spoken.tts,
    llmVoice: spoken.llmVoice,
    seconds: spoken.seconds,
  }
}
