import { DThesisCore } from '../d-thesis/core.js'
import { UesPlanetCore } from '../ues-planet/core.js'
import { genreOf } from './genres.js'
import { seaLevelOf, type WorldRecipe } from './recipe.js'

export class UesSynthesisCore {
  private planet = new UesPlanetCore()
  private thesis = new DThesisCore()

  synthesize(recipe: WorldRecipe) {
    const genre = genreOf(recipe.kind)
    const base = this.planet.generate(recipe.seed, 36, 0)
    const mutated = this.planet.generate(`${recipe.seed}:${recipe.kind}`, 36, seaLevelOf(recipe))
    const dThesis = this.thesis.evaluate({
      objective: `Sintetizar mundo ${recipe.kind} a partir de regras terrestres e mutações`,
      constraints: ['realismo não obrigatório', 'não reivindicar magia'],
      resources: ['planet core', 'D Thesis', 'genre knowledge'],
      priorities: { quality: 8, performance: 8, safety: 8, cost: 5, scalability: 9 },
    })
    return {
      format: 'ues-synthesis-v1',
      kind: recipe.kind,
      genre,
      base: { land: base.land, ocean: base.ocean, biomes: base.biomes },
      mutated: { land: mutated.land, ocean: mutated.ocean, biomes: mutated.biomes },
      seaLevel: seaLevelOf(recipe),
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: base.verification.valid && mutated.verification.valid && (seaLevelOf(recipe) <= 0 || mutated.ocean >= base.ocean) && genre.magicAsRule === false,
        magic: false,
        genericNoiseOnly: false,
      },
      limitations: ['Rule mutation of Earth-like geophysics', 'Not a scanned exoplanet'],
    }
  }
}
