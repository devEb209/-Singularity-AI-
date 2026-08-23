# SNB — Singularity Neural Bunker

Plataforma de inteligência composta da **Bunker Studios**: multi-modelo, multi-agente, ferramentas, memória, execução e verificação.

## Visão

Uma experiência profissional para orquestrar modelos, especialistas, ferramentas, memória e projetos como uma única inteligência. Esta fase implementa exclusivamente o frontend demonstrativo; integrações e operações são simuladas localmente.

## Recursos da interface

- Dashboard responsivo com identidade visual própria
- 32+ espaços organizados em criação, inteligência e ecossistema
- Composer inteligente com modos Auto, Deep e Fast
- Projetos, especialistas, integrações e forks da comunidade
- Chat funcional com mensagens, estados de execução e painel de contexto
- Mission Control com agentes, progresso, eventos e checkpoints
- Catálogo de integrações pesquisável para engines, design e desenvolvimento
- Model Router com tiers, qualidade, latência e benchmarks
- Context Engine com controles de memória e insights editáveis
- Singularity Forge para transformar ideias em produtos completos
- IDE visual com árvore de arquivos, código, preview e execução simulada
- Canvas infinito com nós, conexões, minimapa e organização por IA
- Laboratórios dedicados para imagem, vídeo, áudio e assets 3D
- Deep Research com síntese, evidências, confiança e painel de fontes
- Projetos persistentes e biblioteca universal de artefatos
- Marketplace de agentes e Forks com busca e instalação
- Experiências de fronteira: Digital Twin, Time Machine, Dreamspace, Consensus Engine, Skill Foundry, Data Observatory, Reality Bridge e Simulações
- Configurações, privacidade e preferências de inteligência
- Onboarding guiado, estado offline e persistência local da navegação
- Portal de conta e autenticação modular (Google, e-mail, SMS, Puter.js e passkey)
- Command palette global (`Ctrl/⌘ + K`)
- Navegação adaptada para desktop e mobile
- Feedback de ações, notificações e estados interativos
- Iconografia vetorial profissional, sem emojis

## Desenvolvimento

Requer Node.js 20+.

```bash
npm install
npm run dev
```

O Vite inicia em `http://localhost:5173` e aceita conexões externas para previews de desenvolvimento.

## Qualidade e build

```bash
npm run lint          # análise estática
npm run test          # testes automatizados
npm run check         # lint + testes + TypeScript + build
npm run beta:check    # check completo + auditoria de produção
npm run backup:create # backup online + checksums
npm run e2e:install   # instala Chromium quando a rede permitir
npm run e2e           # testes Playwright
npm run preview
```

A preparação específica para APK foi intencionalmente deixada para a fase de release.

## Estrutura

```text
src/
  App.tsx       # shell, navegação e módulos da experiência
  main.tsx      # bootstrap React
  styles.css    # design system e responsividade
```

## Backend

A fundação do Singularity Core já está executável em `server/`:

```bash
npm run dev:api       # API em 0.0.0.0:8787
npm run dev           # frontend com proxy /api
npm run check         # lint, testes automatizados, typecheck da API e build
```

Inclui persistência SQLite, autenticação JWT com refresh rotation, projetos, conversas, memória, arquivos, auditoria, streaming SSE, chat Puter Beta com IDs exatos e fallback limitado, Provider Registry, roteamento, campanhas de benchmark e worker persistente com claims atômicos, leases, heartbeats, idempotência e model-health circuit breakers. O Mission Engine executa DAGs persistentes com dependências, retries limitados, eventos, cancelamento e checkpoints. A integração Puter preserva os **879 modelos exatos** do snapshot fornecido, sem IDs inventados. O registro canônico agora conecta os 150 sistemas originais a 380 novas capacidades em 19 domínios, totalizando 530 nós de produto. Consulte [`docs/BACKEND.md`](docs/BACKEND.md), [`docs/PUTER.md`](docs/PUTER.md), [`docs/SYSTEMS.md`](docs/SYSTEMS.md), [`docs/SNB-IDENTITY-AND-MISSION.md`](docs/SNB-IDENTITY-AND-MISSION.md), [`docs/BETA-INTEGRATION.md`](docs/BETA-INTEGRATION.md), [`docs/BETA-RC-CHECKLIST.md`](docs/BETA-RC-CHECKLIST.md), [`docs/CRITICAL-BETA-GATES.md`](docs/CRITICAL-BETA-GATES.md), [`docs/RESEARCH-SWARM.md`](docs/RESEARCH-SWARM.md), [`docs/CAPABILITY-FABRIC.md`](docs/CAPABILITY-FABRIC.md), [`docs/DIVINE-ENGINE.md`](docs/DIVINE-ENGINE.md), [`docs/DIVINE-OS.md`](docs/DIVINE-OS.md), [`docs/UNIVERSAL-CAPABILITIES.md`](docs/UNIVERSAL-CAPABILITIES.md), [`docs/BENCHMARKS.md`](docs/BENCHMARKS.md), [`docs/WORKERS-AND-HEALTH.md`](docs/WORKERS-AND-HEALTH.md), [`docs/SNB-PHYSICAL-INTELLIGENCE.md`](docs/SNB-PHYSICAL-INTELLIGENCE.md) e [`docs/V1-READINESS.md`](docs/V1-READINESS.md).

## Estado atual

Frontend V1 de alta fidelidade conectado à primeira fundação real do backend. O chat já cria sessão, conversa com a API, seleciona modelo e retorna metadados de confiança. Provedores multimodais e persistência PostgreSQL pertencem às próximas etapas.

---

Bunker Studios · Uma inteligência. Infinitas possibilidades.
