import type { IrOp } from './ir.js'

const usedFrom = (ops: IrOp[], root: string) => {
  const byId = new Map(ops.map(op => [op.id, op]))
  const used = new Set<string>()
  const stack = [root]
  while (stack.length) {
    const id = stack.pop()!
    if (used.has(id)) continue
    used.add(id)
    const op = byId.get(id)
    if (op) stack.push(...op.args)
  }
  return used
}

export const optimizeIr = (ops: IrOp[], root: string) => {
  const used = usedFrom(ops, root)
  const live = ops.filter(op => used.has(op.id))
  const folded = live.map(op => {
    if (op.op !== 'mul' && op.op !== 'add') return op
    const args = op.args.map(id => live.find(item => item.id === id)).filter((item): item is IrOp => Boolean(item))
    if (args.length === 2 && args.every(item => item.op === 'imm' && item.imm !== undefined)) {
      const value = op.op === 'mul' ? args[0].imm! * args[1].imm! : args[0].imm! + args[1].imm!
      return { id: op.id, op: 'imm' as const, args: [], imm: value }
    }
    return op
  })
  const stillUsed = usedFrom(folded, root)
  return folded.filter(op => stillUsed.has(op.id))
}

export const cpuEval = (ops: IrOp[], root: string, sample = 0.5) => {
  const values = new Map<string, number>()
  for (const op of ops) {
    if (op.op === 'imm') values.set(op.id, op.imm ?? 0)
    if (op.op === 'add') values.set(op.id, (values.get(op.args[0]) ?? 0) + (values.get(op.args[1]) ?? 0))
    if (op.op === 'mul') values.set(op.id, (values.get(op.args[0]) ?? 0) * (values.get(op.args[1]) ?? 0))
    if (op.op === 'sample') values.set(op.id, sample)
    if (op.op === 'noise') values.set(op.id, 0.1)
    if (op.op === 'pbr') values.set(op.id, (values.get(op.args[0]) ?? sample) * (1 - 0.1 * (values.get(op.args[1]) ?? 0)))
  }
  return values.get(root) ?? 0
}
