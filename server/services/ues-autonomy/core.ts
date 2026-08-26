import { id, now } from '../../lib/id.js'
import { DThesisCore } from '../d-thesis/core.js'
import { generateModule } from '../real-life/genesis.js'
import { DomainCatalog } from '../real-life/catalog.js'
import { tickProject } from './cycle.js'
import { applyControl, isolationRecord, parseIntention, resolveWindow } from './governance.js'
import { classifyClaim } from './knowledge.js'
import type { AutonomyProject, HumanControl } from './types.js'

export class AutonomyCore {
  private thesis = new DThesisCore()
  private catalog = new DomainCatalog()

  create(input: { userId: string; projectId: string; name: string; intent: string; constraints?: string[] }): AutonomyProject {
    const items = parseIntention(input.intent, input.constraints ?? [])
    return {
      id: id('auto'),
      userId: input.userId,
      projectId: input.projectId,
      name: input.name,
      intent: input.intent,
      items,
      stage: 'intention',
      remaining: ['O que ainda falta para alcançar completamente o objetivo?'],
      cycle: 0,
      paused: false,
      humanInControl: false,
      window: null,
      knowledge: [],
      history: [{ at: now(), stage: 'intention', note: 'Intention captured. Absolute objectives are immutable.' }],
      isolation: isolationRecord(input.userId, input.projectId),
      members: [{ userId: input.userId, role: 'owner' }],
      createdAt: now(),
      updatedAt: now(),
    }
  }

  tick(project: AutonomyProject, at?: number) {
    return tickProject(project, at)
  }

  control(project: AutonomyProject, action: HumanControl, alteration?: string) {
    return applyControl(project, action, alteration)
  }

  decide(project: AutonomyProject, answer: string) {
    return resolveWindow(project, answer)
  }

  ingestKnowledge(project: AutonomyProject, claim: Parameters<typeof classifyClaim>[0]) {
    const item = classifyClaim(claim)
    project.knowledge = [...project.knowledge.filter(entry => entry.claim !== item.claim), item]
    return item
  }

  genesis(problem: string) {
    return generateModule(problem, this.catalog)
  }

  evaluate(project: AutonomyProject) {
    const dThesis = this.thesis.evaluate({
      objective: project.intent,
      constraints: project.items.filter(item => item.level <= 2).map(item => item.text),
      resources: ['SNB', 'UES', 'local knowledge verification'],
      priorities: { quality: 9, performance: 6, safety: 9, cost: 5, scalability: 7 },
    })
    return {
      format: 'ues-autonomous-development-v1',
      thesisComplement: true,
      replacesTeseDosD: false,
      anyViableThingMeans: 'any computationally representable system compatible with resources, not magic',
      intention: {
        levels: {
          1: project.items.filter(item => item.level === 1),
          2: project.items.filter(item => item.level === 2),
          3: project.items.filter(item => item.level === 3),
          4: project.items.filter(item => item.level === 4),
          5: project.items.filter(item => item.level === 5),
        },
        silenceIsNotUnlimitedAuthorization: true,
      },
      project,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp, dO15: dThesis.dO15 },
      isolation: project.isolation,
      humanControl: ['pause', 'continue', 'alter', 'reject', 'approve', 'review', 'take-control', 'return-autonomy'],
      decisionWindowMs: 330_000,
      verification: {
        valid: project.items.some(item => item.level === 1) && project.isolation.usedForGlobalTraining === false,
        trainingSeparation: true,
      },
      absolutePerfectionClaim: false,
    }
  }
}
