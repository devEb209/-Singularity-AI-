export type GenerationState = 'OPERATIONAL' | 'PARTIAL' | 'ADAPTER' | 'MISSING'

export interface GenerationItem {
  id: string
  axis: 'intelligence' | 'trust' | 'creation' | 'world' | 'shipping'
  name: string
  state: GenerationState
  weight: number
  note: string
}

export const generationLedger: GenerationItem[] = [
  { id: 'intel.master', axis: 'intelligence', name: 'Master Intelligence 30 programas (escopo implementado)', state: 'OPERATIONAL', weight: 6, note: 'Compila missão/DAG; não executa todos os especialistas sozinha' },
  { id: 'intel.handoff', axis: 'intelligence', name: 'Handoff/critic/correção com recibo', state: 'OPERATIONAL', weight: 5, note: 'Client-reported Puter; invocação automática permanece' },
  { id: 'intel.rollback', axis: 'intelligence', name: 'Regressão e rollback de artifact', state: 'OPERATIONAL', weight: 5, note: 'Métrica + restore da versão verificada' },
  { id: 'intel.puter-auto', axis: 'intelligence', name: 'Invocação automática de especialistas Puter', state: 'PARTIAL', weight: 6, note: 'Orchestrator dispara internos; tickets Puter canônicos ficam pending-client' },
  { id: 'intel.consensus', axis: 'intelligence', name: 'Consenso multi-round e recibo de integração', state: 'OPERATIONAL', weight: 6, note: 'Maioria multi-round + HMAC; client-reported, sem auto-Puter' },
  { id: 'trust.auth', axis: 'trust', name: 'Auth, audit, receipts, sandbox', state: 'OPERATIONAL', weight: 5, note: 'Local Beta operacional' },
  { id: 'trust.verify', axis: 'trust', name: 'Verification ≠ confiança do modelo', state: 'OPERATIONAL', weight: 4, note: 'Contrato de confiança honesto' },
  { id: 'trust.product', axis: 'trust', name: 'Produto, billing, conta pública', state: 'MISSING', weight: 4, note: 'Billing é última feature; não compete como SaaS ainda' },
  { id: 'trust.scale-ops', axis: 'trust', name: 'Operação pública em escala', state: 'MISSING', weight: 5, note: 'Local/self-host existe; operação de geração 1 ainda não' },
  { id: 'create.pipeline', axis: 'creation', name: 'Pipeline 3D/PBR/cena/WebGL próprio', state: 'OPERATIONAL', weight: 6, note: 'Porta de compatibilidade; fundação é RRW, não mesh/PBR' },
  { id: 'create.corpus', axis: 'creation', name: 'Corpus semântico + críticos', state: 'OPERATIONAL', weight: 6, note: '9 kinds + compilador aberto + críticos; scans de especialista ficam no 3D arbitrário' },
  { id: 'create.motion', axis: 'creation', name: 'Animação estruturada + Explorer', state: 'PARTIAL', weight: 5, note: 'Compiler biomecânico + cards; visão/vídeo adapter' },
  { id: 'create.material', axis: 'creation', name: 'TITKO PBR por pedido', state: 'OPERATIONAL', weight: 5, note: 'Porta de compatibilidade; matéria fundamental é substância RRW' },
  { id: 'create.editor', axis: 'creation', name: 'Editor de produção completo', state: 'PARTIAL', weight: 8, note: 'Viewport/gizmo/prefab/timeline no servidor; não é Unreal' },
  { id: 'create.arbitrary-3d', axis: 'creation', name: 'Geometria 3D arbitrária a partir do pedido', state: 'PARTIAL', weight: 8, note: 'Silhueta/simetria/loft/CSG + heightfield; visão aprendida adapter' },
  { id: 'create.audiovisual', axis: 'creation', name: 'Geração audiovisual de produção', state: 'ADAPTER', weight: 7, note: 'PCM/HSDS existem; vídeo/visão adapter' },
  { id: 'world.planet', axis: 'world', name: 'Mundo/planeta/água/cidade internos', state: 'OPERATIONAL', weight: 6, note: 'Regras + fixture; não Terra NASA' },
  { id: 'world.physics', axis: 'world', name: 'Física determinística CPU', state: 'OPERATIONAL', weight: 6, note: 'GJK/EPA, CCD analítico, Featherstone CRBA/RNEA planar; não PhysX' },
  { id: 'world.society', axis: 'world', name: 'Sociedade NMN', state: 'PARTIAL', weight: 4, note: 'D-O15 por necessidade×representação; sem teto conceitual 320/1e6' },
  { id: 'world.rrw', axis: 'world', name: 'RRW — representação da realidade', state: 'PARTIAL', weight: 8, note: 'Matéria/espectro/gravidade/acústica/evolução/observador/D-O15 executam; não é realidade completa nem Unreal.' },
  { id: 'world.live-earth', axis: 'world', name: 'Terra fotogramétrica live', state: 'ADAPTER', weight: 4, note: 'HLOD próprio; dataset live adapter' },
  { id: 'ship.runtime', axis: 'shipping', name: 'Runtime UES + HSDS SVG', state: 'OPERATIONAL', weight: 5, note: 'Leve; GPU/WebRTC adapter' },
  { id: 'ship.package', axis: 'shipping', name: 'Release packager + quality gates', state: 'OPERATIONAL', weight: 4, note: 'Só artifacts verificados' },
  { id: 'ship.gpu', axis: 'shipping', name: 'Renderer GPU / shaders / SPH', state: 'PARTIAL', weight: 6, note: 'Raster/PBR são porta de compatibilidade; RRW é a arquitetura. Backends de hardware ampliam materialização.' },
  { id: 'ship.multiplayer', axis: 'shipping', name: 'Multiplayer conectado', state: 'ADAPTER', weight: 5, note: 'Simulação autoritativa existe; WebRTC/UDP externo' },
  { id: 'ship.platforms', axis: 'shipping', name: 'Ship desktop/mobile/console', state: 'PARTIAL', weight: 6, note: 'Web/HSDS real; stores/consoles não' },
]

export const scoreOf = (state: GenerationState) => (state === 'OPERATIONAL' ? 1 : state === 'PARTIAL' ? 0.5 : state === 'ADAPTER' ? 0.15 : 0)
