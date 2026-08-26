import { consultKnowledge } from './consult.js'
import { composeReality } from './compose.js'
import { critiqueReality } from './critic.js'
import { compareDevices } from './device-matrix.js'
import { compareHydrology, cycleWater } from './hydrology.js'
import { compareInsolation } from './insolation.js'
import { parseIntent } from './intent.js'
import { iterateBrokenOcean } from './iterate.js'
import { recordSessionLine } from './memory-line.js'
import { observeSpan } from './observe-span.js'
import { compareReconstruct } from './reconstruct.js'
import { compareSeasons } from './season.js'
import { holdAndResume } from './session.js'
import { compareSoil } from './soil-cycle.js'
import { liveSocietyDays } from './society-days.js'
import { compareTides } from './tide.js'
import { compareWeather } from './weather.js'

export const runChain = (prompt = 'oceano salgado sob céu nublado com fogo, floresta e um humano') => {
  const intent = parseIntent(prompt)
  const knowledge = consultKnowledge(prompt)
  const composed = composeReality(prompt)
  const seasons = compareSeasons(prompt)
  const hydro = cycleWater(composed.nodes)
  const hydrology = compareHydrology()
  const tides = compareTides(prompt)
  const soil = compareSoil(prompt)
  const weather = compareWeather(prompt)
  const insolation = compareInsolation()
  const devices = compareDevices(prompt)
  const reconstructed = compareReconstruct(prompt)
  const session = holdAndResume(prompt)
  const society = liveSocietyDays(prompt, 36, 48)
  const memory = recordSessionLine(prompt, 2)
  const observed = observeSpan(prompt)
  const critic = critiqueReality(session.session.nodes)
  const refined = iterateBrokenOcean()
  const steps = [
    { id: 1, name: 'describe', ok: prompt.trim().length >= 3 },
    { id: 2, name: 'understand-intent', ok: Boolean(intent.biome) && intent.realismRequired === false },
    { id: 3, name: 'seek-knowledge', ok: knowledge.puterFired === false && knowledge.nasa === false && knowledge.substances.length > 0 },
    { id: 4, name: 'represent', ok: composed.nodes.length > 0 && composed.heightfieldIsIdentity === false },
    { id: 5, name: 'd-o15', ok: devices.sameIds && devices.weakerDescribesLess },
    { id: 6, name: 'materialize', ok: devices.backends.every(item => item === 'cpu-field' || item === 'hardware-present') },
    { id: 7, name: 'run-on-devices', ok: devices.sameIds && devices.hardwareDeterminesArchitecture === false },
    { id: 8, name: 'persist-session', ok: session.resumed && session.sameIds && memory.lineagePreserved },
    { id: 9, name: 'verify', ok: critic.accepted && hydro.conserved && hydrology.desertConserved && hydrology.wetlandConserved && seasons.summerWarmer && tides.highHigher && soil.conserved && weather.cloudMoved && reconstructed.sameIds && society.workSeen && observed.nightDimmer },
    { id: 10, name: 'refine', ok: refined.settled && critic.inferenceIsFact === false },
  ]
  const executed = steps.every(step => step.ok)
  return {
    format: 'rrw-chain-v1',
    architecture: 'REALITY → KNOWLEDGE → TESE DOS D → REPRESENTATION → D-O15 → RRW → MATERIALIZATION → VERIFICATION → REFINEMENT',
    intent: { biome: intent.biome, realismRequired: intent.realismRequired, instantAaa: intent.instantAaa },
    knowledge: { substances: knowledge.substances, puterFired: knowledge.puterFired, nasa: knowledge.nasa },
    composed: { nodes: composed.nodes.length, biome: composed.intent.biome, heightfieldIsIdentity: composed.heightfieldIsIdentity },
    seasons: { summerWarmer: seasons.summerWarmer, alpineStaysCold: seasons.alpineStaysCold, shaderSeason: seasons.shaderSeason },
    hydro: { conserved: hydro.conserved, wetlandWetterSoil: hydrology.wetlandWetterSoil, shaderWater: hydro.shaderWater },
    tides: { highHigher: tides.highHigher, shaderTide: tides.shaderTide },
    soil: { conserved: soil.conserved, textureVegetation: soil.textureVegetation },
    weather: { cloudMoved: weather.cloudMoved, shaderWeather: weather.shaderWeather },
    insolation: { dayBrighter: insolation.dayBrighter, summerStronger: insolation.summerStronger, shaderSun: insolation.shaderSun },
    devices: { sameIds: devices.sameIds, weakerDescribesLess: devices.weakerDescribesLess },
    reconstruct: { dormant: reconstructed.dormant, sameIds: reconstructed.sameIds, meshFromStub: reconstructed.meshFromStub },
    session: { resumed: session.resumed, recomposed: session.recomposed, sameIds: session.sameIds },
    society: { workSeen: society.workSeen, identities: society.identities, consciousnessClaim: society.consciousnessClaim },
    memory: { versions: memory.versions, evolved: memory.evolved, eraseHistory: memory.eraseHistory },
    observed: { nightDimmer: observed.nightDimmer, framebufferFoundation: observed.framebufferFoundation },
    critic: { accepted: critic.accepted, inferenceIsFact: critic.inferenceIsFact },
    refine: { settled: refined.settled, steps: refined.steps },
    steps,
    executed,
    verification: {
      valid: executed && critic.accepted && session.resumed && refined.settled && devices.sameIds,
      traditionalPipeline: false,
      meshIsFoundation: false,
      pbrIsFoundation: false,
      shaderSeason: false,
      shaderWeather: false,
      shaderTide: false,
      shaderWater: false,
      webgpuRequired: false,
      automaticPuter: false,
      nasaRequired: false,
      consciousnessClaim: false,
      completeReality: false,
      instantAaa: false,
      genesisClosed: false,
    },
    limitations: [
      'Chain executes describe→intent→knowledge→represent→D-O15→session→verify→refine',
      'Not complete reality, not NIST spectra, not a shipped AAA world, Genesis is not closed',
    ],
  }
}
