import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { navFromPrompt, navFromSolid } from './from-mesh.js'

export class UesMeshNavCore {
  private thesis = new DThesisCore()

  process(prompt = 'ponte de pedra com dois arcos') {
    const fromPrompt = navFromPrompt(prompt)
    const fromSolid = navFromSolid()
    const kernel = runKernel(`Navmesh a partir de malha 3D arbitrária: ${prompt}`, 'ues.mesh-nav', ['voxel', 'funnel', 'solid'], [
      { module: 'knowledge', accepted: true, note: 'mesh occupancy' },
      { module: 'd-thesis', accepted: true, note: 'walkable from geometry' },
      { module: 'mesh-nav', accepted: fromPrompt.found, note: `${fromPrompt.cells} cells` },
      { module: 'represent', accepted: true, note: 'voxel layer' },
      { module: 'd-o15', accepted: true, note: '20x6x20' },
      { module: 'execute', accepted: fromSolid.found, note: 'csg occupancy' },
      { module: 'verify', accepted: fromPrompt.funnel <= fromPrompt.grid + 1e-6, note: 'funnel shorter or equal' },
      { module: 'refine', accepted: !fromPrompt.recast, note: 'not Recast' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Extrair navegação de geometria arbitrária sem Recast comercial',
      constraints: ['não reivindicar Detour', 'CPU only'],
      resources: ['voxelize', 'A*', 'funnel'],
      priorities: { quality: 7, performance: 8, safety: 8, cost: 4, scalability: 7 },
    })
    return {
      format: 'ues-mesh-nav-v1',
      prompt,
      fromPrompt,
      fromSolid,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: kernel.verification.valid && fromPrompt.found && fromSolid.found && fromPrompt.walkable > 8,
        recast: false,
      },
      limitations: ['Voxel occupancy + funnel from arbitrary mesh', 'Not Recast/Detour'],
    }
  }
}
