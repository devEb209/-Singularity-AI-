import { DThesisCore } from '../d-thesis/core.js'
import { DomainCatalog } from './catalog.js'
import { generateModule } from './genesis.js'
import {
  abstractPhenomenon,
  applyMode,
  checkLawConsistency,
  environmentGraph,
  graphicsPhenomena,
  propagateEnvironment,
} from './model.js'
import { adaptToHardware, chooseEquivalent, defaultRepresentations, qualityFrontier } from './optimize.js'
import type { RealLifeRequest, RealityDomain } from './types.js'

export class RealLifeCore {
  readonly catalog = new DomainCatalog()
  private thesis = new DThesisCore()

  register(domain: Omit<RealityDomain, 'closed' | 'seeded'>) {
    return this.catalog.register(domain)
  }

  compose(request: RealLifeRequest) {
    if (request.customDomain) this.catalog.register(request.customDomain)
    const abstraction = abstractPhenomenon(request, this.catalog)
    const mode = applyMode(request.mode, request.customLaws)
    const consistency = checkLawConsistency(mode.laws)
    const environment = environmentGraph()
    const propagated = request.perturbation
      ? propagateEnvironment(environment, request.perturbation.node, request.perturbation.magnitude)
      : { nodes: environment, affected: [], hops: 0, rule: 'No perturbation requested.' }
    const graphics = graphicsPhenomena(request.objective)
    const representations = defaultRepresentations(request.mode)
    const equivalence = chooseEquivalent(representations.filter(item => item.kind === 'geometry'))
    const hardware = adaptToHardware(request.objective, request.hardware, representations)
    const genesis = generateModule(request.phenomenon ?? request.objective, this.catalog)
    const dThesis = this.thesis.evaluate({
      objective: request.objective,
      context: request.phenomenon,
      constraints: ['não limitar a gráficos/física', 'realismo não é obrigatório', ...(consistency.consistent ? [] : consistency.errors)],
      resources: [request.hardware, request.mode, ...abstraction.selected.map(item => item.id)],
      priorities: { quality: 8, performance: request.hardware === 'low' ? 9 : 6, safety: 9, cost: 6, scalability: 7 },
    })
    const frontier = qualityFrontier(8)
    return {
      format: 'ues-real-life-universal-v1',
      thesis: 'Complement of Tese dos D. Does not replace it.',
      notLimitedToGraphicsOrPhysics: true,
      realismMandatory: false,
      closedModuleList: false,
      physicalFourthDimension: false,
      mode: request.mode,
      modeNotes: mode.notes,
      physics: { laws: mode.laws, consistency },
      domains: {
        selected: abstraction.selected.map(item => ({ id: item.id, category: item.category, purpose: item.purpose })),
        available: this.catalog.list().length,
        extensible: true,
      },
      pipeline: abstraction.pipeline,
      knowledge: abstraction.knowledge,
      graphics,
      environment: propagated,
      perceptualEquivalence: equivalence,
      hardwareAdaptation: hardware,
      genesis,
      dThesis: {
        selected: dThesis.selectedDs.map(item => item.key),
        localPerfectPoints: dThesis.localPerfectPoints,
        gpp: dThesis.gpp,
        dO15: dThesis.dO15,
      },
      qualityFrontier: frontier,
      verification: {
        valid: consistency.consistent && abstraction.selected.length >= 0 && hardware.notJustLowerGraphics,
        usableAsFact: abstraction.knowledge.usableAsFact,
        graphicsOnlyInterpretation: false,
      },
      absolutePerfectionClaim: false,
    }
  }
}
