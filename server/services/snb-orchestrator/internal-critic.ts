import { executeInternal } from './execute.js'

export const critiqueInternal = (intent: string) => {
  const run = executeInternal(intent)
  const findings = [
    !run.semantic.valid ? { code: 'semantic-invalid', severity: 'error' as const, message: 'semantic-3d failed verification' } : undefined,
    !run.solid.valid ? { code: 'solid-invalid', severity: 'error' as const, message: 'solid CSG failed verification' } : undefined,
    run.image3d.learnedVision ? { code: 'vision-claim', severity: 'error' as const, message: 'learned vision was claimed' } : undefined,
    run.semantic.valid && run.solid.valid && !run.image3d.learnedVision
      ? { code: 'internal-ok', severity: 'info' as const, message: 'internal tools verified without Puter' }
      : undefined,
  ].filter((item): item is { code: string; severity: 'error' | 'info'; message: string } => Boolean(item))
  return {
    findings,
    accepted: findings.every(item => item.severity !== 'error'),
    puterExecuted: false as const,
    automaticInternal: true as const,
  }
}
