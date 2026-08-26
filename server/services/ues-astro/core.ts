import { DThesisCore } from '../d-thesis/core.js'
import { probeAstro } from './adapter.js'
import { direction, localCatalog } from './catalog.js'

export class UesAstroCore {
  private thesis = new DThesisCore()

  process(day = 80) {
    const catalog = localCatalog(day)
    const later = localCatalog(day + 10)
    const sirius = direction(101.287, -16.716)
    const unit = Math.hypot(sirius.x, sirius.y, sirius.z)
    const remote = probeAstro('nasa-horizons')
    const dThesis = this.thesis.evaluate({
      objective: 'Representar o universo observável dentro dos catálogos e modelos disponíveis, sem n-body falso',
      constraints: ['não reivindicar céu completo', 'não fingir Horizons/SIMBAD live'],
      resources: ['Kepler', 'star directions', 'Messier sample'],
      priorities: { quality: 7, performance: 9, safety: 8, cost: 3, scalability: 8 },
    })
    return {
      format: 'ues-astro-v1',
      catalog: {
        planets: catalog.planets.length,
        stars: catalog.stars.length,
        deepSky: catalog.deepSky.length,
        moon: catalog.moon.id,
      },
      motion: { earthMoved: catalog.planets[2].x !== later.planets[2].x },
      adapters: remote,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: catalog.planets.length === 8 && Math.abs(unit - 1) < 1e-4 && catalog.stars.length === 3 && remote.liveRemote === false && catalog.nBody === false,
        nBody: false,
        completeUniverse: false,
        nasa: false,
      },
      limitations: ['Keplerian solar system + tiny public sky sample', 'Not a complete observable-universe survey'],
    }
  }
}
