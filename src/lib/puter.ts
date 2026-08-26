const PUTER_SCRIPT = 'https://js.puter.com/v2/'

type PuterModel = {
  id: string
  provider: string
  name?: string
  aliases?: string[]
  context?: number
  max_tokens?: number
  cost?: { input?: number; output?: number; [key: string]: unknown }
  [key: string]: unknown
}
type PuterChatOptions = { model: string; provider?: string; stream?: boolean; [key: string]: unknown }
type PuterApi = {
  ai: { listModels(provider?: string | null): Promise<PuterModel[]>; listModelProviders(): Promise<string[]>; chat(messages: unknown, options: PuterChatOptions): Promise<unknown> }
  auth: { signIn(): Promise<unknown>; signOut(): Promise<void>; isSignedIn(): boolean; getUser(): Promise<unknown> }
}
declare global { interface Window { puter?: PuterApi } }

class PuterGateway {
  private loading?: Promise<PuterApi>
  private catalog = new Map<string, PuterModel>()

  async load() {
    if (window.puter) return window.puter
    if (this.loading) return this.loading
    this.loading = new Promise<PuterApi>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${PUTER_SCRIPT}"]`)
      const script = existing ?? Object.assign(document.createElement('script'), { src: PUTER_SCRIPT, async: true })
      const ready = () => window.puter ? resolve(window.puter) : reject(new Error('Puter.js carregou sem expor a API oficial.'))
      script.addEventListener('load', ready, { once: true }); script.addEventListener('error', () => reject(new Error('Não foi possível carregar Puter.js.')), { once: true })
      if (!existing) document.head.appendChild(script)
    })
    return this.loading
  }

  async signIn() { const puter = await this.load(); await puter.auth.signIn(); return puter.auth.getUser() }
  async signOut() { const puter = await this.load(); await puter.auth.signOut(); this.catalog.clear() }
  async user() { const puter = await this.load(); return puter.auth.isSignedIn() ? puter.auth.getUser() : null }

  async discover(provider?: string) {
    const puter = await this.load()
    const models = await puter.ai.listModels(provider ?? null)
    this.catalog.clear()
    for (const raw of models) {
      if (!raw || typeof raw.id !== 'string' || typeof raw.provider !== 'string' || !raw.id.trim() || !raw.provider.trim()) continue
      const model = structuredClone(raw)
      this.catalog.set(this.key(model.provider, model.id), model)
    }
    return [...this.catalog.values()]
  }

  async providers() { return (await this.load()).ai.listModelProviders() }

  async chat(provider: string, modelId: string, messages: unknown, options: Omit<PuterChatOptions, 'model' | 'provider'> = {}) {
    const key = this.key(provider, modelId)
    if (!this.catalog.size) await this.discover()
    const model = this.catalog.get(key)
    if (!model) throw new Error('Modelo recusado: o ID não veio de puter.ai.listModels() nesta sessão.')
    const puter = await this.load()
    return puter.ai.chat(messages, { ...options, model: model.id, provider: model.provider })
  }

  async webSearch(provider:string,modelId:string,prompt:string){
    if(!this.catalog.size)await this.discover();if(!this.has(provider,modelId))throw new Error('Modelo de pesquisa recusado: ID ausente da descoberta Puter atual.')
    const response=await this.chat(provider,modelId,prompt,{stream:false,tools:[{type:'web_search'}]});let content='';if(typeof response==='string')content=response;else if(response&&typeof response==='object'){const value=response as {message?:{content?:unknown};text?:unknown};if(typeof value.message?.content==='string')content=value.message.content;else if(typeof value.text==='string')content=value.text}
    if(!content)throw new Error('Pesquisa Puter retornou formato textual não reconhecido.')
    const citations:{url:string;title?:string}[]=[],seen=new Set<string>(),visited=new WeakSet<object>();const walk=(value:unknown,depth=0)=>{if(depth>7||!value)return;if(Array.isArray(value)){value.forEach(item=>walk(item,depth+1));return}if(typeof value!=='object')return;if(visited.has(value as object))return;visited.add(value as object);const object=value as Record<string,unknown>,url=typeof object.url==='string'?object.url:object.url_citation&&typeof object.url_citation==='object'&&typeof(object.url_citation as Record<string,unknown>).url==='string'?String((object.url_citation as Record<string,unknown>).url):undefined,title=typeof object.title==='string'?object.title:undefined;if(url&&/^https?:\/\//.test(url)&&!seen.has(url)){seen.add(url);citations.push({url,title})}Object.values(object).forEach(item=>walk(item,depth+1))};walk(response);for(const match of content.matchAll(/https?:\/\/[^\s)\]}>,]+/g)){const url=match[0].replace(/[.,;:]+$/,'');if(!seen.has(url)){seen.add(url);citations.push({url})}}
    return{content,citations,provider,modelId,rawResponseType:typeof response}
  }

  async betaChat(prompt:string,maxAttempts=3){
    const puter=await this.load();if(!puter.auth.isSignedIn())await puter.auth.signIn();const models=await this.discover();const candidates=models.filter(model=>{const modalities=model.modalities as {input?:unknown;output?:unknown}|undefined;if(!modalities)return true;const input=Array.isArray(modalities.input)?modalities.input:[],output=Array.isArray(modalities.output)?modalities.output:[];return input.includes('text')&&output.includes('text')})
    if(!candidates.length)throw new Error('Nenhum modelo textual exato foi descoberto pelo Puter.')
    const storageKey='snb:puter-round-robin',start=Number(localStorage.getItem(storageKey)??0)%candidates.length,startedAt=new Date().toISOString(),started=performance.now(),fallbackChain:{provider:string;modelId:string;error:string}[]=[]
    for(let attempt=0;attempt<Math.min(maxAttempts,candidates.length);attempt++){const model=candidates[(start+attempt)%candidates.length];try{const response=await this.chat(model.provider,model.id,prompt,{stream:false});let content:string|undefined;if(typeof response==='string')content=response;else if(response&&typeof response==='object'){const value=response as {message?:{content?:unknown};text?:unknown};if(typeof value.message?.content==='string')content=value.message.content;else if(typeof value.text==='string')content=value.text}if(!content)throw new Error('Formato textual não reconhecido');localStorage.setItem(storageKey,String((start+attempt+1)%candidates.length));return{content,provider:model.provider,modelId:model.id,startedAt,durationMs:Math.round(performance.now()-started),fallbackChain,selectionPolicy:'exact-catalog-round-robin-unranked-beta' as const}}catch(error){fallbackChain.push({provider:model.provider,modelId:model.id,error:error instanceof Error?error.message:'Falha Puter'})}}
    throw new Error(`Todos os ${fallbackChain.length} candidatos Puter do fallback beta falharam.`)
  }

  snapshot() { return [...this.catalog.values()].map(model => structuredClone(model)) }
  has(provider: string, modelId: string) { return this.catalog.has(this.key(provider, modelId)) }
  private key(provider: string, modelId: string) { return `${provider.trim()}\u0000${modelId.trim()}` }
}

export const puterGateway = new PuterGateway()
export type { PuterModel }
