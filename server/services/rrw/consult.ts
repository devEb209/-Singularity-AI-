import { listDomains, listPhenomena } from './catalog.js'
import { parseIntent } from './intent.js'
import { substances } from './substances.js'

const biomeSubstances: Record<string, string[]> = {
  coast: ['H2O', 'NaCl', 'N2', 'O2', 'C6H10O5'],
  desert: ['SiO2', 'NaCl', 'N2', 'O2', 'Fe2O3'],
  forest: ['C6H10O5', 'H2O', 'CO2', 'O2', 'C6H12O6'],
  alpine: ['H2O', 'SiO2', 'N2', 'O2'],
  wetland: ['H2O', 'C6H10O5', 'CO2', 'SiO2'],
  open: ['H2O', 'N2', 'SiO2'],
}

export const consultKnowledge = (prompt: string) => {
  const intent = parseIntent(prompt)
  const needed = biomeSubstances[intent.biome] ?? biomeSubstances.open
  const found = needed.map(id => substances.find(item => item.id === id)).filter(Boolean)
  const domains = listDomains().filter(item => intent.domains.includes(item.id) || item.id === 'information')
  const phenomena = listPhenomena().filter(item => needed.some(id => item.requiredKnowledge.includes(id)) || item.id === 'open-unknown')
  return {
    intent,
    substances: found.map(item => item!.id),
    domains: domains.map(item => item.id),
    phenomena: phenomena.map(item => item.id),
    source: 'internal-reference' as const,
    puterFired: false as const,
    nasa: false as const,
    inferenceIsFact: false as const,
    exhaustiveInternetClaim: false as const,
  }
}
