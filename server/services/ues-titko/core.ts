import { DThesisCore } from '../d-thesis/core.js'
import { energyCheck, heightNormal } from './brdf.js'
import { bitmapBytes, materials, storedBytes } from './graph.js'
import { compileMaterialPrompt, modulateEnvironment } from './pbr.js'
import { budgetedResolution, samplePatch } from './sample.js'

export class UesTitkoCore {
  private thesis = new DThesisCore()

  process(tier: 'low' | 'balanced' | 'high' = 'balanced', prompt = 'granito molhado') {
    const material = materials[0]
    const coarse = samplePatch(material, 8, 2)
    const fine = samplePatch(material, budgetedResolution(tier), 5)
    const stored = storedBytes(material)
    const virtual = bitmapBytes(material.virtualK)
    const dry = compileMaterialPrompt(prompt.replace(/molhad\w*/g, '').trim() || 'granito')
    const wet = compileMaterialPrompt(prompt)
    const env = modulateEnvironment(wet, 0.1, 280)
    const energy = energyCheck(env.layers)
    const normal = heightNormal((u, v) => Math.sin(u * 12) * Math.cos(v * 9) * env.layers.heightAmp, 0.4, 0.35)
    const dThesis = this.thesis.evaluate({
      objective: 'Representar qualquer material pedido como grafo físico reconstruível, não bitmap 16K',
      constraints: ['não armazenar 16K/32K', 'D-O15 escolhe resolução de amostra', 'realismo não é fotografia obrigatória'],
      resources: ['PBR layers', 'GGX', 'funções', 'CPU'],
      priorities: { quality: 9, performance: 9, safety: 8, cost: 4, scalability: 8 },
    })
    return {
      format: 'ues-titko-v1',
      material: { id: material.id, virtualK: material.virtualK },
      pbr: { id: env.id, class: env.class, wetness: env.layers.wetness, roughness: env.layers.roughness, dryRoughness: dry.layers.roughness },
      stored,
      virtualBitmapBytes: virtual,
      coarse,
      fine,
      ratio: Number((virtual / stored).toFixed(1)),
      brdf: energy,
      normal,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score },
      verification: {
        valid: stored < 400 && virtual > 1e8 && fine.gradient > coarse.gradient && fine.pixels > coarse.pixels && energy.conserved && env.layers.wetness > dry.layers.wetness,
        storedBitmap16k: false,
        gpu: false,
      },
      limitations: ['Procedural PBR material graph', 'Virtual K is reconstruction target, not a stored texture'],
    }
  }
}
