import { DThesisCore } from '../d-thesis/core.js'
import { catalogSnapshot } from '../rrw/catalog.js'
import { interpretDescription } from '../rrw/interpret.js'
import { runKernel } from '../ues-kernel/pipeline.js'

export class RrwInterpretCore {
  private thesis = new DThesisCore()

  process(prompt = 'oceano salgado sob céu nublado') {
    const interpreted = interpretDescription(prompt)
    const catalog = catalogSnapshot()
    const kernel = runKernel('Informação vira conhecimento e representação, não heightmap', 'rrw.interpret', ['rrw'], [
      { module: 'knowledge', accepted: interpreted.nodes.length > 0, note: 'nodes from text' },
      { module: 'd-thesis', accepted: true, note: 'description is a source' },
      { module: 'interpret', accepted: !interpreted.heightfieldIsIdentity && !interpreted.meshIsFoundation, note: 'not a pasted heightmap' },
      { module: 'represent', accepted: interpreted.substances.length > 0 || interpreted.nodes.some(item => item.domain === 'information'), note: 'substance or open law' },
      { module: 'd-o15', accepted: true, note: 'law until more knowledge exists' },
      { module: 'execute', accepted: catalog.open, note: 'catalog stays open' },
      { module: 'verify', accepted: interpreted.inferenceIsFact === false, note: 'inference is not fact' },
      { module: 'refine', accepted: interpreted.traditionalAsset === false, note: 'not an asset import' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Reconstruir representação a partir de informação, sem colar heightmap',
      constraints: ['não asset final', 'não fingir visão aprendida'],
      resources: ['catalog', 'substances'],
      priorities: { quality: 8, performance: 7, safety: 8, cost: 3, scalability: 9 },
    })
    return {
      format: 'rrw-interpret-v1',
      interpreted,
      catalog,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: kernel.verification.valid && !interpreted.meshIsFoundation,
        heightfieldIsIdentity: false,
        learnedVision: false,
        meshIsFoundation: false,
      },
      limitations: ['Keyword/knowledge reconstruction, not learned image-to-3D'],
    }
  }
}
