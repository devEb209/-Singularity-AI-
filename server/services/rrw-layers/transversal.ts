import type { TransversalId } from './types.js'

export const transversalSystems: { id: TransversalId; name: string; rule: string }[] = [
  { id: 'entity', name: 'Entidades', rule: 'Tudo que existe é representável como entidade' },
  { id: 'property', name: 'Propriedades', rule: 'Toda entidade tem características e estado' },
  { id: 'relation', name: 'Relações', rule: 'Entidades se conectam sem apagar identidade' },
  { id: 'interaction', name: 'Interação', rule: 'Entidades podem afetar outras' },
  { id: 'causality', name: 'Causalidade', rule: 'causa → transformação → consequência' },
  { id: 'time', name: 'Tempo', rule: 'passado, presente, futuro e evolução' },
  { id: 'space', name: 'Espaço', rule: 'posição, escala, distância e topologia' },
  { id: 'energy', name: 'Energia', rule: 'energia e suas transformações' },
  { id: 'information', name: 'Informação', rule: 'estado, conhecimento, memória e dados' },
  { id: 'emergence', name: 'Emergência', rule: 'propriedades complexas surgem das camadas inferiores' },
  { id: 'evolution', name: 'Evolução', rule: 'sistemas mudam ao longo do tempo' },
  { id: 'law', name: 'Regras/leis', rule: 'cada realidade pode ter parâmetros próprios' },
  { id: 'persistence', name: 'Estado persistente', rule: 'o mundo lembra o que aconteceu' },
  { id: 'multiscale', name: 'Multiescala', rule: 'micro → macro → planetário → cósmico' },
  { id: 'resolution', name: 'Resolução dinâmica', rule: 'detalhe aumenta quando necessário; D-O15 não apaga camada' },
  { id: 'visualization', name: 'Visualização', rule: 'construção vira representação visual adaptativa' },
  { id: 'observation', name: 'Observação', rule: 'inspecionar qualquer escala' },
  { id: 'replay', name: 'Reprodução temporal', rule: 'pausar, acelerar, desacelerar, voltar' },
  { id: 'analysis', name: 'Análise', rule: 'inspecionar qualquer entidade/camada' },
  { id: 'integration', name: 'Integração', rule: 'todas as camadas trocam informação' },
]

export const transversalCount = transversalSystems.length
