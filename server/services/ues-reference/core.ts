import { DThesisCore } from '../d-thesis/core.js'
import { restrictedCard, sampleCards } from './cards.js'
import { constraintDistance, extractConstraints } from './constraints.js'
import { rightsVerdict } from './rights.js'

export class UesReferenceCore {
  private thesis = new DThesisCore()

  process(prompt = 'personagem humano') {
    const allowed = sampleCards(prompt)
    const forbidden = [...allowed, restrictedCard()]
    const constraints = extractConstraints(allowed)
    const other = extractConstraints(sampleCards('criatura quadrupede'))
    const verdict = rightsVerdict(allowed)
    const rejected = rightsVerdict(forbidden)
    const dThesis = this.thesis.evaluate({
      objective: 'Extrair restrições de referências estruturadas e aplicar política de direitos',
      constraints: ['não reivindicar visão', 'licença desconhecida bloqueia produção'],
      resources: ['cards', 'CPU'],
      priorities: { quality: 7, performance: 8, safety: 10, cost: 4, scalability: 7 },
    })
    return {
      format: 'ues-reference-v1',
      cards: allowed.map(card => ({ id: card.id, kind: card.kind, license: card.license })),
      constraints,
      distanceToQuadruped: constraintDistance(constraints, other),
      rights: verdict,
      rejectedUnknown: rejected,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: verdict.allowed && !rejected.allowed && constraints.length >= 4 && constraintDistance(constraints, other) > 0,
        vision: false,
      },
      limitations: ['Structured cards only', 'Not image/vision analysis'],
    }
  }
}
