import { bindCity } from './city-bind.js'
import { resolveContacts } from './contact-step.js'
import { stepForage } from './economy.js'
import { compareObservers } from './multi-observer.js'
import { walkCity } from './nav-city.js'
import { liveWithClimate } from './need-climate.js'
import { composeWithStructures } from './structure.js'
import { stepWeathering } from './weathering.js'

export const inhabitWorld = (prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo') => {
  const composed = composeWithStructures(`${prompt} habitar abrigo caminho`)
  const weathered = stepWeathering(composed.nodes)
  const forage = stepForage(weathered.nodes)
  const contacts = resolveContacts(prompt)
  const city = bindCity(prompt, 96)
  const nav = walkCity(forage.nodes)
  const climate = liveWithClimate(prompt, 24, 48)
  const observers = compareObservers(forage.nodes)
  return {
    format: 'rrw-inhabit-v1',
    structures: composed.structures,
    weathering: { conserved: weathered.conserved, moved: weathered.take > 0 },
    economy: { conserved: forage.conserved, foraged: forage.foraged },
    contacts: { grasp: contacts.grasp, momentumConserved: contacts.momentumConserved, slowed: contacts.slowed },
    city: { population: city.population, identities: city.identities, sameIds: city.sameIds, workSeen: city.workSeen, dormant: city.dormant },
    nav: { found: nav.found, recast: nav.recast },
    climate: { workSeen: climate.workSeen, summerHotter: climate.summerHotter, identities: climate.identities },
    observers: { thermalSeesFireMore: observers.thermalSeesFireMore, framebufferFoundation: observers.framebufferFoundation },
    verification: {
      valid: composed.structures.includes('shelter')
        && weathered.conserved
        && forage.conserved
        && contacts.grasp
        && contacts.momentumConserved
        && city.identities
        && city.sameIds
        && city.workSeen
        && nav.found
        && climate.summerHotter
        && observers.thermalSeesFireMore
        && !observers.framebufferFoundation,
      meshPrefab: false,
      recast: false,
      uniqueFullMinds: false,
      consciousnessClaim: false,
      completeReality: false,
      genesisClosed: false,
    },
  }
}
