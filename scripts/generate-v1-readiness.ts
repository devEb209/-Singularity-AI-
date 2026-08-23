import { writeFile } from 'node:fs/promises'
import { divineSystemConcepts } from '../server/services/divine-ecosystem-registry.js'
import { integrationMatrix } from '../server/services/integration-matrix.js'
import { v1Gaps } from '../server/services/v1-gap-registry.js'
const by=<T>(items:T[],key:(item:T)=>string)=>Object.fromEntries([...new Set(items.map(key))].map(value=>[value,items.filter(item=>key(item)===value).length]))
const report=`# Final V1 Readiness Report — Pre-finalization

Generated: ${new Date().toISOString()}

## Scope status

- SNB orchestration/auth/projects/memory/files/missions/workers/tools/research: local Beta operational with documented trust boundaries.
- UES studio/runtime patch/settings/artifact graph/procedural 3D/PBR/scene/WebGL/experimental 4D: operational within declared lightweight scope.
- DsOS project/core/module/compliance/resource architecture: foundation/partial; no boot image claim.

## Divine systems

${JSON.stringify(by(divineSystemConcepts,item=>item.status),null,2)}

## Integration matrix

${JSON.stringify(by(integrationMatrix,item=>item.state),null,2)}

## Remaining gaps only

${JSON.stringify(by(v1Gaps,item=>item.state),null,2)}

### UES gaps
${v1Gaps.filter(item=>item.area==='UES').map(item=>`- **${item.name}** — ${item.state}; dependency: ${item.dependency}; activation: ${item.activation}`).join('\n')}

### DsOS gaps
${v1Gaps.filter(item=>item.area==='DsOS').map(item=>`- **${item.name}** — ${item.state}; dependency: ${item.dependency}; activation: ${item.activation}`).join('\n')}

### Infrastructure gaps
${v1Gaps.filter(item=>item.area==='SNB Infrastructure').map(item=>`- **${item.name}** — ${item.state}; dependency: ${item.dependency}; activation: ${item.activation}`).join('\n')}

## Verification command

\`npm run beta:check\` runs lint, unit/integration/API/security/sandbox/artifact tests, frontend/backend TypeScript, production build and production dependency audit.

## Known environment limitation

Playwright specifications exist, but Chromium installation must run in a connected CI/worker because the sandbox CDN download previously returned ECONNRESET. This is not recorded as a passed E2E test.

## Release principle

No external provider, advanced engine adapter, OS image, GPU build or browser execution is marked operational until the configured infrastructure executes and its artifact/receipt passes verification.
`
await writeFile('docs/FINAL-V1-READINESS.md',report)
console.log('Generated docs/FINAL-V1-READINESS.md')
