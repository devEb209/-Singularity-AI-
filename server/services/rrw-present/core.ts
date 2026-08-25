import { DThesisCore } from '../d-thesis/core.js'
import { composeReality } from '../rrw/compose.js'
import { adaptWorld, deviceProfiles, situationsNearShore } from '../rrw/do15.js'
import { presentWorld } from '../rrw/present.js'
import { runKernel } from '../ues-kernel/pipeline.js'

export class RrwPresentCore {
  private thesis = new DThesisCore()

  process(prompt = 'oceano salgado sob céu nublado') {
    const composed = composeReality(prompt)
    const phone = presentWorld(composed.nodes, adaptWorld(composed.nodes, situationsNearShore(composed.nodes), deviceProfiles.mobile).adaptations)
    const desk = presentWorld(composed.nodes, adaptWorld(composed.nodes, situationsNearShore(composed.nodes), deviceProfiles.dedicated).adaptations)
    const kernel = runKernel('Materialização por descrição D-O15, não framebuffer fundação', 'rrw.present', ['rrw'], [
      { module: 'knowledge', accepted: true, note: 'composed nodes' },
      { module: 'd-thesis', accepted: true, note: 'device executes description' },
      { module: 'present', accepted: phone.packets.length === desk.packets.length, note: 'same ids' },
      { module: 'represent', accepted: !phone.meshIsFoundation, note: 'packets not meshes' },
      { module: 'd-o15', accepted: true, note: 'description chooses packet' },
      { module: 'execute', accepted: !phone.framebufferFoundation, note: 'no framebuffer foundation' },
      { module: 'verify', accepted: !phone.pbrIsFoundation && !phone.ultraPreset, note: 'not Ultra' },
      { module: 'refine', accepted: true, note: 'cpu-field present' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Materializar a mesma realidade em pacotes adequados ao dispositivo',
      constraints: ['não framebuffer fundação', 'não preset Ultra'],
      resources: ['D-O15', 'present'],
      priorities: { quality: 8, performance: 9, safety: 8, cost: 3, scalability: 9 },
    })
    return {
      format: 'rrw-present-v1',
      phone: { packets: phone.packets.length, framebufferFoundation: phone.framebufferFoundation },
      dedicated: { packets: desk.packets.length, framebufferFoundation: desk.framebufferFoundation },
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: kernel.verification.valid && !phone.framebufferFoundation,
        meshIsFoundation: false,
        framebufferFoundation: false,
      },
      limitations: ['Description packets, not a shipped display compositor'],
    }
  }
}
