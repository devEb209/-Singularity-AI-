import { DThesisCore } from '../d-thesis/core.js'
import { bitmapBytes, materials, storedBytes } from './graph.js'
import { budgetedResolution, samplePatch } from './sample.js'

export class UesTitkoCore {
  private thesis = new DThesisCore()

  process(tier: 'low' | 'balanced' | 'high' = 'balanced') {
    const material = materials[0]
    const coarse = samplePatch(material, 8, 2)
    const fine = samplePatch(material, budgetedResolution(tier), 5)
    const stored = storedBytes(material)
    const virtual = bitmapBytes(material.virtualK)
    const dThesis = this.thesis.evaluate({
      objective: 'Representar material de alta fidelidade como grafo reconstruível, não bitmap 16K',
      constraints: ['não armazenar 16K/32K', 'D-O15 escolhe resolução de amostra'],
      resources: ['funções', 'CPU'],
      priorities: { quality: 9, performance: 9, safety: 8, cost: 4, scalability: 8 },
    })
    return {
      format: 'ues-titko-v1',
      material: { id: material.id, virtualK: material.virtualK },
      stored,
      virtualBitmapBytes: virtual,
      coarse,
      fine,
      ratio: Number((virtual / stored).toFixed(1)),
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: stored < 400 && virtual > 1e8 && fine.gradient > coarse.gradient && fine.pixels > coarse.pixels,
        storedBitmap16k: false,
        gpu: false,
      },
      limitations: ['Procedural material graph', 'Virtual K is reconstruction target, not a stored texture'],
    }
  }
}
