import { compareDrought } from './drought.js'
import { compareEarthquake, stepEarthquake } from './earthquake.js'
import { compareFlood, stepFlood } from './flood.js'
import { compareGlacier } from './glacier.js'
import { compareGroundwater, stepGroundwater } from './groundwater.js'
import { compareOzone } from './ozone.js'
import { compareSediment, stepSediment } from './sediment.js'
import { compareSnowpack } from './snowpack.js'
import { compareSoilHorizon } from './soil-horizon.js'
import { compareTropopause } from './tropopause.js'
import { compareVolcano, stepVolcano } from './volcano.js'
import { compareWatershed, stepWatershed } from './watershed.js'
import { composeWithStructures } from './structure.js'

const defaultPrompt = 'oceano salgado com fogo, floresta, um humano e um abrigo'

export const runSphere = (prompt = defaultPrompt) => {
  const composed = composeWithStructures(prompt)
  const ground = stepGroundwater(composed.nodes)
  const basin = stepWatershed(ground.nodes)
  const flood = stepFlood(basin.nodes)
  const volcano = stepVolcano(flood.nodes)
  const quake = stepEarthquake(volcano.nodes)
  const sediment = stepSediment(quake.nodes)
  const ids0 = new Set(composed.nodes.map(item => item.id))
  const sameIds = [...ids0].every(id => sediment.nodes.some(item => item.id === id)) && sediment.nodes.some(item => item.id === 'aquifer')
  const groundCmp = compareGroundwater(prompt)
  const basinCmp = compareWatershed(prompt)
  const floodCmp = compareFlood(prompt)
  const droughtCmp = compareDrought()
  const glacierCmp = compareGlacier()
  const snowCmp = compareSnowpack()
  const volcanoCmp = compareVolcano(prompt)
  const quakeCmp = compareEarthquake(prompt)
  const sedimentCmp = compareSediment(prompt)
  const horizonCmp = compareSoilHorizon()
  const ozoneCmp = compareOzone(prompt)
  const tropoCmp = compareTropopause(prompt)
  const valid = groundCmp.conserved && groundCmp.stored
    && basinCmp.conserved && basinCmp.drained
    && floodCmp.conserved && floodCmp.flooded
    && droughtCmp.conserved && droughtCmp.desertDrierSoil
    && glacierCmp.alpineIced && glacierCmp.conserved
    && snowCmp.packed && snowCmp.conserved
    && volcanoCmp.conserved && volcanoCmp.erupted
    && quakeCmp.conserved && quakeCmp.remembered
    && sedimentCmp.conserved && sedimentCmp.deposited
    && horizonCmp.layered
    && ozoneCmp.protects
    && tropoCmp.inversion
    && ground.conserved && flood.conserved && volcano.conserved
    && sameIds
  return {
    format: 'rrw-sphere-v1' as const,
    architecture: 'REALITY → KNOWLEDGE → TESE DOS D → REPRESENTATION → D-O15 → RRW → MATERIALIZATION → VERIFICATION → REFINEMENT',
    sameIds,
    hydro: { stored: ground.stored, drained: basin.drained, flooded: flood.flooded, desertDrier: droughtCmp.desertDrierSoil },
    cryo: { alpineIced: glacierCmp.alpineIced, packed: snowCmp.packed },
    geo: { erupted: volcano.erupted, quake: quake.remembered, sediment: sediment.deposited, layered: horizonCmp.layered },
    atmo: { ozone: ozoneCmp.protects, inversion: tropoCmp.inversion },
    verification: {
      valid,
      traditionalPipeline: false,
      meshIsFoundation: false,
      shaderWater: false,
      shaderIce: false,
      particleLava: false,
      gisCatchment: false,
      nistAssay: false,
      webgpuRequired: false,
      automaticPuter: false,
      completeReality: false,
      instantAaa: false,
      genesisClosed: false,
    },
    limitations: [
      'Aquifer, flood, drought, glacier, volcano, quake, ozone and tropopause execute on one graph',
      'Not NASA Earth, not complete reality, Genesis is not closed',
    ],
  }
}
