import { compareAcidity, stepAcidity } from './acidity.js'
import { compareCanopy, stepCanopy } from './canopy.js'
import { compareConstruction, stepConstruction } from './construction.js'
import { compareConvection, stepConvection } from './convection.js'
import { compareDew, stepDew } from './dew-fog.js'
import { compareDiffusion, stepDiffusion } from './diffusion.js'
import { compareErosion, stepErosion } from './erosion-step.js'
import { compareFireEcology, stepFireEcology } from './fire-ecology.js'
import { compareIonosphere, stepIonosphere } from './ionosphere.js'
import { compareLightning, stepLightning } from './lightning-step.js'
import { compareMagnetosphere, stepMagnetosphere } from './magnetosphere.js'
import { compareRootUptake, stepRootUptake } from './root-uptake.js'
import { compareSalinity, stepSalinity } from './salinity.js'
import { compareTectonics, stepTectonics } from './tectonics.js'
import { compareToolCraft, stepToolCraft } from './tool-craft.js'
import { composeWithStructures } from './structure.js'

const defaultPrompt = 'oceano salgado com fogo, floresta, um humano e um abrigo'

export const runEarth = (prompt = defaultPrompt) => {
  const composed = composeWithStructures(prompt)
  const salt = stepSalinity(composed.nodes)
  const acid = stepAcidity(salt.nodes)
  const eroded = stepErosion(acid.nodes)
  const plates = stepTectonics(eroded.nodes)
  const magneto = stepMagnetosphere(plates.nodes)
  const iono = stepIonosphere(magneto.nodes)
  const convected = stepConvection(iono.nodes)
  const diffused = stepDiffusion(convected.nodes)
  const dew = stepDew(diffused.nodes)
  const bolt = stepLightning(dew.nodes)
  const canopy = stepCanopy(bolt.nodes)
  const roots = stepRootUptake(canopy.nodes)
  const built = stepConstruction(roots.nodes)
  const crafted = stepToolCraft(built.nodes)
  const fire = stepFireEcology(crafted.nodes)
  const ids0 = new Set(composed.nodes.map(item => item.id))
  const sameIds = [...ids0].every(id => fire.nodes.some(item => item.id === id))
  const saltCmp = compareSalinity(prompt)
  const acidCmp = compareAcidity(prompt)
  const erosionCmp = compareErosion(prompt)
  const tectCmp = compareTectonics(prompt)
  const magCmp = compareMagnetosphere(prompt)
  const ionCmp = compareIonosphere(prompt)
  const convCmp = compareConvection(prompt)
  const diffCmp = compareDiffusion(prompt)
  const dewCmp = compareDew(prompt)
  const lightCmp = compareLightning(prompt)
  const canopyCmp = compareCanopy(prompt)
  const rootCmp = compareRootUptake(prompt)
  const buildCmp = compareConstruction(prompt)
  const craftCmp = compareToolCraft(prompt)
  const fireCmp = compareFireEcology(prompt)
  const valid = saltCmp.conserved && saltCmp.oceanSaltier
    && acidCmp.conserved && acidCmp.moreAcid
    && erosionCmp.conserved && erosionCmp.moved
    && tectCmp.conserved && tectCmp.slipped
    && magCmp.strongerNear
    && ionCmp.conserved
    && convCmp.lifted
    && diffCmp.conserved
    && dewCmp.conserved && dewCmp.dew
    && lightCmp.conserved && lightCmp.struck
    && canopyCmp.shaded
    && rootCmp.conserved
    && buildCmp.conserved && buildCmp.built
    && craftCmp.conserved && craftCmp.crafted
    && fireCmp.conserved && fireCmp.burned
    && salt.conserved && acid.conserved && eroded.conserved && fire.conserved
    && sameIds
  return {
    format: 'rrw-earth-v1' as const,
    architecture: 'REALITY → KNOWLEDGE → TESE DOS D → REPRESENTATION → D-O15 → RRW → MATERIALIZATION → VERIFICATION → REFINEMENT',
    sameIds,
    earth: {
      oceanSaltier: salt.oceanSaltier,
      moreAcid: acid.moreAcid,
      eroded: eroded.moved,
      slipped: plates.slipped,
      magnetosphere: magneto.strongerNear,
      chargeConserved: iono.conserved,
    },
    transport: {
      lifted: convected.lifted,
      mixed: diffused.mixed,
      dew: dew.dew,
      struck: bolt.struck,
    },
    craft: {
      shaded: canopy.shaded,
      roots: roots.taken,
      built: built.built,
      crafted: crafted.crafted,
      burned: fire.burned,
    },
    verification: {
      valid,
      traditionalPipeline: false,
      meshIsFoundation: false,
      heightmapIsIdentity: false,
      shaderErosion: false,
      shaderLightning: false,
      shaderFog: false,
      nasaField: false,
      plateSim: false,
      webgpuRequired: false,
      automaticPuter: false,
      completeReality: false,
      instantAaa: false,
      genesisClosed: false,
    },
    limitations: [
      'Earth-like processes and conserved transport execute on the RRW graph',
      'Not NASA Earth, not complete reality, Genesis is not closed',
    ],
  }
}
