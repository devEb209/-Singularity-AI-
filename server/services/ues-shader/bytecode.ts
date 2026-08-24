import type { IrOp } from './ir.js'
import { cpuEval } from './optimize.js'

export type ShaderStage = 'vertex' | 'fragment' | 'compute'

export interface ShaderBinding {
  slot: number
  name: string
  kind: 'uniform' | 'texture' | 'buffer'
  type: 'f32' | 'vec3' | 'tex2d'
}

export interface CompiledProgram {
  stage: ShaderStage
  ops: IrOp[]
  root: string
  bindings: ShaderBinding[]
  fingerprint: string
}

const fingerprint = (ops: IrOp[], stage: ShaderStage, root: string) =>
  `${stage}:${root}:${ops.map(op => `${op.id}:${op.op}:${op.imm ?? op.args.join('+')}`).join('|')}`

export const compileProgram = (ops: IrOp[], root: string, stage: ShaderStage): CompiledProgram => ({
  stage,
  ops,
  root,
  bindings: [
    { slot: 0, name: 'time', kind: 'uniform', type: 'f32' },
    { slot: 1, name: 'albedo', kind: 'texture', type: 'tex2d' },
  ],
  fingerprint: fingerprint(ops, stage, root),
})

export const executeProgram = (program: CompiledProgram, sample = 0.5) => {
  if (program.stage === 'compute') return cpuEval(program.ops, program.root, sample)
  if (program.stage === 'vertex') return cpuEval(program.ops, program.root, sample)
  return cpuEval(program.ops, program.root, sample)
}

const cache = new Map<string, CompiledProgram>()

export const cachedCompile = (ops: IrOp[], root: string, stage: ShaderStage) => {
  const key = fingerprint(ops, stage, root)
  const hit = cache.get(key)
  if (hit) return { program: hit, cacheHit: true }
  const program = compileProgram(ops, root, stage)
  cache.set(key, program)
  return { program, cacheHit: false }
}
