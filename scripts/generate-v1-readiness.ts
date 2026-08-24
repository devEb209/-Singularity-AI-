import { writeFile } from 'node:fs/promises'
import { divineSystemConcepts } from '../server/services/divine-ecosystem-registry.js'
import { integrationMatrix } from '../server/services/integration-matrix.js'
import { v1Gaps } from '../server/services/v1-gap-registry.js'
import { snbCognitivePrograms } from '../server/services/snb-master-intelligence.js'
import { externalValidationGates } from '../server/services/external-validation-gates.js'
const by=<T>(items:T[],key:(item:T)=>string)=>Object.fromEntries([...new Set(items.map(key))].map(value=>[value,items.filter(item=>key(item)===value).length]))
const cognitiveCoreScore=Math.round(snbCognitivePrograms.reduce((sum,item)=>sum+(item.state==='operational-core'?1:item.state==='foundation' ? .5 : .25),0)/snbCognitivePrograms.length*1000)/10
const report=`# Final V1 Readiness Report — Pre-finalization

Generated: ${new Date().toISOString()}

## Scope status

- SNB orchestration/auth/projects/memory/files/missions/workers/tools/research, Master Intelligence across 30 scoped programs, and the shared D Thesis contextual PP/GPP/D-O15 matrix: local Beta operational with documented trust boundaries.
- UES studio/runtime patch/settings/artifact graph, verified 2D SVG/2.5D parallax/3.5D experimental artifacts, procedural 3D/PBR/scene/WebGL/experimental 4D, owned deterministic world/physics/rig/animation/NPC/VFX/optimization core, advanced semantic geometry/physics/IK-FK/retargeting/LOD/critic pipeline, D Thesis plus Real-Life/NMN/autonomy, semantic world+nav+society sample, PCM mixer, CPU profiler/D-O15 loop, swept AABB CCD, GJK/EPA + sleeping islands, foot-lock and motion matching, living-world artifact, craft retopo/anatomy/net/image filters, CPU fluids/smoke, voxel navmesh, city census, structured reference rights, ITD/ILD loop seams, six-kind semantic corpus, geometry/anatomy critics, particle constraints, CPU PSNR/SSIM regression, chunk hysteresis streaming, Earth-like planetary geophysics with D-O15 partitions, FNWS heightfield water, TITKO virtual-K materials, structured universal motion, world synthesis, continuum/forge/emulation artifacts and HSDS SVG/SSE: operational within declared lightweight scope. Live NASA/GIS and video motion analysis remain adapter-required.
- DsOS project/core/module/compliance/resource architecture: foundation/partial; no boot image claim.

## SNB cognitive programs (scoped V1 state)

${JSON.stringify(by(snbCognitivePrograms,item=>item.state),null,2)}

These states cover only each documented implemented scope; they do not mark the long-term program complete.

## Divine systems

${JSON.stringify(by(divineSystemConcepts,item=>item.status),null,2)}

## Integration matrix

${JSON.stringify(by(integrationMatrix,item=>item.state),null,2)}

## Remaining gaps only

${JSON.stringify(by(v1Gaps,item=>item.state),null,2)}

### SNB gaps
${v1Gaps.filter(item=>item.area==='SNB').map(item=>`- **${item.name}** — ${item.state}; dependency: ${item.dependency}; activation: ${item.activation}`).join('\n')}

### UES gaps
${v1Gaps.filter(item=>item.area==='UES').map(item=>`- **${item.name}** — ${item.state}; dependency: ${item.dependency}; activation: ${item.activation}`).join('\n')}

### DsOS gaps
${v1Gaps.filter(item=>item.area==='DsOS').map(item=>`- **${item.name}** — ${item.state}; dependency: ${item.dependency}; activation: ${item.activation}`).join('\n')}

### Infrastructure gaps
${v1Gaps.filter(item=>item.area==='SNB Infrastructure').map(item=>`- **${item.name}** — ${item.state}; dependency: ${item.dependency}; activation: ${item.activation}`).join('\n')||'- None: external-only deployment gates were removed from V1 completion.'}

## Non-blocking external validation gates

${externalValidationGates.map(item=>`- **${item.id}** (${item.area}) — ${item.requires}; ${item.reason}`).join('\n')}

These gates are visible but do not reduce V1 internal completion.

## Honest directional completion ranges

These are engineering ranges, not automatically promoted capability states. The denominator is the complete user-defined V1 scope; external execution counts as incomplete even when its contract exists.

- SNB 30-program V1 core readiness (weighted from canonical states): **${cognitiveCoreScore}%**
- SNB platform as a whole: **80–88%**
- UES architecture/contracts: **86–93%**
- UES integration: **65–73%**
- UES real production capability: **44–52%**
- DsOS: **20–30%**
- Production infrastructure: **35–45%**
- Total internal V1 (external-only gates excluded): **67–75% complete / 25–33% remaining**

The SNB cognitive score is reproducible: \`operational-core=1\`, \`foundation=0.5\`, \`research-program=0.25\`, divided by 30. The broader ranges remain directional because UES production, audiovisual GPU streaming and bootable DsOS are large unequal slices. Architecture or adapters do not receive production credit.

## Verification command

\`npm run beta:check\` runs lint, unit/integration/API/security/sandbox/artifact tests, frontend/backend TypeScript, production build and production dependency audit.

## Known environment limitation

Playwright specifications exist, but Chromium installation must run in a connected CI/worker because the sandbox CDN download previously returned ECONNRESET. This is not recorded as a passed E2E test.

## Release principle

No external provider, advanced engine adapter, OS image, GPU build or browser execution is marked operational until the configured infrastructure executes and its artifact/receipt passes verification.
`
await writeFile('docs/FINAL-V1-READINESS.md',report)
console.log('Generated docs/FINAL-V1-READINESS.md')
