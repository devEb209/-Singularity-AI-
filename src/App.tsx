import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
const AdvancedView=lazy(()=>import('./AdvancedViews'))
const CreativeView=lazy(()=>import('./CreativeViews'))
const PlatformView=lazy(()=>import('./PlatformViews'))
const DivineEngineView=lazy(()=>import('./DivineEngineView'))
const DivineOsView=lazy(()=>import('./DivineOsView'))
const advancedIds=['novo-chat','conversas','integracoes','live-link','plugins','tools','mission-control','workflows','activity','model-router','benchmarks','verifier','memory','knowledge','vault','forge','deployments','settings','team','api']
const creativeIds=['projetos','artefatos','code-studio','canvas','imagem','video','audio','3d']
const platformIds=['deep-research','forks','agent-market','digital-twin','time-machine','dreamspace','consensus','skill-foundry','observatory','reality-bridge','simulacoes']
import { puterGateway } from './lib/puter'
import { api, type ProjectRecord } from './lib/api'
import {
  Activity, AppWindow, Archive, Atom, Bell, Blocks, BookOpen, Bot, Box, BrainCircuit,
  Braces, ChevronDown, ChevronLeft, ChevronRight, CircleUserRound, Cloud, Code2,
  Command, Compass, Cpu, Database, FileClock, FileCode2, FileText, FolderKanban, Gauge,
  Gem, GitFork, Globe2, Headphones, Image, Infinity as InfinityIcon, Layers3, LayoutGrid,
  Link2, Menu, MessageSquareText, Mic, Network, Paperclip, PenTool, Play, Plus, Radio,
  Rocket, Search, Send, Settings, ShieldCheck, Sparkles, TerminalSquare, TestTube2,
  Users, Video, WandSparkles, Workflow, X, Zap, type LucideIcon
} from 'lucide-react'

type NavItem = { id: string; label: string; icon: LucideIcon; description: string }
type NavGroup = { label: string; items: NavItem[] }

