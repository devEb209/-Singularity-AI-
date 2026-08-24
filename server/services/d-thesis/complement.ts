import { RealLifeCore } from '../real-life/core.js'
import type { HardwareTier, RealityMode } from '../real-life/types.js'
import { NmnCore } from '../nmn/core.js'
import { AutonomyCore } from '../ues-autonomy/core.js'
import { DThesisCore } from './core.js'
import type { DContext } from './types.js'

export interface ComplementInput extends DContext {
  mode?: RealityMode
  hardware?: HardwareTier
  phenomenon?: string
  includeWarScenario?: boolean
}

const worldIntent = (text: string) => /jogo|mundo|npc|cidade|guerra|simula|personagem|ecologia|clima|fisica|física|sociedade|realidade/.test(text.toLowerCase())

export class DThesisComplement {
  private thesis = new DThesisCore()
  private realLife = new RealLifeCore()
  private nmn = new NmnCore()
  private autonomy = new AutonomyCore()

  evaluate(input: ComplementInput & { userId?: string; projectId?: string; name?: string }) {
    const dThesis = this.thesis.evaluate(input)
    const realLife = this.realLife.compose({
      objective: input.objective,
      phenomenon: input.phenomenon ?? input.context,
      mode: input.mode ?? 'real-life',
      hardware: input.hardware ?? 'balanced',
      sources: [],
    })
    const wantsWorld = input.includeWarScenario !== false && worldIntent(`${input.objective} ${input.context ?? ''}`)
    const nmn = wantsWorld
      ? this.nmn.war(input.projectId ?? 'ephemeral', 1)
      : { capabilities: { scriptIsNotPrimaryIntelligence: true, voice: 'adapter-required' as const, consciousnessClaim: false } }
    const autonomyProject = this.autonomy.create({
      userId: input.userId ?? 'system',
      projectId: input.projectId ?? 'ephemeral',
      name: input.name ?? 'complement',
      intent: input.objective,
      constraints: input.constraints,
    })
    const autonomy = this.autonomy.evaluate(this.autonomy.tick(autonomyProject))
    const invasion = 'invasionPass' in nmn ? nmn.invasionPass : undefined
    return {
      format: 'snb-ues-d-thesis-complement-v1',
      replacesOriginalThesis: false,
      notLimitedToGraphicsOrPhysics: true,
      realismMandatory: false,
      closedModuleList: false,
      dThesis,
      realLife: {
        mode: realLife.mode,
        domains: realLife.domains,
        knowledge: realLife.knowledge,
        physicsConsistent: realLife.physics.consistency.consistent,
        hardware: realLife.hardwareAdaptation,
        genesis: realLife.genesis.status,
        graphicsGoal: realLife.graphics.goal,
      },
      nmn: invasion
        ? { actions: invasion.characters.map(item => ({ name: item.name, action: item.action })), distinct: invasion.distinctActions, emergence: invasion.emergence, voice: invasion.voice }
        : { capabilities: { scriptIsNotPrimaryIntelligence: true, voice: 'adapter-required', consciousnessClaim: false } },
      autonomy,
      summary: {
        domains: realLife.domains.selected.length,
        npcActions: invasion?.distinctActions.length ?? 0,
        gpp: dThesis.gpp.score,
        autonomyStage: autonomy.project.stage,
      },
      verification: {
        valid: dThesis.gpp.score >= 0 && realLife.verification.valid && autonomy.verification.valid && (invasion ? invasion.verification.valid : true),
        graphicsOnlyInterpretation: false,
        absolutePerfectionClaim: false,
      },
    }
  }
}
