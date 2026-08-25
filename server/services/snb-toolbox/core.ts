import { DThesisCore } from '../d-thesis/core.js'
import { runKernel } from '../ues-kernel/pipeline.js'
import { blockedTag, seedAssets } from './catalog.js'
import { chooseMain, nothingErased, seedLore } from './lore.js'

export class SnbToolboxCore {
  private thesis = new DThesisCore()

  process() {
    const assets = seedAssets()
    const lore = seedLore()
    const rotated = chooseMain(lore, 'alt-c')
    const abuse = ['bridge', 'hate-speech', 'architecture']
    const kernel = runKernel('Toolbox e lore persistente da Gênesis', 'snb.toolbox', ['community'], [
      { module: 'knowledge', accepted: true, note: 'lanes + provenance' },
      { module: 'd-thesis', accepted: true, note: 'universes do not erase' },
      { module: 'toolbox', accepted: new Set(assets.map(item => item.lane)).size === 4, note: 'four lanes' },
      { module: 'represent', accepted: true, note: 'catalog not a storefront fake' },
      { module: 'd-o15', accepted: true, note: 'moderation is filter not silence=allow' },
      { module: 'execute', accepted: nothingErased(lore, rotated) && rotated.find(item => item.id === 'alt-c')?.layer === 'main', note: 'A archived B stays' },
      { module: 'verify', accepted: abuse.some(blockedTag) && !blockedTag('bridge'), note: 'abuse filter' },
      { module: 'refine', accepted: assets.every(item => item.license.length > 0), note: 'license present' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Ecossistema SNB: UES constrói, SNB conecta, comunidade vive',
      constraints: ['não apagar universo antigo', 'não fingir marketplace live'],
      resources: ['catalog', 'lore layers'],
      priorities: { quality: 8, performance: 6, safety: 9, cost: 4, scalability: 9 },
    })
    return {
      format: 'snb-toolbox-v1',
      assets: assets.length,
      lanes: [...new Set(assets.map(item => item.lane))],
      lore: rotated.map(item => ({ id: item.id, layer: item.layer, active: item.active })),
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: kernel.verification.valid && nothingErased(lore, rotated),
        marketplaceLive: false,
      },
      limitations: ['Catalog + canon layers', 'Not a public store or voting product yet'],
    }
  }
}