const groups: NavGroup[] = [
  { label: 'Principal', items: [
    { id: 'inicio', label: 'Início', icon: LayoutGrid, description: 'Seu centro de comando inteligente.' },
    { id: 'novo-chat', label: 'Novo chat', icon: MessageSquareText, description: 'Converse com a inteligência unificada.' },
    { id: 'conversas', label: 'Conversas', icon: FileClock, description: 'Continue de onde você parou.' },
    { id: 'projetos', label: 'Projetos', icon: FolderKanban, description: 'Contexto, arquivos e agentes em um só lugar.' },
    { id: 'artefatos', label: 'Artefatos', icon: Blocks, description: 'Tudo que a Singularity criou para você.' },
  ]},
  { label: 'Criar', items: [
    { id: 'forge', label: 'Forge', icon: WandSparkles, description: 'Transforme uma ideia em produto completo.' },
    { id: 'divine-engine', label: 'Divine Engine', icon: Gem, description: 'Fábrica remota de jogos e experiências digitais operada pela SNB.' },
    { id: 'code-studio', label: 'Code Studio', icon: Code2, description: 'Desenvolvimento inteligente, do plano ao deploy.' },
    { id: 'canvas', label: 'Canvas infinito', icon: PenTool, description: 'Pense visualmente sem limites.' },
    { id: 'imagem', label: 'Laboratório visual', icon: Image, description: 'Geração e edição visual de alta fidelidade.' },
    { id: 'video', label: 'Motion Studio', icon: Video, description: 'Vídeos, cenas e animações guiados por IA.' },
    { id: 'audio', label: 'Audio Lab', icon: Headphones, description: 'Voz, áudio e paisagens sonoras.' },
    { id: '3d', label: 'Spatial 3D', icon: Box, description: 'Assets 3D prontos para qualquer pipeline.' },
  ]},
  { label: 'Inteligência', items: [
    { id: 'deep-research', label: 'Deep Research', icon: Globe2, description: 'Pesquisa profunda com fontes verificáveis.' },
    { id: 'mission-control', label: 'Mission Control', icon: Rocket, description: 'Delegue objetivos complexos a equipes de agentes.' },
    { id: 'simulacoes', label: 'Simulações', icon: Atom, description: 'Teste cenários antes de agir no mundo real.' },
    { id: 'knowledge', label: 'Knowledge Graph', icon: Network, description: 'Conecte tudo que a Singularity sabe.' },
    { id: 'memory', label: 'Memória', icon: BrainCircuit, description: 'Controle o que a inteligência aprende sobre você.' },
    { id: 'model-router', label: 'Model Router', icon: Cpu, description: 'Veja especialistas trabalhando em tempo real.' },
    { id: 'verifier', label: 'Verifier', icon: ShieldCheck, description: 'Validação multicamada de cada resultado.' },
  ]},
  { label: 'Fronteira', items: [
    { id: 'digital-twin', label: 'Digital Twin', icon: CircleUserRound, description: 'Um copiloto que aprende seu modo de trabalhar.' },
    { id: 'time-machine', label: 'Time Machine', icon: FileClock, description: 'Explore versões, decisões e futuros possíveis.' },
    { id: 'dreamspace', label: 'Dreamspace', icon: Sparkles, description: 'Transforme ideias abstratas em mundos navegáveis.' },
    { id: 'consensus', label: 'Consensus Engine', icon: Users, description: 'Múltiplos especialistas convergem na melhor resposta.' },
    { id: 'skill-foundry', label: 'Skill Foundry', icon: Gem, description: 'Crie novas competências para seus agentes.' },
    { id: 'observatory', label: 'Data Observatory', icon: Database, description: 'Descubra padrões vivos em qualquer conjunto de dados.' },
    { id: 'reality-bridge', label: 'Reality Bridge', icon: InfinityIcon, description: 'Conecte inteligência digital a ações no mundo real.' },
  ]},
  { label: 'Ecossistema', items: [
    { id: 'integracoes', label: 'Integrações', icon: Link2, description: 'Conecte a Singularity a qualquer software.' },
    { id: 'plugins', label: 'Plugins', icon: AppWindow, description: 'Expanda capacidades com módulos seguros.' },
    { id: 'tools', label: 'Tool Registry', icon: TerminalSquare, description: 'Ferramentas verificadas, permissões e execução auditável.' },
    { id: 'forks', label: 'Forks', icon: GitFork, description: 'Inteligências especializadas pela comunidade.' },
    { id: 'agent-market', label: 'Agent Exchange', icon: Bot, description: 'Descubra e publique agentes especialistas.' },
    { id: 'workflows', label: 'Automações', icon: Workflow, description: 'Orquestre tarefas contínuas sem código.' },
    { id: 'live-link', label: 'Live Link', icon: Radio, description: 'Colabore diretamente dentro de seus aplicativos.' },
    { id: 'api', label: 'Developer Platform', icon: Braces, description: 'Construa sobre o Singularity Core.' },
  ]},
  { label: 'Espaço', items: [
    { id: 'divine-os', label: 'Divine OS', icon: Cpu, description: 'Engenharia modular de sistemas operacionais dentro da SNB.' },
    { id: 'team', label: 'Equipe', icon: Users, description: 'Colaboração com contexto compartilhado.' },
    { id: 'vault', label: 'Vault', icon: Archive, description: 'Arquivos e conhecimento protegidos.' },
    { id: 'deployments', label: 'Deployments', icon: Cloud, description: 'Publique projetos em qualquer ambiente.' },
    { id: 'benchmarks', label: 'Benchmarks', icon: Gauge, description: 'Qualidade mensurável, sem promessas vazias.' },
    { id: 'activity', label: 'Atividade', icon: Activity, description: 'Uma linha do tempo de tudo que aconteceu.' },
    { id: 'settings', label: 'Configurações', icon: Settings, description: 'Personalize sua experiência Singularity.' },
  ]},
]

const allItems = groups.flatMap(g => g.items)
export const navigationItems = allItems.map(({ id, label }) => ({ id, label }))

const suggestions = [
  { icon: Code2, eyebrow: 'CONSTRUIR', title: 'Crie um app completo', text: 'Da ideia ao protótipo funcional', color: 'violet' },
  { icon: Globe2, eyebrow: 'PESQUISAR', title: 'Explore qualquer tema', text: 'Fontes, síntese e insights profundos', color: 'blue' },
  { icon: WandSparkles, eyebrow: 'CRIAR', title: 'Dê vida a uma ideia', text: 'Imagem, vídeo, áudio ou 3D', color: 'amber' },
  { icon: Workflow, eyebrow: 'AUTOMATIZAR', title: 'Orquestre seu trabalho', text: 'Conecte ferramentas e elimine tarefas', color: 'green' },
]

