import type { IrOp } from './ir.js'

export const emitWgsl = (ops: IrOp[], root: string) => {
  const lines = ['fn ues_material(uv: vec2f) -> f32 {']
  for (const op of ops) {
    if (op.op === 'imm') lines.push(`  let ${op.id} = ${op.imm ?? 0}.;`)
    if (op.op === 'add') lines.push(`  let ${op.id} = ${op.args[0]} + ${op.args[1]};`)
    if (op.op === 'mul') lines.push(`  let ${op.id} = ${op.args[0]} * ${op.args[1]};`)
    if (op.op === 'sample') lines.push(`  let ${op.id} = uv.x;`)
    if (op.op === 'noise') lines.push(`  let ${op.id} = fract(sin(dot(uv, vec2f(12.9898, 78.233))) * 43758.5453);`)
    if (op.op === 'pbr') lines.push(`  let ${op.id} = ${op.args[0]} * (1.0 - 0.1 * ${op.args[1]});`)
  }
  lines.push(`  return ${root};`, '}')
  return lines.join('\n')
}

export const emitGlsl = (ops: IrOp[], root: string) =>
  emitWgsl(ops, root).replaceAll('fn ', 'float ').replaceAll('vec2f', 'vec2').replaceAll('let ', 'float ')
