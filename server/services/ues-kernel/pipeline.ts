import { DThesisCore } from '../d-thesis/core.js'
import { optimizeDO15 } from '../d-thesis/optimizer.js'
import { kernelStages, type KernelTrace } from './types.js'

export const runKernel = (objective: string, module: string, knowledge: string[], traces: Omit<KernelTrace, 'stage'>[]) => {
  const thesis = new DThesisCore().evaluate({
    objective,
    constraints: ['sem dependência externa obrigatória', 'sem fingir capacidade ausente', 'realismo não obrigatório'],
    resources: ['SNB', 'UES', ...knowledge],
    priorities: { quality: 8, performance: 8, safety: 9, cost: 4, scalability: 9 },
  })
  const do15 = optimizeDO15(thesis.candidates[0], thesis.context)
  const staged: KernelTrace[] = kernelStages.map((stage, index) => ({
    stage,
    module: traces[Math.min(index, traces.length - 1)]?.module ?? module,
    accepted: traces[Math.min(index, traces.length - 1)]?.accepted ?? true,
    note: traces[Math.min(index, traces.length - 1)]?.note ?? stage,
  }))
  return {
    format: 'ues-kernel-v1' as const,
    stages: [...kernelStages],
    traces: staged,
    thesis: { selected: thesis.selectedDs.map(item => item.key), gpp: thesis.gpp.score, absolutePerfectionClaim: false },
    do15: { accepted: do15.decisions.filter(item => item.accepted).map(item => item.technique), rejected: do15.decisions.filter(item => !item.accepted).map(item => item.technique) },
    verification: { valid: staged.length === 8 && staged.every(item => item.accepted) && do15.decisions.some(item => !item.accepted) },
  }
}
