import { stepForage } from './economy.js'
import { parseTimeIntent } from './intent-time.js'
import { liveWithClimate } from './need-climate.js'
import { applyEdit } from './edit-session.js'
import { openSession, tickSession } from './session.js'
import { feltTemperature, insideShelter } from './shelter-climate.js'
import { stepWeathering } from './weathering.js'

export const inhabitDays = (prompt = '2 dias de oceano salgado com fogo, floresta, um humano e um abrigo') => {
  const time = parseTimeIntent(prompt)
  let session = applyEdit(openSession(prompt), 'add-shelter')
  session = { ...session, clock: time.clock }
  const hours = Math.max(4, time.days * 4)
  session = tickSession(session, hours)
  const forage = stepForage(session.nodes)
  const conservedFood = forage.conserved
  const weathered = stepWeathering(forage.nodes)
  const conservedRock = weathered.conserved
  session = { ...session, nodes: weathered.nodes }
  const human = session.nodes.find(item => item.id === 'human')!
  const climate = liveWithClimate(prompt, 24, 48)
  return {
    days: time.days,
    hours,
    season: time.season,
    wantsNight: time.wantsNight,
    shelter: session.nodes.some(item => item.id === 'shelter'),
    inside: insideShelter(human, session.nodes),
    felt: feltTemperature(human, session.nodes),
    conservedFood,
    conservedRock,
    fire: session.nodes.find(item => item.id === 'fire')!.temperatureK,
    workSeen: climate.workSeen,
    identities: climate.identities,
    meshPrefab: false as const,
  }
}
