import { orderEvents, scheduleDay } from './clock.js'
import { compareEm } from './electromagnetic.js'
import { stepReality } from './evolve.js'
import { materializeOcean } from './hydro.js'
import { interactWorld } from './interact.js'
import { bindLiving } from './living-bind.js'
import { experienceAt } from './observer.js'
import { freezeReality, thawReality } from './snapshot.js'
import { seedReality } from './world.js'

export const runDay = () => {
  const seeded = seedReality()
  const events = orderEvents(scheduleDay())
  let nodes = seeded.nodes
  let relations = seeded.relations
  const interaction = interactWorld(nodes, relations)
  relations = interaction.relations
  nodes = stepReality(nodes, 1)
  const hydro = materializeOcean(nodes.find(item => item.id === 'ocean')?.temperatureK ?? 287)
  const guest = bindLiving({
    id: 'walker-1',
    identity: { name: 'walker-1', occupation: 'fisher', origin: 'shore', ageBand: 'adult' },
    location: 'shore',
    fidelity: 'medium',
  })
  const frozen = freezeReality([...nodes, guest], relations)
  const restored = thawReality(frozen)
  const experience = experienceAt(nodes)
  const em = compareEm()
  return {
    events: events.map(item => item.kind),
    grasp: interaction.grasp.possible,
    hydro,
    guest: { id: guest.id, consciousnessClaim: guest.living?.consciousnessClaim === false },
    snapshot: { checksum: frozen.checksum, restored: restored.nodes.length === nodes.length + 1, meshStore: frozen.meshStore },
    experience: { framebufferFoundation: experience.framebufferFoundation, pbr: experience.light.pbr },
    em,
  }
}
