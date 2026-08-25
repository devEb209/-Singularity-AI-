import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { emitWgsl } from './emit.js'
import { defaultGraph } from './graph.js'
import { lowerGraph } from './ir.js'
import { cachedCompile, executeProgram } from './bytecode.js'
import { cpuEval, optimizeIr } from './optimize.js'
import { emitPbrWgsl } from './pbr-emit.js'

export class UesShaderCore {
  private thesis = new DThesisCore()

  process() {
    const graph = defaultGraph()
    const ir = lowerGraph(graph)
    const optimized = optimizeIr(ir, 'surf')
    const wgsl = emitWgsl(optimized, 'surf')
    const value = cpuEval(optimized, 'surf', 0.5)
    const fragment = cachedCompile(optimized, 'surf', 'fragment')
    const again = cachedCompile(optimized, 'surf', 'fragment')
    const executed = executeProgram(fragment.program, 0.5)
    const kernel = runKernel('Compilar grafo de material UES para IR e backends', 'ues.shader', ['titko', 'gpu'], [
      { module: 'knowledge', accepted: true, note: 'material graph' },
      { module: 'd-thesis', accepted: true, note: 'specialize used paths' },
      { module: 'shader', accepted: !optimized.some(op => op.id === 'unused'), note: 'DCE' },
      { module: 'represent', accepted: true, note: 'IR not backend' },
      { module: 'd-o15', accepted: optimized.some(op => op.id === 'six' && op.op === 'imm' && op.imm === 6), note: 'fold 2*3' },
      { module: 'execute', accepted: wgsl.includes('6.') && !wgsl.includes('unused') && executed === value && emitPbrWgsl().includes('ues_cook_torrance'), note: 'wgsl + bytecode + pbr' },
      { module: 'verify', accepted: value > 0 && value < 1 && again.cacheHit, note: 'cpu eval + cache' },
      { module: 'refine', accepted: true, note: 'SPIR-V/HLSL remain adapters' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Shader compiler próprio; GLSL/WGSL/HLSL são backends',
      constraints: ['não escrever um shader por material', 'não exigir GPU'],
      resources: ['IR', 'DCE', 'fold'],
      priorities: { quality: 8, performance: 8, safety: 8, cost: 4, scalability: 8 },
    })
    return {
      format: 'ues-shader-v1',
      nodes: graph.length,
      ir: ir.length,
      optimized: optimized.length,
      wgsl,
      pbrWgsl: emitPbrWgsl(),
      cpu: value,
      program: { stage: fragment.program.stage, bindings: fragment.program.bindings.length, cacheHit: again.cacheHit },
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: kernel.verification.valid && optimized.length < ir.length && wgsl.includes('fn ues_material'),
        spirvRequired: false,
      },
      limitations: ['IR + WGSL/GLSL emit + CPU eval', 'Not a full DXC/SPIR-V toolchain'],
    }
  }
}
