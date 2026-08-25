import { generationLedger, scoreOf } from './ledger.js'

export const generationScore = () => {
  const totalWeight = generationLedger.reduce((sum, item) => sum + item.weight, 0)
  const earned = generationLedger.reduce((sum, item) => sum + item.weight * scoreOf(item.state), 0)
  const percent = Math.round((earned / totalWeight) * 1000) / 10
  const byAxis = Object.fromEntries(
    [...new Set(generationLedger.map(item => item.axis))].map(axis => {
      const items = generationLedger.filter(item => item.axis === axis)
      const w = items.reduce((sum, item) => sum + item.weight, 0)
      const e = items.reduce((sum, item) => sum + item.weight * scoreOf(item.state), 0)
      return [axis, { percent: Math.round((e / w) * 1000) / 10, items: items.length }]
    }),
  )
  return {
    format: 'snb-v1-first-generation-score-v1' as const,
    rule: 'V1 is the first generation and must compete when launched. V2 aims to surpass.',
    reducedFinal: false,
    competeBar: true,
    percent,
    remaining: Number((100 - percent).toFixed(1)),
    complete: false,
    byAxis,
    counts: {
      OPERATIONAL: generationLedger.filter(item => item.state === 'OPERATIONAL').length,
      PARTIAL: generationLedger.filter(item => item.state === 'PARTIAL').length,
      ADAPTER: generationLedger.filter(item => item.state === 'ADAPTER').length,
      MISSING: generationLedger.filter(item => item.state === 'MISSING').length,
    },
    dsosInCompeteBar: false,
    automaticPuter: false,
    nasa: false,
    storedBitmap16k: false,
  }
}
