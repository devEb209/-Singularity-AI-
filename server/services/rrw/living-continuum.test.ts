import { describe, expect, it } from 'vitest'
import { compareHealth } from './health.js'
import { compareKinship } from './kinship.js'
import { compareLabor } from './labor.js'
import { comparePrecipitation } from './precipitation.js'
import { compareScatter } from './scatter.js'
import { compareShare } from './share-world.js'
import { compareSpeech } from './speech-knowledge.js'
import { compareTrade } from './trade.js'

describe('RRW living continuum', () => {
  it('binds kinship without claiming minds', () => {
    const kin = compareKinship()
    expect(kin.bound).toBe(true)
    expect(kin.living).toBeGreaterThan(1)
    expect(kin.consciousnessClaim).toBe(false)
  })

  it('labors cellulose into shelter and conserves the pool', () => {
    const labor = compareLabor()
    expect(labor.worked).toBe(true)
    expect(labor.conserved).toBe(true)
    expect(labor.questLog).toBe(false)
  })

  it('trades glucose between living nodes and conserves moles', () => {
    const trade = compareTrade()
    expect(trade.traded).toBe(true)
    expect(trade.conserved).toBe(true)
    expect(trade.marketplace).toBe(false)
  })

  it('lowers circulatory integrity in alpine winter without diagnosing', () => {
    const health = compareHealth()
    expect(health.alpineCirculatoryLower).toBe(true)
    expect(health.consciousnessClaim).toBe(false)
    expect(health.medicalDiagnosis).toBe(false)
  })

  it('stores speech as knowledge, not TTS', () => {
    const speech = compareSpeech()
    expect(speech.heard).toBe(true)
    expect(speech.animalHeard).toBe(true)
    expect(speech.tts).toBe(false)
    expect(speech.llmVoice).toBe(false)
    expect(speech.seconds).toBeGreaterThan(0)
  })

  it('dims a droplet cloud path without ray tracing', () => {
    const scatter = compareScatter()
    expect(scatter.cloudDimmer).toBe(true)
    expect(scatter.rayTraced).toBe(false)
    expect(scatter.shaderFog).toBe(false)
  })

  it('rains from cloud moles and conserves water', () => {
    const rain = comparePrecipitation()
    expect(rain.rained).toBe(true)
    expect(rain.conserved).toBe(true)
    expect(rain.shaderRain).toBe(false)
  })

  it('shares a world by ACL without WebRTC', () => {
    const share = compareShare()
    expect(share.owner).toBe(true)
    expect(share.peer).toBe(true)
    expect(share.stranger).toBe(false)
    expect(share.webrtc).toBe(false)
  })
})
