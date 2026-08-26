import { DThesisCore } from '../d-thesis/core.js'
import { creationPlan } from '../ues-creation/plan.js'
import { UesArticulationCore } from '../ues-articulation/core.js'
import { UesAstroCore } from '../ues-astro/core.js'
import { UesExplorerCore } from '../ues-explorer/core.js'
import { UesFnwsCore } from '../ues-fnws/core.js'
import { UesGisCore } from '../ues-gis/core.js'
import { UesScaleCore } from '../ues-scale/core.js'
import { UesSynthesisCore } from '../ues-synthesis/core.js'
import { recipeFor } from '../ues-synthesis/genres.js'
import { UesTerrainNavCore } from '../ues-terrain-nav/core.js'
import { UesTilesCore } from '../ues-tiles/core.js'
import { UesTitkoCore } from '../ues-titko/core.js'
import { UesUmotionCore } from '../ues-umotion/core.js'
import { UesCityCore } from '../ues-city/core.js'
import { realisLedger } from './status.js'

export class UesRealisCore {
  private thesis = new DThesisCore()
  private gis = new UesGisCore()
  private tiles = new UesTilesCore()
  private scale = new UesScaleCore()
  private water = new UesFnwsCore()
  private titko = new UesTitkoCore()
  private motion = new UesUmotionCore()
  private synthesis = new UesSynthesisCore()
  private astro = new UesAstroCore()
  private nav = new UesTerrainNavCore()
  private ik = new UesArticulationCore()
  private explorer = new UesExplorerCore()
  private city = new UesCityCore()

  process(prompt = 'terra habitavel com granito molhado') {
    const gis = this.gis.ingest('internal-fixture')
    const remote = this.gis.ingest('nasa-earthdata')
    const tiles = this.tiles.process()
    const scale = this.scale.process('realis')
    const water = this.water.process(prompt.slice(0, 40), 'licensed-fixture')
    const titko = this.titko.process('balanced', /textura|material|granit|couro|metal|água|agua/.test(prompt.toLowerCase()) ? prompt : 'granito molhado')
    const motion = this.motion.process()
    const world = this.synthesis.synthesize(recipeFor('alternate', prompt.slice(0, 40), 0.05))
    const astro = this.astro.process()
    const nav = this.nav.process(prompt.slice(0, 40))
    const ik = this.ik.process()
    const explorer = this.explorer.process()
    const city = this.city.simulate(prompt.slice(0, 40), 6)
    const creation = creationPlan(prompt, 10)
    const dThesis = this.thesis.evaluate({
      objective: `Cadeia Realis: dados/conhecimento → Tese dos D → representação → D-O15 → streaming/simulação. ${prompt}`,
      constraints: ['não fingir NASA', 'não fingir visão', 'não armazenar 16K', 'não depender de um fornecedor'],
      resources: ['gis-fixture', 'tiles-hlod', 'scale', 'fnws', 'titko-pbr', 'explorer'],
      priorities: { quality: 8, performance: 9, safety: 10, cost: 4, scalability: 10 },
    })
    const implemented = realisLedger.filter(item => item.machine === 'IMPLEMENTED').length
    return {
      format: 'ues-realis-v1',
      complement: 'does-not-replace-tese-dos-d',
      pipeline: 'dados → ingestão → normalização → semântica → tese-dos-d → representação → d-o15 → streaming → simulação',
      gis: { source: gis.sourceId, fields: gis.fields.length, liveRemote: gis.verification.liveRemote, nasa: gis.nasa },
      remoteNasa: { status: remote.status, valid: remote.verification.valid },
      tiles: { selected: tiles.tree.selected, cesium: tiles.verification.cesium, live: tiles.liveDataset },
      scale: { rungs: scale.rungs.length, jump: scale.descent.jump },
      water: water.verification,
      titko: { storedBitmap16k: titko.verification.storedBitmap16k, pbr: titko.pbr.class, wetness: titko.pbr.wetness },
      motion: { vision: motion.verification.vision, catalog: motion.catalog.length },
      synthesis: { kind: world.kind, magic: world.verification.magic },
      astro: { planets: astro.catalog.planets, nBody: astro.verification.nBody },
      nav: { found: nav.path.found, recast: nav.verification.recast },
      ik: { reached: ik.reachable.reached, featherstone: ik.verification.featherstone },
      explorer: { model: explorer.selection.model, applied: explorer.apply.applied.length },
      city: { sample: city.sampleSize, persist: city.persist.identities },
      creation,
      ledger: realisLedger,
      implemented,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: {
        valid: gis.verification.valid
          && !remote.verification.valid
          && tiles.verification.valid
          && scale.verification.valid
          && water.verification.valid
          && titko.verification.valid
          && motion.verification.valid
          && world.verification.valid
          && astro.verification.valid
          && nav.verification.valid
          && ik.verification.valid
          && explorer.verification.valid
          && city.verification.valid
          && creation.verification.valid,
        nasa: false,
        vision: false,
        storedBitmap16k: false,
        cesiumRequired: false,
        vendorLock: false,
        instantAaa: false,
      },
      limitations: [
        'Internal spatial fixture + own HLOD, not live Earth photogrammetry',
        'TITKO is a reconstructible PBR graph, not a stored 16K bitmap',
        'Video/NASA/Cesium/Google remain adapters',
      ],
    }
  }
}
