import { DThesisCore } from '../d-thesis/core.js'
import { deviceBudget } from './budget.js'
import { chooseMany, counts } from './choose.js'
import type { HardwareTier, RepresentationNeed } from './types.js'

export const sampleNeeds = (tier: HardwareTier): RepresentationNeed[] => {
  const budget = deviceBudget(tier)
  return [
    { domain: 'world' as const, influence: 0.92, distance: 1, visible: true, interactive: true, reconstructable: true },
    { domain: 'geometry' as const, influence: 0.8, distance: 2, visible: true, interactive: true, reconstructable: true },
    { domain: 'physics' as const, influence: 0.7, distance: 2, visible: false, interactive: true, reconstructable: false },
    { domain: 'npc' as const, influence: 0.45, distance: 6, visible: true, interactive: false, reconstructable: true },
    { domain: 'material' as const, influence: 0.6, distance: 3, visible: true, interactive: false, reconstructable: true },
    { domain: 'particle' as const, influence: 0.2, distance: 10, visible: true, interactive: false, reconstructable: true },
    { domain: 'audio' as const, influence: 0.15, distance: 12, visible: false, interactive: false, reconstructable: true },
    { domain: 'motion' as const, influence: 0.55, distance: 3, visible: true, interactive: true, reconstructable: true },
    { domain: 'graphics' as const, influence: 0.85, distance: 1, visible: true, interactive: false, reconstructable: true },
    { domain: 'world' as const, influence: 0.05, distance: 40, visible: false, interactive: false, reconstructable: true },
  ].slice(0, Math.max(6, Math.min(budget.resident, 10)))
}

export class UesRepresentCore {
  private thesis = new DThesisCore()

  process(tier: HardwareTier = 'balanced') {
    const needs = sampleNeeds(tier)
    const choices = chooseMany(needs)
    const summary = counts(choices)
    const dThesis = this.thesis.evaluate({
      objective: 'Escolher representação adaptativa por influência perceptiva, não só otimizar malha',
      constraints: ['não simular o que não influencia', 'não armazenar o reconstruível', 'fronteira de qualidade contextual'],
      resources: ['D-O15', `hardware ${tier}`],
      priorities: { quality: 8, performance: 9, safety: 8, cost: 4, scalability: 10 },
    })
    return {
      format: 'ues-represent-v1',
      tier,
      budget: deviceBudget(tier),
      choices,
      summary,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: summary.dormant + summary.reconstructable > 0 && summary.full > 0 && summary.drawn < choices.length && choices.some(item => !item.simulate),
        objectOnly: false,
      },
      limitations: ['Representation policy, not a GPU scheduler'],
    }
  }
}
