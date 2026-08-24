# Singularity Backend

## Estado

Primeira fundação executável do Singularity Core. O objetivo desta fase é estabelecer contratos, isolamento, segurança básica e adapters antes de adicionar provedores e workloads pesados.

## Arquitetura

```text
Web / Mobile / Desktop
        |
   Singularity API
        |
 Authentication + Validation + Rate limits
        |
    Orchestrator
   /      |       \
Router  Context   Verifier
   |     Engine      |
Provider Registry   Metadata
   |
Model adapters with automatic fallback
```

## Módulos implementados

- API HTTP Fastify
- validação Zod
- persistência SQLite em WAL com índices e migrations versionadas
- tokens JWT HS256 de curta duração
- refresh tokens opacos, armazenados como SHA-256 e rotacionados a cada uso
- detecção de reutilização e revogação de sessões
- hash bcrypt com custo 12
- sessões convidadas de curta duração
- registro, login, logout local e logout global
- CORS configurável
- headers de segurança
- rate limiting global e por autenticação/chat
- isolamento de projetos, conversas e memórias por usuário
- Context Engine com recuperação lexical e ranking por importância
- Provider Registry desacoplado
- adapter OpenAI-compatible
- provider local de demonstração
- seleção por capacidades e tier
- fallback sequencial entre candidatos
- streaming SSE com eventos de status, delta, conclusão e erro
- upload, listagem, download e exclusão segura de arquivos
- checksums SHA-256, nomes normalizados, MIME allowlist e limite configurável
- trilha de auditoria persistente
- Mission Engine persistente com DAG, dependências, progresso, eventos, retries limitados e cancelamento
- checkpoints versionados de projeto com restauração de metadados e manifestos
- Tool Registry com manifests, permissões, riscos, limites e verifiers
- Policy Engine com approval gates e execução física desativada
- receipts HMAC-SHA256, histórico e auditoria de ferramentas
- deterministic verifiers e circuit breakers persistentes
- timeouts e erros estruturados
- frontend conectado por proxy relativo e chat com streaming
- testes de integração por injeção HTTP

## Rotas

### Públicas

- `GET /api/health`
- `GET /api/v1/system/status`
- `GET /api/v1/capabilities`
- `POST /api/v1/auth/guest`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

### Autenticadas

- `GET /api/v1/models`
- `POST /api/v1/auth/logout-all`
- `POST /api/v1/chat`
- `POST /api/v1/chat/stream`
- `GET /api/v1/conversations`
- `GET /api/v1/conversations/:id/messages`
- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `PATCH /api/v1/projects/:id`
- `POST /api/v1/projects/:id/checkpoints`
- `GET /api/v1/projects/:id/checkpoints`
- `POST /api/v1/checkpoints/:id/restore`
- `GET /api/v1/missions`
- `POST /api/v1/missions`
- `GET /api/v1/missions/:id`
- `POST /api/v1/missions/:id/cancel`
- `POST /api/v1/missions/:id/pause`
- `POST /api/v1/missions/:id/resume`
- `POST /api/v1/missions/:id/tasks/:taskId/start`
- `POST /api/v1/missions/:id/tasks/:taskId/complete`
- `POST /api/v1/missions/:id/tasks/:taskId/fail`
- `GET /api/v1/missions/:id/events`
- `GET /api/v1/memories`
- `POST /api/v1/memories`
- `DELETE /api/v1/memories/:id`
- `GET /api/v1/files`
- `POST /api/v1/files`
- `GET /api/v1/files/:id/content`
- `DELETE /api/v1/files/:id`
- `GET /api/v1/audit`

## Desenvolvimento

Terminal 1:

```bash
npm run dev:api
```

Terminal 2:

```bash
npm run dev
```

O Vite encaminha `/api` para `http://127.0.0.1:8787`, portanto o navegador nunca acessa localhost diretamente em outro serviço.

## Provedor real

Copie `.env.example` para `.env`, gere um segredo JWT forte e configure um endpoint OpenAI-compatible:

```env
AI_BASE_URL=https://provider.example/v1
AI_API_KEY=secret
AI_MODEL=model-name
```

Nenhuma chave deve usar prefixo `VITE_` ou ser enviada ao frontend.

## Limitações conscientes desta fundação

- SQLite é adequado para a V1 local e ambientes de instância única; produção distribuída deverá usar o adapter PostgreSQL;
- OAuth Google, SMS, Puter e passkeys ainda exigem adapters oficiais;
- pesquisa, imagem, vídeo, áudio e 3D ainda precisam de providers próprios;
- verificação atual registra metadados, mas ainda não executa um segundo modelo crítico;
- WebSocket colaborativo ainda será adicionado; o streaming de chat já usa SSE;
- filas distribuídas e workers GPU pertencem à fase de workloads.

A próxima etapa técnica deve introduzir o adapter PostgreSQL para escala horizontal, filas persistentes, ferramentas reais, OAuth e colaboração por WebSocket. Billing permanece deliberadamente fora até o restante da plataforma estar estável.