const specialists = [
  { icon: Code2, name: 'Code Architect', skill: 'Engenharia de software', tone: 'violet' },
  { icon: Compass, name: 'Deep Researcher', skill: 'Pesquisa e verificação', tone: 'blue' },
  { icon: Gem, name: 'Creative Director', skill: 'Design multimodal', tone: 'amber' },
]

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="brand">
    <div className="brand-mark"><span /><span /><span /></div>
    {!compact && <div className="brand-copy"><strong>SNB</strong><small>SINGULARITY NEURAL BUNKER</small></div>}
  </div>
}

function Sidebar({ active, onNavigate, collapsed, setCollapsed, mobileOpen, closeMobile }: {
  active: string; onNavigate: (id: string) => void; collapsed: boolean; setCollapsed: (v: boolean) => void;
  mobileOpen: boolean; closeMobile: () => void
}) {
  return <>
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-top">
        <Brand compact={collapsed} />
        <button className="icon-btn mobile-close" onClick={closeMobile} aria-label="Fechar menu"><X size={18}/></button>
      </div>
      <button className="new-chat" onClick={() => onNavigate('novo-chat')}><Plus size={17}/>{!collapsed && <span>Novo chat</span>} {!collapsed && <kbd>⌘ K</kbd>}</button>
      <nav className="nav-scroll">
        {groups.map(group => <div className="nav-group" key={group.label}>
          {!collapsed && <div className="nav-label">{group.label}</div>}
          {group.items.map(item => {
            const Icon = item.icon
            return <button title={collapsed ? item.label : undefined} className={`nav-item ${active === item.id ? 'active' : ''}`} key={item.id} onClick={() => { onNavigate(item.id); closeMobile() }}>
              <Icon size={17}/>{!collapsed && <span>{item.label}</span>}
              {item.id === 'forks' && !collapsed && <span className="mini-badge">12</span>}
            </button>
          })}
        </div>)}
      </nav>
      <div className="sidebar-footer">
        <button className="profile"><div className="avatar">BS</div>{!collapsed && <div><strong>Bunker Studios</strong><span>Workspace pessoal</span></div>}{!collapsed && <ChevronRight size={15}/>}</button>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Recolher menu">{collapsed ? <ChevronRight size={16}/> : <><ChevronLeft size={16}/><span>Recolher menu</span></>}</button>
      </div>
    </aside>
    {mobileOpen && <button className="scrim" onClick={closeMobile} aria-label="Fechar menu" />}
  </>
}

function Composer({ onSubmit, defaultValue = '' }: { onSubmit: (text: string) => void; defaultValue?: string }) {
  const [text, setText] = useState(defaultValue)
  const [mode, setMode] = useState('Auto')
  const textarea = useRef<HTMLTextAreaElement>(null)
  const submit = (e?: FormEvent) => { e?.preventDefault(); if (text.trim()) { onSubmit(text.trim()); setText('') } }
  return <form className="composer" onSubmit={submit}>
    <textarea ref={textarea} value={text} onChange={e => setText(e.target.value)} placeholder="O que você quer tornar possível?" rows={2} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}/>
    <div className="composer-tools">
      <div>
        <button type="button" className="tool-btn" title="Anexar arquivos"><Paperclip size={17}/></button>
        <button type="button" className="mode-btn" onClick={() => setMode(mode === 'Auto' ? 'Deep' : mode === 'Deep' ? 'Fast' : 'Auto')}><Sparkles size={15}/>{mode}<ChevronDown size={13}/></button>
      </div>
      <div>
        <button type="button" className="tool-btn" title="Entrada por voz"><Mic size={17}/></button>
        <button className="send-btn" type="submit" disabled={!text.trim()} aria-label="Enviar"><Send size={17}/></button>
      </div>
    </div>
  </form>
}

