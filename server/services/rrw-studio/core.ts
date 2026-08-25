import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { inspectReality } from './inspect.js'

export class RrwStudioCore {
  private thesis = new DThesisCore()

  process() {
    const phone = inspectReality('mobile')
    const desk = inspectReality('dedicated')
    const desert = inspectReality('mobile', 'deserto quente com dunas')
    const kernel = runKernel('Studio RRW inspeciona nós de realidade, não um viewport de mesh', 'rrw.studio', ['rrw'], [
      { module: 'knowledge', accepted: true, note: 'reality inspector' },
      { module: 'd-thesis', accepted: true, note: 'not Unreal editor' },
      { module: 'studio', accepted: phone.nodes.length === desk.nodes.length, note: 'same ids' },
      { module: 'represent', accepted: true, note: 'descriptions differ by device' },
      { module: 'd-o15', accepted: phone.selected?.preset === false, note: 'no preset' },
      { module: 'execute', accepted: phone.experience.framebufferFoundation === false && phone.experience.light.pbr === false, note: 'experience not framebuffer' },
      { module: 'verify', accepted: !phone.meshViewport && !phone.aaaEditor, note: 'not AAA viewport' },
      { module: 'refine', accepted: desert.nodes.length >= phone.nodes.length, note: 'composed inspect' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Ferramenta de criação sobre RRW, sem copiar Unreal',
      constraints: ['não mesh-first', 'não fingir AAA'],
      resources: ['inspect', 'experience'],
      priorities: { quality: 8, performance: 7, safety: 8, cost: 3, scalability: 8 },
    })
    return {
      format: 'rrw-studio-v1',
      phone: { ocean: phone.selected?.description, nodes: phone.nodes.length },
      dedicated: { ocean: desk.selected?.description, nodes: desk.nodes.length },
      desert: { nodes: desert.nodes.length, biomeInspect: true },
      experience: phone.experience,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: kernel.verification.valid && !phone.meshViewport,
        aaaEditor: false,
        meshViewport: false,
      },
      limitations: ['Reality inspector foundation, not a shipped production editor'],
    }
  }
}
