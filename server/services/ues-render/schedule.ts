import type { RenderPassNode } from './passes.js'

export const topologicalPasses = (passes: RenderPassNode[]) => {
  const byId = new Map(passes.map(pass => [pass.id, pass]))
  const seen = new Set<string>()
  const order: RenderPassNode[] = []
  const visit = (id: string) => {
    if (seen.has(id)) return
    seen.add(id)
    const pass = byId.get(id as RenderPassNode['id'])
    if (!pass) return
    for (const dep of pass.dependsOn) visit(dep)
    order.push(pass)
  }
  for (const pass of passes) visit(pass.id)
  return order
}

export const lastUse = (passes: RenderPassNode[]) => {
  const last = new Map<string, string>()
  for (const pass of topologicalPasses(passes)) {
    for (const resource of [...pass.reads, ...pass.writes]) last.set(resource, pass.id)
  }
  return Object.fromEntries(last)
}