function Home({ onNavigate, notify }: { onNavigate: (id: string) => void; notify: (s: string) => void }) {
  const[projects,setProjects]=useState<ProjectRecord[]>([]),[coreOnline,setCoreOnline]=useState(false)
  useEffect(()=>{api.projects().then(result=>setProjects(result.data)).catch(()=>undefined);api.health().then(setCoreOnline).catch(()=>setCoreOnline(false))},[])
  return <div className="home-page page-enter">
    <section className="hero">
      <div className="status-pill"><span className="status-orb"/>SNB CORE <b>{coreOnline?'ONLINE':'RECONECTANDO'}</b></div>
      <h1>Olá, Bunker.</h1>
      <p className="hero-line">Até onde vamos hoje?</p>
      <Composer onSubmit={async text => { try { const result = await api.compileProblem(text); notify(`Task Graph criado · ${result.analysis.domains.map(domain => domain.name).join(' + ')}`); onNavigate('mission-control') } catch (error) { notify(error instanceof Error ? error.message : 'Não foi possível compilar o objetivo') } }} />
      <div className="composer-hint"><span><Command size={13}/> Enter para enviar</span><span>Shift + Enter para nova linha</span></div>
    </section>

    <section className="content-section">
      <div className="section-heading"><div><span className="kicker">COMECE POR UMA POSSIBILIDADE</span><h2>O que vamos fazer?</h2></div><button className="text-button" onClick={() => onNavigate('forge')}>Explorar capacidades <ChevronRight size={15}/></button></div>
      <div className="suggestion-grid">
        {suggestions.map(card => { const Icon = card.icon; return <button className="suggestion-card" key={card.title} onClick={() => onNavigate(card.eyebrow === 'PESQUISAR' ? 'deep-research' : card.eyebrow === 'AUTOMATIZAR' ? 'workflows' : card.eyebrow === 'CRIAR' ? 'canvas' : 'forge')}>
          <div className={`card-icon ${card.color}`}><Icon size={20}/></div><div><span>{card.eyebrow}</span><h3>{card.title}</h3><p>{card.text}</p></div><ChevronRight className="card-arrow" size={17}/>
        </button>})}
      </div>
    </section>

    <section className="content-section split-section">
      <div className="projects-panel">
        <div className="section-heading compact"><div><span className="kicker">CONTINUE CRIANDO</span><h2>Projetos recentes</h2></div><button className="text-button" onClick={() => onNavigate('projetos')}>Ver todos <ChevronRight size={15}/></button></div>
        <div className="project-list">
          {projects.slice(0,3).map((project,index)=><button key={project.id} onClick={()=>onNavigate('projetos')}><div className={`project-symbol p${index%3+1}`}><FolderKanban size={19}/></div><div><strong>{project.name}</strong><span>{project.description||'Projeto persistente'} · {project.status}</span></div><time>{new Date(project.updatedAt).toLocaleDateString('pt-BR')}</time></button>)}
          {!projects.length&&<button onClick={()=>onNavigate('projetos')}><div className="project-symbol p1"><Plus size={19}/></div><div><strong>Criar primeiro projeto</strong><span>Workspace ainda sem projetos</span></div><ChevronRight size={14}/></button>}
        </div>
      </div>
      <div className="specialists-panel">
        <div className="section-heading compact"><div><span className="kicker">ESPECIALISTAS</span><h2>Prontos para colaborar</h2></div><button className="text-button" onClick={() => onNavigate('agent-market')}>Descobrir <ChevronRight size={15}/></button></div>
        <div className="specialist-row">{specialists.map(s => { const Icon=s.icon; return <button key={s.name} onClick={() => notify(`${s.name} adicionado à missão`)}><div className={`specialist-avatar ${s.tone}`}><Icon size={19}/><i /></div><strong>{s.name}</strong><span>{s.skill}</span></button>})}</div>
      </div>
    </section>
    <footer className="home-footer"><span>Singularity AI pode cometer erros. Verifique informações importantes.</span><span><InfinityIcon size={14}/> Uma inteligência. Infinitas possibilidades.</span></footer>
  </div>
}

