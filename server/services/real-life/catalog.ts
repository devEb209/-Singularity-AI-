import type { DomainCategory, RealityDomain } from './types.js'
import type { DKey } from '../d-thesis/types.js'

const ds = (...keys: DKey[]): DKey[] => keys

const domain = (
  id: string,
  name: string,
  category: DomainCategory,
  purpose: string,
  principles: string[],
  relations: string[],
  applicableDs: DKey[],
): RealityDomain => ({
  id,
  name,
  category,
  purpose,
  principles,
  relations,
  applicableDs,
  closed: false,
  seeded: true,
})

export const seedDomains: RealityDomain[] = [
  domain('physics', 'Física', 'natural-science', 'Movimento, energia, forças e invariantes', ['conservação de energia quando declarada', 'causalidade local', 'inércia'], ['chemistry', 'materials', 'control', 'optics'], ds('D3', 'D8', 'D10', 'D11', 'D12')),
  domain('chemistry', 'Química', 'natural-science', 'Reações, ligações e transformação de matéria', ['estequiometria', 'estados da matéria', 'equilíbrio químico'], ['physics', 'biology', 'materials', 'thermodynamics'], ds('D3', 'D4', 'D11', 'D12')),
  domain('biology', 'Biologia', 'natural-science', 'Organismos, anatomia e processos vitais', ['homeostase', 'adaptação', 'limites fisiológicos'], ['ecology', 'psychology', 'materials', 'growth'], ds('D3', 'D8', 'D9', 'D13', 'D14')),
  domain('astronomy', 'Astronomia', 'natural-science', 'Corpos celestes, órbitas e escala cósmica', ['gravidade em grande escala', 'ciclos orbitais'], ['physics', 'climatology'], ds('D3', 'D10', 'D11')),
  domain('geology', 'Geologia', 'natural-science', 'Formação e transformação do solo e relevo', ['estratificação', 'erosão', 'tempo geológico'], ['erosion', 'climate', 'civil'], ds('D3', 'D10', 'D14')),
  domain('meteorology', 'Meteorologia', 'natural-science', 'Tempo de curto prazo', ['gradientes de pressão', 'umidade', 'frente atmosférica'], ['climatology', 'atmosphere', 'optics'], ds('D3', 'D8', 'D11')),
  domain('climatology', 'Climatologia', 'natural-science', 'Padrões climáticos de longo prazo', ['balanços energéticos', 'sazonalidade'], ['meteorology', 'ecology', 'oceanography'], ds('D3', 'D10', 'D14')),
  domain('oceanography', 'Oceanografia', 'natural-science', 'Oceanos, correntes e ciclos hídricos', ['densidade da água', 'correntes', 'salinidade'], ['climatology', 'ecology'], ds('D3', 'D8', 'D11')),
  domain('ecology', 'Ecologia', 'natural-science', 'Relações entre espécies e ambiente', ['capacidade de suporte', 'redes tróficas', 'retroalimentação'], ['biology', 'food-chains', 'climate'], ds('D3', 'D7', 'D8', 'D9')),
  domain('optics', 'Óptica', 'natural-science', 'Propagação e interação da luz', ['reflexão', 'refração', 'absorção', 'espalhamento'], ['physics', 'perception', 'materials'], ds('D3', 'D11', 'D12')),
  domain('acoustics', 'Acústica', 'natural-science', 'Som, propagação e percepção auditiva', ['atenção por distância', 'absorção de material', 'doppler'], ['physics', 'perception'], ds('D3', 'D8', 'D11')),
  domain('thermodynamics', 'Termodinâmica', 'natural-science', 'Calor, trabalho e entropia', ['energia não se cria do nada se conservação vale', 'fluxo do quente para o frio'], ['physics', 'chemistry', 'climate'], ds('D3', 'D10', 'D12')),
  domain('electromagnetism', 'Eletromagnetismo', 'natural-science', 'Campos elétricos e magnéticos', ['carga', 'indução', 'interferência'], ['physics', 'electrical', 'optics'], ds('D3', 'D11', 'D12')),
  domain('psychology', 'Psicologia', 'human-behavior', 'Motivação, emoção simulada e decisão individual', ['estado interno precede ação', 'viés de percepção', 'hábitos'], ['neuroscience', 'cognition', 'sociology'], ds('D1', 'D2', 'D8', 'D13')),
  domain('neuroscience', 'Neurociência', 'human-behavior', 'Limites de atenção, memória e fadiga', ['atenção limitada', 'consolidação de memória', 'carga cognitiva'], ['psychology', 'cognition'], ds('D3', 'D8', 'D13')),
  domain('sociology', 'Sociologia', 'human-behavior', 'Grupos, normas e instituições', ['norma emergente', 'status', 'papel social'], ['economics', 'collective-behavior', 'anthropology'], ds('D7', 'D8', 'D9')),
  domain('anthropology', 'Antropologia', 'human-behavior', 'Cultura, rito e variação humana', ['prática cultural', 'transmissão', 'significado compartilhado'], ['sociology', 'linguistics'], ds('D2', 'D3', 'D14')),
  domain('economics', 'Economia', 'human-behavior', 'Escassez, troca e incentivos', ['escassez', 'custo de oportunidade', 'incentivo altera comportamento'], ['logistics', 'organizations', 'cities'], ds('D2', 'D4', 'D8', 'D10')),
  domain('linguistics', 'Linguística', 'human-behavior', 'Língua, significado e comunicação', ['contexto altera sentido', 'registro', 'assimetría de vocabulário'], ['cognition', 'sociology'], ds('D1', 'D2', 'D8')),
  domain('collective-behavior', 'Comportamento coletivo', 'human-behavior', 'Multidões, rumores e imitação', ['contágio social', 'limiar de participação', 'informação incompleta'], ['sociology', 'psychology'], ds('D8', 'D9', 'D10')),
  domain('perception', 'Percepção humana', 'human-behavior', 'O que é notado, ignorado ou distorcido', ['saliência', 'máscara por distância', 'constância perceptual'], ['optics', 'acoustics', 'cognition'], ds('D2', 'D8', 'D12')),
  domain('cognition', 'Cognição', 'human-behavior', 'Raciocínio limitado, planejamento e erro', ['racionalidade limitada', 'modelo mental incompleto'], ['psychology', 'neuroscience'], ds('D1', 'D5', 'D10')),
  domain('mechanical', 'Engenharia mecânica', 'engineering', 'Mecanismos, cargas e falha estrutural', ['tensão/deformação', 'folga', 'modo de falha'], ['materials', 'control', 'physics'], ds('D4', 'D10', 'D12')),
  domain('civil', 'Engenharia civil', 'engineering', 'Infraestrutura, edificações e solo', ['carga permanente', 'drenagem', 'segurança estrutural'], ['architecture', 'geology', 'cities'], ds('D4', 'D7', 'D12')),
  domain('electrical', 'Engenharia elétrica', 'engineering', 'Circuitos, potência e sinal', ['continuidade', 'queda de tensão', 'isolamento'], ['electromagnetism', 'control'], ds('D4', 'D11', 'D12')),
  domain('computing', 'Computação', 'engineering', 'Algoritmos, estado e complexidade', ['determinismo do programa', 'custo computacional', 'falha de estado'], ['systems', 'control'], ds('D4', 'D6', 'D12', 'D13')),
  domain('robotics', 'Robótica', 'engineering', 'Sensores, atuadores e controle', ['latência de malha', 'incerteza sensorial'], ['control', 'mechanical', 'cognition'], ds('D8', 'D11', 'D13')),
  domain('architecture', 'Arquitetura', 'engineering', 'Espaço, fluxo e habitabilidade', ['circulação', 'luz natural', 'escala humana'], ['civil', 'cities', 'perception'], ds('D2', 'D5', 'D7')),
  domain('systems', 'Sistemas', 'engineering', 'Interfaces, dependências e falhas compostas', ['acoplamento', 'retroalimentação', 'ponto único de falha'], ['computing', 'control', 'organizations'], ds('D4', 'D7', 'D10', 'D15')),
  domain('telecom', 'Telecomunicações', 'engineering', 'Redes, latência e perda de pacote', ['largura de banda', 'latência', 'perda'], ['systems', 'computing'], ds('D2', 'D10', 'D13')),
  domain('materials', 'Materiais', 'engineering', 'Propriedades e falha de matéria', ['dureza', 'elasticidade', 'fadiga'], ['chemistry', 'mechanical', 'physics'], ds('D3', 'D11', 'D12')),
  domain('control', 'Controle', 'engineering', 'Regulação de sistemas dinâmicos', ['erro residual', 'estabilidade', 'saturação'], ['systems', 'robotics'], ds('D8', 'D10', 'D13')),
  domain('climate', 'Clima como sistema', 'natural-system', 'Interdependência climática de um mundo', ['acoplamento atmosfera-água-solo', 'inércia térmica'], ['meteorology', 'ecology', 'water'], ds('D7', 'D8', 'D9')),
  domain('ecosystems', 'Ecossistemas', 'natural-system', 'Comunidades e fluxos de energia', ['produtores/consumidores', 'resiliência'], ['ecology', 'food-chains'], ds('D7', 'D9', 'D14')),
  domain('food-chains', 'Cadeias alimentares', 'natural-system', 'Transferência de energia entre espécies', ['perda trófica', 'cascata'], ['ecology', 'biology'], ds('D4', 'D8', 'D9')),
  domain('natural-cycles', 'Ciclos naturais', 'natural-system', 'Água, carbono e nutrientes', ['fechamento aproximado de ciclo', 'acúmulo'], ['climate', 'ecology'], ds('D8', 'D14')),
  domain('erosion', 'Erosão', 'natural-system', 'Desgaste de solo e forma de terreno', ['água + declive + cobertura vegetal'], ['geology', 'climate'], ds('D8', 'D10', 'D14')),
  domain('growth', 'Crescimento', 'natural-system', 'Crescimento biológico e urbano limitado', ['saturação', 'recurso limitante'], ['biology', 'cities'], ds('D8', 'D14')),
  domain('aging', 'Envelhecimento', 'natural-system', 'Degradação e experiência acumulada', ['desgaste', 'memória de uso'], ['biology', 'materials'], ds('D13', 'D14')),
  domain('environment-formation', 'Formação de ambientes', 'natural-system', 'Como um bioma se organiza', ['sucessão', 'nicho'], ['ecology', 'climate'], ds('D6', 'D7', 'D9')),
  domain('species-interaction', 'Interação entre espécies', 'natural-system', 'Cooperação, predação e competição', ['nicho sobreposto', 'mutualismo'], ['ecology', 'biology'], ds('D8', 'D9')),
  domain('cities', 'Cidades', 'artificial-system', 'Uso do solo, densidade e serviços', ['acesso', 'congestionamento', 'zoneamento'], ['transport', 'infrastructure', 'economics'], ds('D4', 'D7', 'D9')),
  domain('transport', 'Transportes', 'artificial-system', 'Fluxos, rotas e gargalos', ['capacidade', 'tempo de viagem'], ['cities', 'logistics'], ds('D4', 'D8', 'D10')),
  domain('infrastructure', 'Infraestrutura', 'artificial-system', 'Redes essenciais e falha em cascata', ['redundância', 'ponto de falha'], ['cities', 'systems'], ds('D7', 'D10', 'D12')),
  domain('networks', 'Redes', 'artificial-system', 'Grafos de conexão e contagio', ['grau', 'caminho mínimo', 'comunidades'], ['telecom', 'collective-behavior'], ds('D4', 'D9', 'D10')),
  domain('industry', 'Indústria', 'artificial-system', 'Produção, estoque e falha de processo', ['gargalo', 'setup', 'qualidade'], ['logistics', 'economics'], ds('D4', 'D6', 'D12')),
  domain('logistics', 'Logística', 'artificial-system', 'Movimentação de bens e informação', ['lead time', 'estoque', 'rota'], ['transport', 'economics'], ds('D4', 'D10', 'D15')),
  domain('machines', 'Máquinas', 'artificial-system', 'Estados operacionais e manutenção', ['desgaste', 'modo de operação'], ['mechanical', 'control'], ds('D8', 'D13', 'D14')),
  domain('organizations', 'Organizações', 'artificial-system', 'Papéis, incentivos e decisão coletiva', ['hierarquia', 'informação assimétrica'], ['economics', 'sociology'], ds('D2', 'D8', 'D9')),
]

