import { DThesisCore } from '../d-thesis/core.js'
import { runBio } from '../rrw/bio-run.js'
import { runKernel } from '../ues-kernel/pipeline.js'

export class RrwBioCore {
  private thesis = new DThesisCore()

  process(prompt = 'oceano salgado com fogo, floresta, um humano e um abrigo') {
    const bio = runBio(prompt)
    const kernel = runKernel('Aprofundar a biosfera RRW sem copiar sim de vida de jogo', 'rrw.bio', ['rrw', 'represent'], [
      { module: 'knowledge', accepted: bio.albedo.snowBrighter && !bio.albedo.pbr, note: 'brightness is spectral, not PBR' },
      { module: 'd-thesis', accepted: !bio.verification.uniqueFullMinds, note: 'no consciousness' },
      { module: 'genesis', accepted: bio.verification.valid && !bio.verification.genesisClosed, note: 'deeper, not closed' },
      { module: 'represent', accepted: bio.reef.built && !bio.verification.meshIsFoundation, note: 'reef is carbonate' },
      { module: 'd-o15', accepted: bio.carrying.noFixedCap, note: 'needed × representation' },
      { module: 'execute', accepted: bio.web.conserved && bio.motion.migrated && bio.motion.rested, note: 'web and rest execute' },
      { module: 'verify', accepted: !bio.verification.traditionalPipeline && !bio.verification.medicalDiagnosis, note: 'not a renamed engine' },
      { module: 'refine', accepted: bio.load.weaker && !bio.verification.completeReality, note: 'honest open Genesis' },
    ])
    const dThesis = this.thesis.evaluate({
      objective: 'Aprofundar a biosfera conhecida no RRW sem fingir mentes ou medicina',
      constraints: ['sem consciência', 'sem diagnóstico médico', 'sem fechar Gênesis no papel'],
      resources: ['trophic', 'succession', 'sleep', 'reef'],
      priorities: { quality: 9, performance: 7, safety: 9, cost: 3, scalability: 9 },
    })
    return {
      ...bio,
      kernel,
      dThesis: { selected: dThesis.selectedDs.map(item => item.key), gpp: dThesis.gpp.score, absolutePerfectionClaim: false },
      verification: { ...bio.verification, valid: kernel.verification.valid && bio.verification.valid },
    }
  }
}
