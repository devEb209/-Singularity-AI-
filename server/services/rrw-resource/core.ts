import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { allowContinuum, classifyDevice, demandsDedicatedGpu, snapshot } from './budget.js'

export class RrwResourceCore {
  private thesis = new DThesisCore()

  process() {
    const phone = snapshot({ cores: 4, memoryMB: 3072, presentGpu: false, cpuBusy: 0.4 })
    const desk = snapshot({ cores: 16, memoryMB: 32768, presentGpu: true, dedicated: true, cpuBusy: 0.15 })
    const ancient = snapshot({ cores: 1, memoryMB: 1024, presentGpu: false, cpuBusy: 0.7 })
    const kernel = runKernel('Gerente de recursos conversa com D-O15; hardware não define a realidade', 'rrw.resource', ['rrw'], [
      { module: 'knowledge', accepted: true, note: 'device classes' },
      { module: 'd-thesis', accepted: true, note: 'budget is a constraint, not the architecture' },
      { module: 'resource', accepted: classifyDevice({ cores: 4, memoryMB: 3072, presentGpu: false }) === 'mobile', note: 'classify' },
      { module: 'represent', accepted: true, note: 'feeds D-O15 slots' },
      { module: 'd-o15', accepted: allowContinuum(desk) && allowContinuum(phone), note: 'weak still allowed' },
      { module: 'execute', accepted: phone.device.continuumSlots < desk.device.continuumSlots && ancient.device.class === 'ancient', note: 'slots differ' },
      { module: 'verify', accepted: !demandsDedicatedGpu() && !phone.device.presentGpu, note: 'no RTX demand' },
      { module: 'refine', accepted: true, note: 'not a vendor profiler' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Orçar CPU/memória/tarefas para o D-O15 sem exigir GPU dedicada',
      constraints: ['não falhar sem GPU', 'não preset Ultra'],
      resources: ['device profile'],
      priorities: { quality: 7, performance: 9, safety: 8, cost: 3, scalability: 9 },
    })
    return {
      format: 'rrw-resource-v1',
      phone: phone.device.class,
      dedicated: desk.device.class,
      ancient: ancient.device.class,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: { valid: kernel.verification.valid && !demandsDedicatedGpu(), dedicatedGpuRequired: false },
      limitations: ['Process snapshot, not OS telemetry'],
    }
  }
}
