export interface ProfileSection {
  name: string
  ns: number
  ms: number
  budgetMs: number
  overBudget: boolean
}

export const measure = (name: string, budgetMs: number, fn: () => void): ProfileSection => {
  const start = process.hrtime.bigint()
  fn()
  const ns = Number(process.hrtime.bigint() - start)
  const ms = ns / 1e6
  return { name, ns, ms: Number(ms.toFixed(4)), budgetMs, overBudget: ms > budgetMs }
}

export const profile = (sections: { name: string; budgetMs: number; fn: () => void }[]) => {
  const results = sections.map(section => measure(section.name, section.budgetMs, section.fn))
  return {
    format: 'ues-profiler-v1',
    device: 'cpu',
    gpu: false,
    sections: results,
    totalMs: Number(results.reduce((sum, item) => sum + item.ms, 0).toFixed(4)),
    overBudget: results.filter(item => item.overBudget).map(item => item.name),
    verification: { valid: results.every(item => item.ns >= 0), measured: true },
  }
}
