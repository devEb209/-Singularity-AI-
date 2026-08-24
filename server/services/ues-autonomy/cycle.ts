import { now } from '../../lib/id.js'
import { expireWindow, openWindow } from './governance.js'
import { classifyClaim, skipRedundantResearch } from './knowledge.js'
import type { AutonomyProject, AutonomyStage } from './types.js'

const sequence: AutonomyStage[] = [
  'intention', 'planning', 'research', 'specialization', 'implementation',
  'test', 'verification', 'correction', 'integration', 'do15', 'evaluation',
]

export const remainingWork = (project: AutonomyProject) => {
  const remaining: string[] = []
  if (project.stage !== 'complete' && project.cycle < 3) remaining.push('Satisfazer objetivos absolutos com artefato verificável')
  if (!project.knowledge.some(item => item.usableAsFact) && project.stage !== 'complete') remaining.push('Adquirir conhecimento verificável ou declarar hipótese')
  if (project.knowledge.some(item => !item.usableAsFact && /fato|fact|provado/.test(item.claim))) remaining.push('Impedir promoção automática de hipótese a fato')
  if (project.window?.status === 'expired-blocked') remaining.push('Decisão não delegada bloqueada após a janela de 5m30s')
  if (project.stage !== 'complete' && project.stage !== 'blocked') remaining.push('O que ainda falta para alcançar completamente o objetivo?')
  return remaining
}

export const nextStage = (stage: AutonomyStage): AutonomyStage => {
  if (stage === 'complete' || stage === 'paused' || stage === 'blocked' || stage === 'awaiting-user') return stage
  const index = sequence.indexOf(stage)
  if (index < 0) return 'planning'
  return sequence[index + 1] ?? 'complete'
}

export const tickProject = (project: AutonomyProject, at = Date.now()) => {
  if (project.paused || project.humanInControl) {
    project.remaining = remainingWork(project)
    return project
  }
  expireWindow(project, at)
  if (project.stage === 'blocked') {
    project.remaining = remainingWork(project)
    return project
  }
  if (project.stage === 'awaiting-user' && project.window?.status === 'open') {
    project.remaining = remainingWork(project)
    return project
  }
  if (project.stage === 'research' && skipRedundantResearch(project.knowledge, project.intent)) {
    project.history.push({ at: now(), stage: 'research', note: 'D-O15 skipped redundant research; verified knowledge already exists.' })
    project.stage = 'specialization'
  } else {
    const upcoming = nextStage(project.stage === 'awaiting-user' ? 'planning' : project.stage)
    if (upcoming === 'implementation' && !project.items.some(item => item.level === 4) && !project.window) {
      project.window = openWindow(
        'Qual estratégia de implementação deve ser usada?',
        ['quality-first', 'balanced', 'efficiency-first'],
        'balanced',
        false,
        at,
      )
      project.stage = 'awaiting-user'
      project.history.push({ at: now(), stage: 'awaiting-user', note: 'Non-delegated implementation choice opened a 5m30s window.' })
      project.remaining = remainingWork(project)
      return project
    }
    project.stage = upcoming
  }
  if (project.stage === 'research' && !project.knowledge.length) {
    project.knowledge.push(classifyClaim({ claim: project.intent, sources: [], inferred: true }))
  }
  project.cycle += 1
  if (project.stage === 'evaluation') project.stage = 'complete'
  project.remaining = remainingWork(project)
  project.history.push({ at: now(), stage: project.stage, note: `Cycle ${project.cycle}. Remaining: ${project.remaining.join('; ') || 'none'}` })
  project.updatedAt = now()
  return project
}
