import { DThesisCore } from '../d-thesis/core.js'
import { SnbConsensusCore } from '../snb-consensus/core.js'
import { creationPlan } from '../ues-creation/plan.js'
import { UesDynamicsCore } from '../ues-dynamics/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { UesLivesCore } from '../ues-lives/core.js'
import { UesMeshNavCore } from '../ues-mesh-nav/core.js'
import { UesSolidCore } from '../ues-solid/core.js'
import { UesStudioCore } from '../ues-studio/core.js'

export class UesAtelierCore {
  private thesis = new DThesisCore()
  private solid = new UesSolidCore()
  private dynamics = new UesDynamicsCore()
  private studio = new UesStudioCore()
  private meshNav = new UesMeshNavCore()
  private lives = new UesLivesCore()
  private consensus = new SnbConsensusCore()

  process(prompt = 'ponte de pedra habitada e bloco recortado') {
    const solid = this.solid.process(prompt)
    const dynamics = this.dynamics.process()
    const studio = this.studio.process()
    const meshNav = this.meshNav.process(prompt)
    const lives = this.lives.process(prompt.slice(0, 40) || 'atelier')
    const consensus = this.consensus.process()
    const creation = creationPlan(prompt, 16)
    const kernel = runKernel(`Atelier de geração 1: ${prompt}`, 'ues.atelier', ['solid', 'dynamics', 'studio', 'lives'], [
      { module: 'knowledge', accepted: true, note: 'internal fallbacks only' },
      { module: 'd-thesis', accepted: true, note: 'shared kernel' },
      { module: 'atelier', accepted: solid.verification.valid && dynamics.verification.valid, note: 'solid+dynamics' },
      { module: 'represent', accepted: studio.verification.valid && !studio.verification.clientEngine, note: 'remote studio' },
      { module: 'd-o15', accepted: lives.verification.valid && !lives.verification.millions, note: 'hierarchical lives' },
      { module: 'execute', accepted: meshNav.verification.valid, note: 'nav from mesh' },
      { module: 'verify', accepted: consensus.verification.valid && !consensus.verification.automaticPuter, note: 'consensus receipt' },
      { module: 'refine', accepted: creation.verification.valid && !creation.instantAaa, note: 'not instant AAA' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: `Competir na geração 1 com geometria, física, studio, vidas e consenso para ${prompt}`,
      constraints: ['sem externo obrigatório', 'sem fingir', 'DsOS não bloqueia'],
      resources: ['solid', 'featherstone', 'studio', 'lives', 'consensus'],
      priorities: { quality: 8, performance: 8, safety: 9, cost: 4, scalability: 9 },
    })
    return {
      format: 'ues-atelier-v1',
      complement: 'does-not-replace-tese-dos-d',
      solid: { subtract: solid.csg.subtract.cells, imageTo3d: solid.verification.imageTo3d },
      dynamics: { pendulumError: dynamics.featherstone.pendulum.error, physx: dynamics.verification.physx },
      studio: { nodes: studio.nodes, aaaViewport: studio.verification.aaaViewport },
      meshNav: { found: meshNav.fromPrompt.found, recast: meshNav.verification.recast },
      lives: { population: lives.population, millions: lives.verification.millions },
      consensus: { decision: consensus.decision, automaticPuter: consensus.verification.automaticPuter },
      creation,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: {
        valid: kernel.verification.valid
          && solid.verification.valid
          && dynamics.verification.valid
          && studio.verification.valid
          && meshNav.verification.valid
          && lives.verification.valid
          && consensus.verification.valid
          && creation.verification.valid,
        imageTo3d: false,
        physx: false,
        recast: false,
        automaticPuter: false,
        instantAaa: false,
      },
    }
  }
}
