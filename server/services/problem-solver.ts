import { id } from '../lib/id.js'
import type { ModelCatalog } from './model-catalog.js'
import { capabilityDomains, type CapabilityDomain } from './universal-capabilities.js'

const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9+]+/g, ' ').trim()
const words = (value: string) => new Set(normalize(value).split(/\s+/).filter(word => word.length > 2))
const keywordMap: Record<string,string[]> = {
  science:['ciencia','cientifico','experimento','hipotese','artigo','descoberta','metodologia'], health:['saude','medico','medicina','exame','paciente','farmaco','doenca','anatomia'], engineering:['engenharia','projeto','mecanico','eletrico','eletronico','civil','aeroespacial','sistema'], mathematics:['matematica','algebra','calculo','equacao','teorema','geometria','estatistica','prova'], physics:['fisica','mecanica','energia','termica','optica','fluido','quantica','particula'], chemistry:['quimica','molecular','molecula','composto','reacao','estequiometria','bioquimica'], biology:['biologia','genetica','ecologia','microbiologia','fisiologia','biodiversidade','populacao'], agriculture:['agricultura','plantio','solo','irrigacao','colheita','cultura','estufa','rural'], fabrication:['fabricar','construir','montar','marcenaria','metalurgia','papelao','sucata','prototipo','maquina'], robotics:['robo','robotica','sensor','atuador','cinematica','navegacao','controlador'], cybersecurity:['ciberseguranca','vulnerabilidade','pentest','malware','ameaca cibernetica','incidente cibernetico','hardening','forense digital'], 'data-science':['dados','dataset','correlacao','clustering','classificacao','dashboard','previsao','anomalia'], education:['educacao','ensinar','aprender','aula','aluno','professor','curriculo','exercicio','tutor'], architecture:['arquitetura','edificio','urbanismo','layout','espaco','ocupacao','cad','construcao'], logistics:['logistica','rota','frota','estoque','suprimento','distribuicao','entrega','armazenamento'], sustainability:['sustentavel','sustentabilidade','reciclagem','desperdicio','agua','ciclo','impacto','residuo'], computing:['computador','pc','hardware','componente','processador','servidor','refrigeracao','sistema operacional'], communication:['comunicacao','traducao','escrita','musica','roteiro','linguagem','audio','narracao'], 'legal-business':['direito','juridico','lei','contrato','jurisprudencia','empresa','negocio','administracao','gestao'],
}

export class UniversalProblemSolver {
  constructor(private catalog: ModelCatalog) {}
  analyze(problem: string) {
    const problemWords = words(problem)
    const ranked = capabilityDomains.map(domain => ({ domain, score: this.domainScore(domain, problemWords) })).filter(item => item.score > 0).sort((a,b) => b.score-a.score)
    const selected = ranked.slice(0, Math.min(6, Math.max(1, ranked.filter(item => item.score >= ranked[0]?.score * .35).length)))
    const unknown = !ranked.length
    const domains = unknown ? [] : selected.map(({domain,score}) => ({ id:domain.id,name:domain.name,safety:domain.safety,confidence:Math.min(.98,.35+score*.09),capabilities:this.matchCapabilities(domain,problemWords) }))
    const notices = [...new Set(domains.flatMap(item => this.safetyNotice(item.safety)))]
    const stages = this.stages(domains.map(item => item.id), unknown)
    const graphId = id('problem')
    return {
      graphId, problem, classification: unknown ? 'domain-discovery-required' : domains.length > 1 ? 'multidisciplinary' : 'single-domain', domains,
      domainDiscovery: unknown ? { required:true, proposedProfile:{ name:`Domain Profile: ${problem.slice(0,80)}`, seedTerms:[...problemWords].slice(0,20), status:'unverified' }, next:['Decompor problema','Identificar conhecimentos necessários','Compor especialistas existentes','Criar benchmarks','Registrar apenas após validação'] } : { required:false },
      taskGraph:{ nodes:stages,edges:stages.flatMap(stage=>stage.dependsOn.map(from=>({from,to:stage.id}))) }, safety:notices,
      modelPolicy:{ catalog:this.catalog.summary(), rule:'Todos os modelos permanecem no universo de avaliação; somente modelos avaliados para a capacidade entram no pool de execução.', inventedModels:false },
    }
  }
  private domainScore(domain:CapabilityDomain,problemWords:Set<string>){const direct=(keywordMap[domain.id]??[]).filter(keyword=>problemWords.has(normalize(keyword))).length*3;const names=words(`${domain.name} ${domain.capabilities.map(item=>item.name).join(' ')}`);const overlap=[...problemWords].filter(word=>names.has(word)).length;return direct+overlap}
  private matchCapabilities(domain:CapabilityDomain,problemWords:Set<string>){const scored=domain.capabilities.map(capability=>({capability,score:[...problemWords].filter(word=>words(capability.name).has(word)).length})).sort((a,b)=>b.score-a.score);const selected=scored.filter(item=>item.score>0).slice(0,6).map(item=>item.capability);return selected.length?selected:[domain.capabilities[0]]}
  private safetyNotice(safety:CapabilityDomain['safety']){if(safety==='high-stakes-informational')return ['Informação educacional: exige fontes, incerteza explícita e revisão profissional para decisões de alto impacto.'];if(safety==='authorized-only')return ['Operações de segurança somente em ambientes próprios ou explicitamente autorizados.'];if(safety==='safety-review')return ['Projetos físicos, químicos, biológicos ou de engenharia exigem análise de riscos e validação humana antes da execução.'];return []}
  private stages(domainIds:string[],unknown:boolean){const templates=[['understand','Interpretar objetivo e restrições','planning',[]],['research','Reunir evidências e contexto','research',['understand']],['model','Construir modelo do problema','reasoning',['research']],['simulate','Simular alternativas e riscos','simulation',['model']],['design','Projetar solução verificável','planning',['simulate']],['execute','Executar em ambiente autorizado','execution',['design']],['verify','Testar, revisar e verificar','verification',['execute']],['deliver','Entregar resultado, evidências e limitações','delivery',['verify']]] as const;return templates.map(([key,title,kind,dependsOn])=>({id:key,key,title,kind,dependsOn:[...dependsOn],domainIds,requiresHumanApproval:key==='execute'&&(unknown||domainIds.some(item=>['health','chemistry','fabrication','robotics','cybersecurity','architecture'].includes(item))) }))}
}