export const isValidDomainId = (value: string) => /^[a-z0-9][a-z0-9-]{1,62}$/.test(value)

export const normalizeDomainInput = (input: Omit<RealityDomain, 'closed' | 'seeded'>): RealityDomain => {
  if (!isValidDomainId(input.id)) throw new Error('Domain id must be a lowercase slug.')
  if (!input.principles.length) throw new Error('A domain must declare at least one principle.')
  return { ...input, closed: false, seeded: false }
}

export class DomainCatalog {
  private extras: RealityDomain[] = []
  list() {
    return [...seedDomains, ...this.extras]
  }
  get(id: string) {
    return this.list().find(item => item.id === id)
  }
  register(input: Omit<RealityDomain, 'closed' | 'seeded'>) {
    const domainValue = normalizeDomainInput(input)
    if (this.get(domainValue.id)) throw new Error(`Domain ${domainValue.id} already exists.`)
    this.extras.push(domainValue)
    return domainValue
  }
  closedList() {
    return false
  }
  match(text: string) {
    const hay = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return this.list()
      .map(item => {
        const tokens = [item.id, item.name, item.purpose, ...item.principles, ...item.relations].join(' ').toLowerCase()
        const score = tokens.split(/\W+/).filter(token => token.length > 3 && hay.includes(token)).length
        return { item, score }
      })
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score)
  }
}
