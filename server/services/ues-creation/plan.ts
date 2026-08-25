export const creationPlan = (intent: string, timeBudgetHours: number) => {
  const phases = ['understand', 'plan', 'implement', 'test', 'refine', 'optimize']
  const aaaMinutes = timeBudgetHours * 60 < 30
  return {
    format: 'ues-creation-plan-v1' as const,
    intent,
    timeBudgetHours,
    phases,
    potentiallyInfinite: false,
    instantAaa: false,
    needsTime: !aaaMinutes,
    verification: { valid: phases.length === 6 && timeBudgetHours > 0 },
    rule: 'Complex projects require time, orchestration and D-O15. Minutes do not finish an AAA world.',
  }
}
