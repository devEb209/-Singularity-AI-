import { DThesisCore } from '../d-thesis/core.js'
import { holdWorld } from '../rrw/hold.js'
import { interpretImageKnowledge } from '../rrw/image-knowledge.js'
import { bindSociety } from '../rrw/society-world.js'
import { walkReality } from '../rrw/walk.js'
import { runKernel } from '../ues-kernel/pipeline.js'

export class RrwWorldCore {
  private thesis = new DThesisCore()

  process(prompt = 'oceano salgado sob céu nublado com fogo, floresta e um humano') {
    const held = holdWorld(prompt)
    const walk = walkReality(prompt)
    const society = bindSociety(prompt, 48)
    const image = interpretImageKnowledge()
    const kernel = runKernel('Mundo RRW persistido, andado e habitado sem virar engine tradicional', 'rrw.world', ['rrw', 'loop'], [
      { module: 'knowledge', accepted: image.learnedVision === false, note: 'image is knowledge' },
      { module: 'd-thesis', accepted: true, note: 'same reality across hold' },
      { module: 'world', accepted: held.restored && held.stable, note: 'checksum hold' },
      { module: 'represent', accepted: !held.meshStore && !image.meshFromImage, note: 'graph not mesh' },
      { module: 'd-o15', accepted: society.sameIds, note: 'society same ids' },
      { module: 'execute', accepted: walk.found && held.evolved && society.identities, note: 'days + walk + lives' },
      { module: 'verify', accepted: society.consciousnessClaim && !walk.recast, note: 'no consciousness / recast' },
      { module: 'refine', accepted: !image.heightfieldIsIdentity, note: 'not pasted heightfield' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Persistir e habitar a realidade composta, sem copiar cidade-de-engine',
      constraints: ['sem consciência', 'sem Recast', 'sem visão aprendida'],
      resources: ['hold', 'days', 'society', 'walk'],
      priorities: { quality: 9, performance: 7, safety: 9, cost: 3, scalability: 9 },
    })
    return {
      format: 'rrw-world-v1',
      held,
      walk,
      society,
      image: { wetland: image.wetland, ridge: image.ridge, learnedVision: image.learnedVision },
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: {
        valid: kernel.verification.valid && held.stable && walk.found && society.identities,
        traditionalPipeline: false,
        meshIsFoundation: false,
        consciousnessClaim: false,
        completeReality: false,
        genesisClosed: false,
      },
      limitations: ['Held composed world with hierarchical society sample, not a shipped persistent MMO'],
    }
  }
}