const pageCards: Record<string, { title: string; text: string; icon: LucideIcon }[]> = {
  'projetos': [
    { title: 'Project Nexus', text: 'Plataforma web · atualizado há 12 min', icon: Layers3 },
    { title: 'Aether World', text: 'Game design · atualizado ontem', icon: Box },
    { title: 'Atlas Research', text: 'Pesquisa estratégica · 9 fontes', icon: BookOpen },
  ],
  'integracoes': [
    { title: 'Game Engines', text: 'Unity, Unreal, Godot e Roblox Studio', icon: Blocks },
    { title: 'Development', text: 'GitHub, VS Code, Figma e Linear', icon: Code2 },
    { title: 'Universal Bridge', text: 'Conecte qualquer software pela Singularity API', icon: Link2 },
  ],
  'forks': [
    { title: 'Singularity Game Architect', text: 'Por Bunker Labs · 12,4 mil usos', icon: Box },
    { title: 'Scientific Core', text: 'Por Open Research · 8,2 mil usos', icon: TestTube2 },
    { title: 'Cinematic Director', text: 'Por Frame Collective · 5,8 mil usos', icon: Video },
  ],
  'code-studio': [
    { title: 'Visual Code', text: 'Construa lógica com nós inteligentes', icon: Network },
    { title: 'Code Workspace', text: 'Editor, terminal e preview integrados', icon: TerminalSquare },
    { title: 'Architecture Map', text: 'Entenda sistemas inteiros visualmente', icon: FileCode2 },
  ],
}

function GenericPage({ item, notify }: { item: NavItem; notify: (s: string) => void }) {
  const Icon = item.icon
  const cards = pageCards[item.id] || [
    { title: 'Começar do zero', text: `Crie uma nova experiência em ${item.label}`, icon: Plus },
    { title: 'Explorar possibilidades', text: 'Descubra fluxos recomendados pela Singularity', icon: Compass },
    { title: 'Biblioteca', text: 'Continue a partir de templates profissionais', icon: Archive },
  ]
  return <div className="generic-page page-enter">
    <div className="generic-hero">
      <div className="large-page-icon"><Icon size={28}/></div>
      <span className="kicker">SINGULARITY WORKSPACE</span>
      <h1>{item.label}</h1><p>{item.description}</p>
      <button className="primary-action" onClick={() => notify(`${item.label}: novo espaço criado`)}><Plus size={17}/> Criar novo</button>
    </div>
    <div className="module-grid">{cards.map((card, i) => { const CardIcon = card.icon; return <button className="module-card" key={card.title} onClick={() => notify(`${card.title} aberto`)}><div className="module-top"><span className={`module-icon m${i+1}`}><CardIcon size={21}/></span><ChevronRight size={17}/></div><h3>{card.title}</h3><p>{card.text}</p><div className="module-meta"><span className="live-dot"/>{i === 0 ? 'Pronto para iniciar' : 'Disponível'}</div></button>})}</div>
    <div className="empty-workspace"><div className="ambient-ring"><Icon size={25}/></div><h2>Seu espaço, amplificado</h2><p>Peça à Singularity para planejar, criar e verificar. Os melhores especialistas serão selecionados automaticamente.</p><Composer onSubmit={text => notify(`Executando em ${item.label}: ${text}`)}/></div>
  </div>
}

function Onboarding({ open, onClose, onNavigate }: { open: boolean; onClose: () => void; onNavigate: (id: string) => void }) {
  const [step, setStep] = useState(0)
  const steps = [
    { icon: Sparkles, eyebrow: 'BEM-VINDO À SINGULARITY', title: 'Uma inteligência. Infinitas possibilidades.', text: 'Você não escolhe modelos ou ferramentas. Descreva o resultado e o Singularity Core organiza todo o trabalho.' },
    { icon: Network, eyebrow: 'INTELIGÊNCIA ORQUESTRADA', title: 'Especialistas trabalham como um só.', text: 'Pesquisa, código, visão, 3D, verificação e memória compartilham o mesmo objetivo e contexto.' },
    { icon: Rocket, eyebrow: 'SEU NOVO WORKSPACE', title: 'Comece pequeno. Construa o impossível.', text: 'Crie uma missão, transforme uma ideia no Forge ou simplesmente converse com a Singularity.' },
  ]
  if (!open) return null
  const current = steps[step]; const Icon = current.icon
  const finish = () => { localStorage.setItem('singularity:onboarded', 'true'); onClose(); if (step === 2) onNavigate('novo-chat') }
  return <div className="modal-layer onboarding-layer"><div className="onboarding-card"><button className="skip-tour" onClick={finish}>Pular introdução</button><div className="onboarding-visual"><div className="onboard-core"><span/><span/><Icon size={32}/></div><i className="orbit-dot od1"/><i className="orbit-dot od2"/><i className="orbit-dot od3"/></div><div className="onboarding-copy"><span className="kicker">{current.eyebrow}</span><h2>{current.title}</h2><p>{current.text}</p><div className="tour-progress">{steps.map((_, i) => <button aria-label={`Etapa ${i + 1}`} className={i === step ? 'active' : ''} onClick={() => setStep(i)} key={i}/>)}</div><div className="tour-actions"><button onClick={() => step ? setStep(step - 1) : finish()}>{step ? 'Voltar' : 'Agora não'}</button><button onClick={() => step < 2 ? setStep(step + 1) : finish()}>{step < 2 ? <>Continuar <ChevronRight size={14}/></> : <>Entrar na Singularity <ArrowRightIcon/></>}</button></div></div></div></div>
}
function ArrowRightIcon(){return <ChevronRight size={14}/>}

