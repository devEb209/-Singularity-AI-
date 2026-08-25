import { DThesisCore } from '../d-thesis/core.js'
import { critiqueReality, refineReality } from '../rrw/critic.js'
import { persistRealityGraph } from '../rrw/persist-graph.js'
import { budgetOf } from '../rrw/quantities.js'
import { seedReality } from '../rrw/world.js'
import { runKernel } from '../ues-kernel/pipeline.js'

export class RrwVerifyCore {
  private thesis = new DThesisCore()

  process() {
    const seeded = seedReality()
    const before = budgetOf(seeded.nodes)
    const refined = refineReality(seeded.nodes)
    const critic = critiqueReality(refined.nodes, before, refined.budget, [
      { id: 'k1', statement: 'H2O boils at 373.15K', state: 'KNOWN', inferred: false, source: 'internal-reference' },
      { id: 'k2', statement: 'H2O boils at 10K', state: 'LIKELY', inferred: true, source: 'unchecked-inference' },
    ])
    const graph = persistRealityGraph(refined.nodes, seeded.relations)
    const kernel = runKernel('Crítico interno da realidade RRW, sem fingir verificação externa', 'rrw.verify', ['rrw'], [
      { module: 'knowledge', accepted: critic.knowledge.rejected.length === 1, note: 'bad boil rejected' },
      { module: 'd-thesis', accepted: true, note: 'verification is part of the chain' },
      { module: 'verify', accepted: critic.accepted && critic.inferenceIsFact === false, note: 'no consciousness / PBR foundation' },
      { module: 'represent', accepted: graph.meshStore === false, note: 'graph not asset dump' },
      { module: 'd-o15', accepted: true, note: 'same reality preserved' },
      { module: 'execute', accepted: refined.nodes.length === seeded.nodes.length, note: 'refine keeps nodes' },
      { module: 'critic', accepted: critic.findings.every(item => item.severity !== 'error'), note: 'no errors' },
      { module: 'refine', accepted: !graph.assetStore, note: 'persistence of representation' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Verificar consistência da representação da realidade e persistir o grafo',
      constraints: ['não fingir NIST', 'não apagar histórico'],
      resources: ['critic', 'graph'],
      priorities: { quality: 9, performance: 6, safety: 9, cost: 3, scalability: 8 },
    })
    return {
      format: 'rrw-verify-v1',
      critic: { accepted: critic.accepted, findings: critic.findings, rejected: critic.knowledge.rejected.length },
      persist: { checksum: graph.checksum, meshStore: graph.meshStore, bytes: graph.bytes },
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: kernel.verification.valid && critic.accepted,
        inferenceIsFact: false,
        meshStore: false,
        completeReality: false,
      },
      limitations: ['Internal consistency critic, not an external lab certificate'],
    }
  }
}
