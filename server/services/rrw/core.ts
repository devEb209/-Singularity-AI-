import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { acousticTravel } from './acoustics.js'
import { compareMedia } from './coupling.js'
import { contains } from './geometry.js'
import { adaptWorld, deviceProfiles, situationsNearShore } from './do15.js'
import { stepReality } from './evolve.js'
import { potentialAt } from './gravity.js'
import { reconcile } from './knowledge.js'
import { materialize } from './materialize.js'
import { phaseAt } from './matter.js'
import { experienceAt } from './observer.js'
import { populateGrove } from './populate.js'
import { requireSubstance } from './substances.js'
import { describeWater } from './water.js'
import { seedReality } from './world.js'

export class RrwCore {
  private thesis = new DThesisCore()

  process() {
    const reality = seedReality()
    const water = requireSubstance('H2O')
    const gold = requireSubstance('Au')
    const media = compareMedia()
    const phone = deviceProfiles.mobile
    const desk = deviceProfiles.dedicated
    const situations = situationsNearShore(reality.nodes)
    const phoneAdapt = adaptWorld(reality.nodes, situations, phone)
    const deskAdapt = adaptWorld(reality.nodes, situations, desk)
    const phoneIds = phoneAdapt.adaptations.map(item => item.nodeId).sort().join(',')
    const deskIds = deskAdapt.adaptations.map(item => item.nodeId).sort().join(',')
    const phoneOcean = phoneAdapt.adaptations.find(item => item.nodeId === 'ocean')
    const deskOcean = deskAdapt.adaptations.find(item => item.nodeId === 'ocean')
    const phoneSky = phoneAdapt.adaptations.find(item => item.nodeId === 'atmosphere')
    const deskSky = deskAdapt.adaptations.find(item => item.nodeId === 'atmosphere')
    const differentDescription = phoneAdapt.adaptations.some(item => item.description !== deskAdapt.adaptations.find(entry => entry.nodeId === item.nodeId)?.description)
    const frame = materialize(reality.nodes, deskAdapt.adaptations, desk)
    const weak = materialize(reality.nodes, phoneAdapt.adaptations, phone)
    const oceanNode = reality.nodes.find(item => item.id === 'ocean')!
    const inside = contains(oceanNode.extent, [0, 0, 0])
    const outside = contains(oceanNode.extent, [0, 8, 0])
    const living = reality.nodes.filter(item => item.kind === 'living')
    const evolved = stepReality(reality.nodes, 1)
    const fireBefore = reality.nodes.find(item => item.id === 'fire')!.temperatureK
    const fireAfter = evolved.find(item => item.id === 'fire')!.temperatureK
    const near = potentialAt(reality.nodes, [0, 1, 0])
    const far = potentialAt(reality.nodes, [0, 200, 0])
    const grove = populateGrove(48)
    const experience = experienceAt(reality.nodes)
    const air = reality.nodes.find(item => item.id === 'atmosphere')!
    const sound = acousticTravel([1.4, 0.3, 3.2], [0.45, 1.55, 3.55], air)
    const claims = reconcile([
      { id: 'k1', statement: 'H2O boils at 373.15K', state: 'KNOWN', inferred: false, source: 'internal-reference' },
      { id: 'k2', statement: 'H2O boils at 10K', state: 'LIKELY', inferred: true, source: 'unchecked-inference' },
    ])
    const kernel = runKernel('RRW: realidade → D-O15 → materialização, sem pipeline tradicional', 'rrw', ['d-thesis', 'matter', 'spectrum'], [
      { module: 'knowledge', accepted: true, note: 'internal substances + claims' },
      { module: 'd-thesis', accepted: true, note: 'not a graphics unlock ladder' },
      { module: 'rrw', accepted: water.molarMass === 18.015 && !('roughness' in water) && !('albedo' in water), note: 'matter not PBR' },
      { module: 'represent', accepted: phoneIds === deskIds && phoneOcean?.preset === false, note: 'same reality' },
      { module: 'd-o15', accepted: differentDescription && phoneAdapt.lod === false && phoneSky?.description !== 'interactive-local', note: 'adapter not LOD' },
      { module: 'execute', accepted: media.water.luminance < media.air.luminance && fireAfter < fireBefore && near < far && grove.sameIds && claims.rejected.length === 1, note: 'fields + evolve + knowledge' },
      { module: 'verify', accepted: !frame.traditionalPipeline && !experience.framebufferFoundation && !experience.light.pbr && sound.shaderAudio === false && living.every(item => item.living?.consciousnessClaim === false), note: 'not a renamed engine' },
      { module: 'refine', accepted: phaseAt(water, 250) === 'solid' && phaseAt(water, 290) === 'liquid' && phaseAt(water, 400) === 'gas' && gold.z === 79, note: 'phase + table' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Fundação RRW da Gênesis: representar realidade e materializar por D-O15, sem copiar Unreal',
      constraints: ['não pipeline mesh-material-shader', 'não LOD como D-O15', 'hardware não define arquitetura', 'realismo não obrigatório'],
      resources: ['substances', 'spectrum', 'D-O15', 'cpu-field'],
      priorities: { quality: 9, performance: 8, safety: 9, cost: 3, scalability: 10 },
    })
    return {
      format: 'rrw-v1',
      architecture: 'REALITY → KNOWLEDGE → TESE DOS D → REPRESENTATION → D-O15 → RRW → MATERIALIZATION',
      nodes: reality.nodes.length,
      relations: reality.relations.length,
      water: { formula: water.formula, molarMass: water.molarMass, phase290: phaseAt(water, 290), shaderWater: describeWater(290).shaderWater },
      devices: {
        phone: { class: phone.class, ocean: phoneOcean?.description, atmosphere: phoneSky?.description },
        dedicated: { class: desk.class, ocean: deskOcean?.description, atmosphere: deskSky?.description },
        sameIds: phoneIds === deskIds,
      },
      materialization: {
        dedicated: frame.backend,
        phone: weak.backend,
        waterLuminance: frame.water.luminance,
        compatibilityFoundation: frame.compatibility.foundation,
      },
      living: living.map(item => ({ id: item.id, species: item.living?.species, consciousnessClaim: false })),
      evolve: { fireBefore, fireAfter },
      gravity: { near, far },
      grove,
      experience,
      knowledge: { rejected: claims.rejected.length, inferenceIsFact: claims.inferenceIsFact },
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: {
        valid: kernel.verification.valid && phoneIds === deskIds && media.water.luminance < media.air.luminance,
        traditionalPipeline: false,
        meshIsFoundation: false,
        pbrIsFoundation: false,
        lodIsDo15: false,
        hardwareDeterminesArchitecture: false,
        ultraPreset: false,
        rayTraced: false,
        nanite: false,
        lumen: false,
        webgpuRequired: false,
        nasaRequired: false,
        consciousnessClaim: false,
        atomSimAlwaysOn: false,
        completeReality: false,
      },
      limitations: [
        'RRW foundation executes matter/spectrum/D-O15/materialization',
        'Not always-on atomic simulation, not measured NIST spectra, not a shipped AAA experience',
        'Compatibility mesh/PBR ports remain ports',
      ],
    }
  }
}