function AccessPortal({ open, onClose, notify }: { open: boolean; onClose: () => void; notify: (s: string) => void }) {
  const [view, setView] = useState<'account' | 'login'>('account')
  const[dashboard,setDashboard]=useState<{counts:{projects:number;files:number;missions:number};puter:{total:number};workers:{online:number}}>()
  const[authMode,setAuthMode]=useState<'login'|'register'>('login'),[authName,setAuthName]=useState(''),[authEmail,setAuthEmail]=useState(''),[authPassword,setAuthPassword]=useState(''),[authBusy,setAuthBusy]=useState(false)
  useEffect(()=>{if(open)api.dashboard().then(setDashboard).catch(()=>undefined)},[open])
  if (!open) return null
  const submitAuth=async()=>{if(!authEmail.trim()||authPassword.length<10||authMode==='register'&&!authName.trim()){notify('Preencha os dados; a senha deve ter ao menos 10 caracteres.');return}setAuthBusy(true);try{const user=authMode==='register'?await api.register(authName.trim(),authEmail.trim(),authPassword):await api.login(authEmail.trim(),authPassword);notify(`Sessão autenticada: ${user.name}`);onClose()}catch(error){notify(error instanceof Error?error.message:'Falha de autenticação')}finally{setAuthBusy(false)}}
  const choose = async (provider: string) => {
    if (provider === 'Puter.js') {
      try { await puterGateway.signIn(); const models = await puterGateway.discover(); notify(`Puter.js conectado · ${models.length} modelos descobertos diretamente`); onClose(); return }
      catch (error) { notify(error instanceof Error ? error.message : 'Falha ao conectar Puter.js'); return }
    }
    notify(`${provider}: fluxo de autenticação preparado para o backend`); onClose()
  }
  return <div className="modal-layer account-layer" onMouseDown={onClose}><div className="access-portal" onMouseDown={e => e.stopPropagation()}>
    <button className="portal-close" onClick={onClose}><X size={17}/></button>
    {view === 'account' ? <>
      <div className="account-cover"><Brand/><div className="account-avatar">BS<span/></div></div>
      <div className="account-body"><span className="kicker">SINGULARITY ACCOUNT</span><h2>Bunker Studios</h2><p>Workspace pessoal · Founder access</p>
        <div className="account-stats"><div><strong>{dashboard?.counts.projects??'—'}</strong><span>Projetos</span></div><div><strong>{dashboard?.counts.files??'—'}</strong><span>Arquivos</span></div><div><strong>{dashboard?.puter.total??'—'}</strong><span>Modelos Puter</span></div></div>
        <button className="account-option" onClick={() => notify('Gerenciamento de workspace aberto')}><Users size={17}/><span><strong>Gerenciar workspace</strong><small>Membros, funções e permissões</small></span><ChevronRight size={15}/></button>
        <button className="account-option" onClick={() => notify('Central de segurança aberta')}><ShieldCheck size={17}/><span><strong>Segurança e privacidade</strong><small>Sessões, dados e memória</small></span><ChevronRight size={15}/></button>
        <button className="account-option" onClick={() => setView('login')}><CircleUserRound size={17}/><span><strong>Ver portal de acesso</strong><small>Login e criação de conta</small></span><ChevronRight size={15}/></button>
        <button className="account-option" onClick={()=>api.logout().then(()=>{notify('Sessão encerrada');onClose()})}><X size={17}/><span><strong>Encerrar sessão</strong><small>Revoga refresh token quando disponível</small></span><ChevronRight size={15}/></button>
      </div>
    </> : <div className="login-view">
      <button className="back-login" onClick={() => setView('account')}><ChevronLeft size={15}/> Voltar</button><div className="login-brand"><Brand/></div>
      <span className="kicker">IDENTIDADE UNIFICADA</span><h2>{authMode==='login'?'Entre na SNB':'Crie sua conta SNB'}</h2><p>Projetos, memórias, missões e receipts persistentes.</p>
      <div className="auth-mode-tabs"><button className={authMode==='login'?'active':''} onClick={()=>setAuthMode('login')}>Entrar</button><button className={authMode==='register'?'active':''} onClick={()=>setAuthMode('register')}>Criar conta</button></div>
      {authMode==='register'&&<input className="auth-field" value={authName} onChange={event=>setAuthName(event.target.value)} placeholder="Nome" autoComplete="name"/>}<input className="auth-field" value={authEmail} onChange={event=>setAuthEmail(event.target.value)} placeholder="E-mail" type="email" autoComplete="email"/><input className="auth-field" value={authPassword} onChange={event=>setAuthPassword(event.target.value)} placeholder="Senha com 10+ caracteres" type="password" autoComplete={authMode==='login'?'current-password':'new-password'}/><button className="auth-submit" onClick={submitAuth} disabled={authBusy}>{authBusy?'Autenticando...':authMode==='login'?'Entrar com e-mail':'Criar conta segura'}</button>{authMode==='login'&&<button className="reset-link" onClick={async()=>{if(!authEmail.trim()){notify('Informe o e-mail primeiro.');return}try{const result=await api.requestPasswordReset(authEmail.trim());if(result.developmentResetToken){const password=window.prompt('Beta local: informe a nova senha com 10+ caracteres');if(password)await api.confirmPasswordReset(result.developmentResetToken,password);notify(password?'Senha atualizada; entre novamente.':result.message)}else notify(result.message)}catch(error){notify(error instanceof Error?error.message:'Falha na recuperação')}}}>Esqueci minha senha</button>}
      <div className="auth-divider"><span>ou continue com provider</span></div>
      <button className="login-provider featured" onClick={() => choose('Google')}><span className="provider-symbol google">G</span><strong>Continuar com Google</strong><ChevronRight size={15}/></button>
      <div className="login-pair"><button className="login-provider" onClick={() => choose('E-mail')}><span className="provider-symbol"><FileText size={15}/></span><strong>E-mail</strong></button><button className="login-provider" onClick={() => choose('Telefone/SMS')}><span className="provider-symbol"><Radio size={15}/></span><strong>Telefone</strong></button></div>
      <button className="login-provider" onClick={() => choose('Puter.js')}><span className="provider-symbol puter"><Cloud size={15}/></span><strong>Continuar com Puter.js</strong><ChevronRight size={15}/></button>
      <button className="login-provider" onClick={() => choose('Passkey')}><span className="provider-symbol"><ShieldCheck size={15}/></span><strong>Entrar com passkey</strong><small>Mais seguro</small><ChevronRight size={15}/></button>
      <div className="login-security"><ShieldCheck size={14}/> Autenticação modular. Suas credenciais nunca ficam no frontend.</div>
      <small className="legal-copy">Ao continuar, você concorda com os Termos e a Política de Privacidade da Bunker Studios.</small>
    </div>}
  </div></div>
}

