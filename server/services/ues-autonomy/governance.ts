import { createHash } from 'node:crypto'
import { DECISION_WINDOW_MS, type AutonomyProject, type DecisionWindow, type HumanControl, type IntentionItem } from './types.js'
import { now } from '../../lib/id.js'

const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const item = (level: IntentionItem['level'], text: string, mutable: boolean): IntentionItem => ({
  id: createHash('sha256').update(`${level}:${text}`).digest('hex').slice(0, 16),
  level,
  text,
  mutable,
})

export const parseIntention = (intent: string, constraints: string[] = []): IntentionItem[] => {
  const items: IntentionItem[] = []
  const lines = [intent, ...constraints].map(value => value.trim()).filter(Boolean)
  for (const line of lines) {
    const hay = normalize(line)
    if (/\b(nunca|never|proibido|forbidden|nao pode|não pode|must not)\b/.test(hay)) {
      items.push(item(2, line, false))
      continue
    }
    if (/\b(obrigatorio|obrigatório|must|sempre|absolute|nao altere|não altere)\b/.test(hay)) {
      items.push(item(1, line, false))
      continue
    }
    if (/\b(prefer|preferir|gostaria|ideal|se possivel|se possivel|nice to have)\b/.test(hay) || hay.includes('preferir')) {
      items.push(item(3, line, true))
      continue
    }
    if (/\b(voce decide|você decide|autonomo|autônomo|delegad|pode escolher|sua escolha)\b/.test(hay)) {
      items.push(item(4, line, true))
      continue
    }
    items.push(item(intent === line ? 1 : 5, line, intent !== line))
  }
  if (!items.some(entry => entry.level === 1)) items.unshift(item(1, intent, false))
  return items
}

export const canMutate = (project: AutonomyProject, text: string) => {
  const hay = normalize(text)
  if (/remover|ignorar|abandonar|violar/.test(hay) && /objetivo absoluto|absolute objective|nivel 1|nível 1|restricao|restrição|constraint/.test(hay)) return false
  const blocked = project.items.filter(entry => !entry.mutable && (entry.level === 1 || entry.level === 2))
  return !blocked.some(entry => hay.includes(normalize(entry.text).slice(0, 24)) && /remover|ignorar|abandonar|violar/.test(hay))
}

export const silenceIsNotAuthorization = (project: AutonomyProject) => {
  const window = project.window
  if (!window || window.status !== 'open') return { continue: project.stage !== 'awaiting-user', reason: 'no open window' }
  if (window.delegated) return { continue: true, reason: 'delegated decision may continue after the window' }
  return { continue: false, reason: 'silence does not authorize a non-delegated decision' }
}

export const openWindow = (question: string, alternatives: string[], recommended: string, delegated: boolean, at = Date.now()): DecisionWindow => ({
  id: createHash('sha256').update(`${question}:${at}`).digest('hex').slice(0, 16),
  question,
  alternatives,
  recommended,
  delegated,
  openedAt: new Date(at).toISOString(),
  expiresAt: new Date(at + DECISION_WINDOW_MS).toISOString(),
  status: 'open',
})

export const resolveWindow = (project: AutonomyProject, answer: string) => {
  if (!project.window || project.window.status !== 'open') throw new Error('No open decision window.')
  if (!project.window.alternatives.includes(answer) && answer !== project.window.recommended) {
    throw new Error('Answer is not one of the recorded alternatives.')
  }
  project.window.status = 'answered'
  project.window.answer = answer
  project.stage = 'planning'
  project.updatedAt = now()
  return project.window
}

export const expireWindow = (project: AutonomyProject, at = Date.now()) => {
  if (!project.window || project.window.status !== 'open') return project.window
  if (at < Date.parse(project.window.expiresAt)) return project.window
  if (project.window.delegated) {
    project.window.status = 'expired-applied'
    project.window.answer = project.window.recommended
    project.stage = 'planning'
  } else {
    project.window.status = 'expired-blocked'
    project.stage = 'blocked'
  }
  project.updatedAt = now()
  return project.window
}

export const applyControl = (project: AutonomyProject, control: HumanControl, alteration?: string) => {
  project.updatedAt = now()
  if (control === 'pause') {
    project.paused = true
    project.stage = 'paused'
    return project
  }
  if (control === 'continue' || control === 'return-autonomy') {
    project.paused = false
    project.humanInControl = false
    if (project.stage === 'paused' || project.stage === 'blocked') project.stage = 'planning'
    return project
  }
  if (control === 'take-control' || control === 'review') {
    project.humanInControl = true
    project.paused = control === 'take-control'
    if (control === 'take-control') project.stage = 'paused'
    return project
  }
  if (control === 'reject') {
    project.stage = 'blocked'
    project.paused = true
    project.history.push({ at: now(), stage: 'blocked', note: 'User rejected the current autonomous path.' })
    return project
  }
  if (control === 'approve') {
    project.paused = false
    if (project.window?.status === 'open') resolveWindow(project, project.window.recommended)
    project.stage = 'implementation'
    return project
  }
  if (control === 'alter') {
    if (!alteration) throw new Error('alter requires text')
    if (!canMutate(project, alteration)) throw new Error('Cannot violate an absolute objective or constraint.')
    project.items.push(item(3, alteration, true))
    project.history.push({ at: now(), stage: project.stage, note: `User altered preferences: ${alteration}` })
    return project
  }
  return project
}

export const isolationRecord = (userId: string, projectId: string) => ({
  projectScoped: true as const,
  usedForGlobalTraining: false as const,
  tenant: createHash('sha256').update(`${userId}:${projectId}`).digest('hex'),
})
