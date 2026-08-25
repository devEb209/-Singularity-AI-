import type { NmnAction } from '../nmn/types.js'
import type { Settlement } from '../ues-world/types.js'
import type { Cell } from '../ues-shared/math.js'
import type { IntentTarget } from './types.js'

export const destinationFor = (action: NmnAction, from: Cell, settlements: Settlement[], size: number): IntentTarget => {
  const nearest = (kind?: string) => {
    const buildings = settlements.flatMap(item => item.buildings.filter(building => !kind || building.kind === kind))
    if (!buildings.length) return from
    return buildings.reduce((best, building) => {
      const d = Math.hypot(building.x - from[0], building.z - from[1])
      const bd = Math.hypot(best[0] - from[0], best[1] - from[1])
      return d < bd ? [building.x, building.z] as Cell : best
    }, [buildings[0].x, buildings[0].z] as Cell)
  }
  const edge: Cell = [from[0] < size / 2 ? 0 : size - 1, from[1]]
  if (action === 'flee' || action === 'evacuate-with-family') return { action, target: edge, reason: 'Saída de mapa / porta da cidade' }
  if (action === 'hide') return { action, target: nearest('house'), reason: 'Abrigo em edifício' }
  if (action === 'aid-wounded') return { action, target: nearest('clinic'), reason: 'Clínica mais próxima' }
  if (action === 'defend' || action === 'help-evacuation') return { action, target: nearest('keep'), reason: 'Ponto de defesa' }
  if (action === 'search-missing' || action === 'travel-to-family') return { action, target: nearest('house'), reason: 'Última localização familiar conhecida' }
  if (action === 'loot') return { action, target: nearest('market'), reason: 'Oportunidade no mercado' }
  if (action === 'seek-info') return { action, target: nearest('market'), reason: 'Informação em lugar público' }
  return { action, target: from, reason: 'Rotina no lugar atual' }
}
