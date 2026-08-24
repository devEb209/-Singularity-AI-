import { DThesisCore } from '../d-thesis/core.js'
import { catalog } from '../ues-corpus/catalog.js'
import { applyCardToModel } from '../ues-umotion/explorer.js'
import { cardById, motionCatalog } from '../ues-umotion/catalog.js'

export class UesExplorerCore {
  private thesis = new DThesisCore()

  process(modelId = 'humanoid-01', cardId = 'reload-fn-fal') {
    const model = catalog.find(item => item.id === modelId) ?? catalog[0]
    const card = cardById(cardId)
    const applied = applyCardToModel(card, model.parts.map(item => item.name), 14)
    const weapon = catalog.find(item => item.kind === 'weapon')!
    const mechanism = applyCardToModel(cardById('reload-rifle-mechanism'), weapon.parts.map(item => item.name), 10)
    const dThesis = this.thesis.evaluate({
      objective: 'Aplicar um cartão de movimento a um modelo selecionado no Explorer Manager',
      constraints: ['não inventar juntas', 'não reivindicar visão'],
      resources: ['corpus', 'umotion cards'],
      priorities: { quality: 8, performance: 7, safety: 8, cost: 4, scalability: 7 },
    })
    return {
      format: 'ues-explorer-v1',
      models: catalog.map(item => ({ id: item.id, kind: item.kind, parts: item.parts.length })),
      cards: motionCatalog.map(item => item.id),
      selection: { model: model.id, card: card.id },
      apply: { applied: applied.applied, missing: applied.missing, frames: applied.frames, continuity: applied.continuity },
      weapon: { model: weapon.id, applied: mechanism.applied, missing: mechanism.missing },
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: applied.verification.valid && applied.applied.length > 0 && mechanism.applied.includes('mag') && mechanism.applied.includes('bolt'),
        vision: false,
      },
      limitations: ['Structured apply on catalog models', 'Not a visual explorer viewport'],
    }
  }
}