function CommandPalette({ open, onClose, onNavigate }: { open: boolean; onClose: () => void; onNavigate: (id: string) => void }) {
  const [query, setQuery] = useState('')
  const results = useMemo(() => allItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase())).slice(0, 7), [query])
  if (!open) return null
  return <div className="modal-layer" onMouseDown={onClose}><div className="command-palette" onMouseDown={e => e.stopPropagation()}>
    <div className="command-input"><Search size={19}/><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Busque uma função ou espaço..."/><kbd>ESC</kbd></div>
    <div className="command-results"><span className="command-label">NAVEGAR</span>{results.map(item => { const Icon=item.icon; return <button key={item.id} onClick={() => {onNavigate(item.id);onClose()}}><Icon size={17}/><span><strong>{item.label}</strong><small>{item.description}</small></span><ChevronRight size={15}/></button>})}</div>
  </div></div>
}

export default function App() {
  const [active, setActiveState] = useState(() => localStorage.getItem('singularity:active') || 'inicio')
  const [collapsed, setCollapsedState] = useState(() => localStorage.getItem('singularity:collapsed') === 'true')
  const [onboarding, setOnboarding] = useState(() => localStorage.getItem('singularity:onboarded') !== 'true')
  const [online, setOnline] = useState(() => navigator.onLine)
  const setActive = (id: string) => { setActiveState(id); localStorage.setItem('singularity:active', id) }
  const setCollapsed = (value: boolean) => { setCollapsedState(value); localStorage.setItem('singularity:collapsed', String(value)) }
  const [mobileOpen, setMobileOpen] = useState(false)
  const [palette, setPalette] = useState(false)
  const [toast, setToast] = useState('')
  const [notifications, setNotifications] = useState(false)
  const [account, setAccount] = useState(false)
  const item = allItems.find(i => i.id === active) || allItems[0]
  const notify = useCallback((message: string) => { setToast(message); window.setTimeout(() => setToast(''), 3200) }, [])
  useEffect(() => {
    const connected = () => setOnline(true); const disconnected = () => setOnline(false)
    window.addEventListener('online', connected); window.addEventListener('offline', disconnected)
    return () => { window.removeEventListener('online', connected); window.removeEventListener('offline', disconnected) }
  }, [])
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(v => !v) }
      if (e.key === 'Escape') { setPalette(false); setNotifications(false) }
    }
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key)
  }, [])
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
    {!online && <div className="offline-banner"><Cloud size={14}/>Modo offline — alterações locais serão sincronizadas quando a conexão voltar.</div>}
    <Sidebar active={active} onNavigate={setActive} collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} closeMobile={() => setMobileOpen(false)}/>
    <main className={`main-shell ${collapsed ? 'expanded' : ''}`}>
      <header className="topbar">
        <button className="icon-btn menu-btn" onClick={() => setMobileOpen(true)}><Menu size={19}/></button>
        <div className="breadcrumb"><span>Workspace</span><ChevronRight size={13}/><strong>{item.label}</strong></div>
        <div className="top-actions">
          <button className="search-trigger" onClick={() => setPalette(true)}><Search size={16}/><span>Buscar</span><kbd>⌘ K</kbd></button>
          <button className="icon-btn" onClick={() => setOnboarding(true)} aria-label="Abrir introdução"><Compass size={18}/></button>
          <div className="notification-wrap"><button className="icon-btn has-dot" onClick={() => setNotifications(!notifications)}><Bell size={18}/></button>{notifications && <div className="notification-card"><div><strong>Atividade recente</strong><button onClick={() => setNotifications(false)}><X size={15}/></button></div><p><span className="pulse-dot"/> Singularity Core está operando normalmente.</p><p><GitFork size={15}/> 3 novos forks disponíveis na comunidade.</p></div>}</div>
          <button className="user-button" onClick={() => setAccount(true)} aria-label="Conta"><CircleUserRound size={20}/></button>
        </div>
      </header>
      <div className="main-content" id="main-content"><Suspense fallback={<div className="real-data-empty"><strong>Carregando workspace SNB</strong><p>Baixando apenas o módulo necessário.</p></div>}>{active === 'inicio' ? <Home onNavigate={setActive} notify={notify}/> : active==='divine-engine'?<DivineEngineView notify={notify}/>:active==='divine-os'?<DivineOsView notify={notify}/>:creativeIds.includes(active) ? <CreativeView id={active} notify={notify}/> : platformIds.includes(active) ? <PlatformView id={active} notify={notify}/> : advancedIds.includes(active) ? <AdvancedView id={active} notify={notify}/> : <GenericPage item={item} notify={notify}/>}</Suspense></div>
    </main>
    <Onboarding open={onboarding} onClose={() => setOnboarding(false)} onNavigate={setActive}/>
    <CommandPalette open={palette} onClose={() => setPalette(false)} onNavigate={setActive}/>
    <AccessPortal open={account} onClose={() => setAccount(false)} notify={notify}/>
    {toast && <div className="toast"><span><Zap size={16}/></span><div><strong>Singularity Core</strong><p>{toast}</p></div><button onClick={() => setToast('')}><X size={14}/></button></div>}
  </div>
}
