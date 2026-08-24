export type LedgerStatus = 'IMPLEMENTADO' | 'ADAPTER DISPONÍVEL' | 'DEPENDÊNCIA EXTERNA' | 'PLANEJADO' | 'NÃO IMPLEMENTADO'

export interface LedgerEntry {
  id: string
  name: string
  status: LedgerStatus
  machine: 'IMPLEMENTED' | 'ADAPTER_AVAILABLE' | 'EXTERNAL_DEPENDENCY' | 'PLANNED' | 'NOT_IMPLEMENTED'
  note: string
}

export const realisLedger: LedgerEntry[] = [
  { id: 'gis.internal', name: 'Ingestão espacial interna licenciada', status: 'IMPLEMENTADO', machine: 'IMPLEMENTED', note: 'Fixture CC0 → normalização → conhecimento 3D' },
  { id: 'gis.ogc', name: 'Contrato OGC 3D Tiles', status: 'ADAPTER DISPONÍVEL', machine: 'ADAPTER_AVAILABLE', note: 'Parser/HLOD próprio; dataset live não baixado' },
  { id: 'gis.google', name: 'Google Photorealistic 3D Tiles', status: 'ADAPTER DISPONÍVEL', machine: 'ADAPTER_AVAILABLE', note: 'Requer chave e termos do fornecedor' },
  { id: 'gis.cesium', name: 'Cesium Native / ion', status: 'ADAPTER DISPONÍVEL', machine: 'ADAPTER_AVAILABLE', note: 'UES não depende de Cesium' },
  { id: 'gis.nasa', name: 'NASA Earthdata live', status: 'ADAPTER DISPONÍVEL', machine: 'ADAPTER_AVAILABLE', note: 'Não há fetch NASA na V1' },
  { id: 'gis.usgs', name: 'USGS / OpenTopography live', status: 'ADAPTER DISPONÍVEL', machine: 'ADAPTER_AVAILABLE', note: 'Somente contrato + política de licença' },
  { id: 'tiles.hlod', name: 'HLOD 3D Tiles próprio', status: 'IMPLEMENTADO', machine: 'IMPLEMENTED', note: 'Árvore, SSE, frustum, cache, ENU' },
  { id: 'tiles.live', name: 'Tileset fotogramétrico live', status: 'DEPENDÊNCIA EXTERNA', machine: 'EXTERNAL_DEPENDENCY', note: 'Endpoint autenticado do fornecedor' },
  { id: 'scale.ladder', name: 'Continuidade espaço→objeto', status: 'IMPLEMENTADO', machine: 'IMPLEMENTED', note: 'Troca de representação com token ECEF' },
  { id: 'fnws.heightfield', name: 'FNWS heightfield', status: 'IMPLEMENTADO', machine: 'IMPLEMENTED', note: 'Aceita camadas internas/fixture' },
  { id: 'fnws.sph', name: 'SPH/GPU oceans', status: 'ADAPTER DISPONÍVEL', machine: 'ADAPTER_AVAILABLE', note: 'Interface pronta, solver ausente' },
  { id: 'titko.pbr', name: 'TITKO PBR por pedido', status: 'IMPLEMENTADO', machine: 'IMPLEMENTED', note: 'Grafo físico, não bitmap 16K' },
  { id: 'titko.bitmap16k', name: 'Bitmap 16K/32K armazenado', status: 'NÃO IMPLEMENTADO', machine: 'NOT_IMPLEMENTED', note: 'Propositadamente não alocado' },
  { id: 'umotion.cards', name: 'Cartões de movimento estruturados', status: 'IMPLEMENTADO', machine: 'IMPLEMENTED', note: 'Apply no Explorer Manager' },
  { id: 'umotion.video', name: 'Análise de vídeo', status: 'ADAPTER DISPONÍVEL', machine: 'ADAPTER_AVAILABLE', note: 'Visão Puter não executada aqui' },
  { id: 'synthesis.genres', name: 'Síntese Terra/alternativo/alien/fantasia', status: 'IMPLEMENTADO', machine: 'IMPLEMENTED', note: 'Mutação de regras, não só ruído' },
  { id: 'astro.sample', name: 'Catálogo Kepler + céu amostral', status: 'IMPLEMENTADO', machine: 'IMPLEMENTED', note: 'Não é o universo observável completo' },
  { id: 'astro.horizons', name: 'NASA Horizons / SIMBAD', status: 'ADAPTER DISPONÍVEL', machine: 'ADAPTER_AVAILABLE', note: 'Sem fetch remoto' },
  { id: 'nav.planet', name: 'Navmesh de heightfield planetário', status: 'IMPLEMENTADO', machine: 'IMPLEMENTED', note: 'Não é Recast' },
  { id: 'ik.ccd', name: 'CCD cinemático iterativo', status: 'IMPLEMENTADO', machine: 'IMPLEMENTED', note: 'Não é Featherstone' },
  { id: 'city.persist', name: 'Identidades urbanas após troca de região', status: 'IMPLEMENTADO', machine: 'IMPLEMENTED', note: 'Amostra 96, não milhões' },
]
