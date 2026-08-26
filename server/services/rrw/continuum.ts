import { describeAtmosphere } from './atmosphere.js'
import { compareOrbits } from './astronomy.js'
import { catalogSnapshot } from './catalog.js'
import { runCausal } from './causality.js'
import { stepChemistry } from './chemistry.js'
import { compareConductors } from './charge.js'
import { critiqueReality, refineReality } from './critic.js'
import { describeCycles } from './cycle.js'
import { adaptWorld, deviceProfiles, situationsNearShore } from './do15.js'
import { stepEcology } from './ecology.js'
import { depositHeat, stepEnergy } from './energy.js'
import { sampleAllFields } from './fields.js'
import { describeSoil } from './geology.js'
import { interpretDescription } from './interpret.js'
import { compareMagnet } from './magnetism.js'
import { materialize } from './materialize.js'
import { elastic1d } from './mechanics.js'
import { compareAirWater } from './optics.js'
import { compareObservers, perceiveReality } from './perception.js'
import { persistRealityGraph } from './persist-graph.js'
import { compareStarAndAir } from './plasma.js'
import { budgetOf } from './quantities.js'
import { compareEmitters } from './radiation.js'
import { samePhenomenaAcrossDevices } from './select.js'
import { coupleSociety } from './society-bind.js'
import { compareSoundMedia } from './waves.js'
import { seedReality } from './world.js'

export const runContinuum = (prompt = 'oceano salgado sob céu nublado com fogo, floresta e um humano') => {
  const seeded = seedReality()
  const interpreted = interpretDescription(prompt)
  const start = budgetOf(seeded.nodes)
  const chemistry = stepChemistry(seeded.nodes, 1)
  const heated = depositHeat(chemistry.nodes, chemistry.heatJ, 'fire')
  const energy = stepEnergy(heated, 1)
  const ecology = stepEcology(energy.nodes, 1)
  const refined = refineReality(ecology.nodes)
  const critic = critiqueReality(refined.nodes, start, budgetOf(refined.nodes), [
    { id: 'k1', statement: 'H2O boils at 373.15K', state: 'KNOWN', inferred: false, source: 'internal-reference' },
    { id: 'k2', statement: 'H2O boils at 10K', state: 'LIKELY', inferred: true, source: 'unchecked-inference' },
  ])
  const phone = adaptWorld(refined.nodes, situationsNearShore(refined.nodes), deviceProfiles.mobile)
  const desk = adaptWorld(refined.nodes, situationsNearShore(refined.nodes), deviceProfiles.dedicated)
  const frame = materialize(refined.nodes, desk.adaptations, deviceProfiles.dedicated)
  const society = coupleSociety(refined.nodes)
  const graph = persistRealityGraph(refined.nodes, [...seeded.relations, ...ecology.web])
  const fields = sampleAllFields(refined.nodes, [0.45, 1.55, 3.55])
  const experience = perceiveReality(refined.nodes)
  const observers = compareObservers(refined.nodes)
  const optics = compareAirWater()
  const plasma = compareStarAndAir()
  const orbits = compareOrbits(refined.nodes)
  const waves = compareSoundMedia()
  const magnet = compareMagnet(refined.nodes)
  const charge = compareConductors()
  const radiation = compareEmitters(refined.nodes)
  const mechanics = elastic1d(2, 1, 2, -1)
  const atmosphere = describeAtmosphere(refined.nodes.find(item => item.id === 'atmosphere'))
  const soil = describeSoil(refined.nodes.find(item => item.id === 'soil'))
  const cycles = describeCycles(refined.nodes)
  const phenomena = samePhenomenaAcrossDevices()
  const causal = runCausal()
  const catalog = catalogSnapshot()
  const phoneIds = phone.adaptations.map(item => item.nodeId).sort().join(',')
  const deskIds = desk.adaptations.map(item => item.nodeId).sort().join(',')
  return {
    format: 'rrw-continuum-v1',
    architecture: 'REALITY → KNOWLEDGE → TESE DOS D → REPRESENTATION → D-O15 → RRW → MATERIALIZATION → VERIFICATION → REFINEMENT',
    catalog,
    interpreted: {
      nodes: interpreted.nodes.length,
      substances: interpreted.substances,
      domains: interpreted.domains,
      heightfieldIsIdentity: interpreted.heightfieldIsIdentity,
    },
    chemistry: { events: chemistry.events, heatJ: chemistry.heatJ, particleSystem: chemistry.particleSystem },
    energy: { conservedWithSink: energy.conservedWithSink, sink: energy.sink, shaderHeat: energy.shaderHeat },
    ecology: { photosynthesis: ecology.photosynthesis, web: ecology.web.length, consciousnessClaim: ecology.consciousnessClaim },
    society,
    atmosphere,
    soil,
    cycles,
    fields: Object.fromEntries(fields.map(item => [item.kind, Number(item.scalar.toPrecision(6))])),
    optics,
    plasma,
    orbits: { fartherSlower: orbits.fartherSlower, earthIsLimit: orbits.near.earthIsLimit },
    waves: { waterFaster: waves.waterFaster, shaderWave: waves.water.shaderWave },
    magnet,
    charge,
    radiation: { starHotter: radiation.starHotter, pathTraced: radiation.pathTraced },
    mechanics,
    phenomena,
    causal,
    experience: { framebufferFoundation: experience.framebufferFoundation, pbr: experience.pbr, luminance: experience.light.luminance },
    observers,
    devices: { sameIds: phoneIds === deskIds, phoneOcean: phone.adaptations.find(item => item.nodeId === 'ocean')?.description, deskOcean: desk.adaptations.find(item => item.nodeId === 'ocean')?.description },
    persist: { checksum: graph.checksum, meshStore: graph.meshStore, assetStore: graph.assetStore },
    materialization: { backend: frame.backend, traditionalPipeline: frame.traditionalPipeline },
    critic: { accepted: critic.accepted, findings: critic.findings.length, inferenceIsFact: critic.inferenceIsFact },
    quantities: { start, refined: budgetOf(refined.nodes), conservedWithSink: energy.conservedWithSink },
    verification: {
      valid: energy.conservedWithSink
        && critic.accepted
        && phoneIds === deskIds
        && phenomena.sameIds
        && optics.bendsTowardNormal
        && waves.waterFaster
        && magnet.strongerNear
        && charge.ironConductsMore
        && plasma.starMoreIonized
        && orbits.fartherSlower
        && radiation.starHotter
        && mechanics.conserved
        && society.consciousnessClaim === false
        && catalog.open
        && !frame.traditionalPipeline
        && !experience.framebufferFoundation,
      traditionalPipeline: false,
      meshIsFoundation: false,
      pbrIsFoundation: false,
      lodIsDo15: false,
      hardwareDeterminesArchitecture: false,
      consciousnessClaim: false,
      completeReality: false,
      nistSpectra: false,
      atomSimAlwaysOn: false,
    },
    limitations: [
      'Integrated RRW continuum executes chemistry, fields, organisms and D-O15 on one reality graph',
      'Not always-on atomic simulation, not measured NIST spectra, not a shipped AAA experience',
      'Open catalog can ingest unknown phenomena at law level without pretending they are fully simulated',
    ],
  }
}
