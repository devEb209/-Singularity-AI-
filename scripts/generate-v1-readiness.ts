import { writeFile } from 'node:fs/promises'
import { divineSystemConcepts } from '../server/services/divine-ecosystem-registry.js'
import { integrationMatrix } from '../server/services/integration-matrix.js'
import { v1Gaps } from '../server/services/v1-gap-registry.js'
import { snbCognitivePrograms } from '../server/services/snb-master-intelligence.js'
import { externalValidationGates } from '../server/services/external-validation-gates.js'
import { generationScore } from '../server/services/snb-compete/score.js'
const by=<T>(items:T[],key:(item:T)=>string)=>Object.fromEntries([...new Set(items.map(key))].map(value=>[value,items.filter(item=>key(item)===value).length]))
const cognitiveCoreScore=Math.round(snbCognitivePrograms.reduce((sum,item)=>sum+(item.state==='operational-core'?1:item.state==='foundation' ? .5 : .25),0)/snbCognitivePrograms.length*1000)/10
const generation=generationScore()
const report=`# Final V1 Readiness Report — First generation (compete bar)

Generated: ${new Date().toISOString()}

## First generation rule

V1 is the first **generation** of SNB, not a reduced final, MVP or demo slice. It must be complete enough to **compete** when launched. V2 aims to **surpass**. See [V1-FIRST-GENERATION.md](./V1-FIRST-GENERATION.md).

Reproducible compete score (\`GET /api/v1/v1-generation\`): **${generation.percent}% complete / ${generation.remaining}% remaining**. \`complete=${generation.complete}\`. DsOS is **not** in the compete bar.

## Scope status

- SNB orchestration/auth/projects/memory/files/missions/workers/tools/research, Master Intelligence across 30 scoped programs, artifact numeric rollback, and the shared D Thesis contextual PP/GPP/D-O15 matrix: local Beta operational with documented trust boundaries.
- UES studio/runtime patch/settings/artifact graph, verified 2D SVG/2.5D parallax/3.5D experimental artifacts, procedural 3D/PBR/scene/WebGL/experimental 4D, owned deterministic world/physics/rig/animation/NPC/VFX/optimization core, advanced semantic geometry/physics/IK-FK/retargeting/LOD/critic pipeline, D Thesis plus Real-Life/NMN/autonomy, semantic world+nav+society sample, PCM mixer, CPU profiler/D-O15 loop, swept AABB CCD, GJK/EPA + sleeping islands, analytic sphere/capsule CCD, yaw vertex-arc CCD, Featherstone CRBA+RNEA planar serial, foot-lock and motion matching, living-world artifact, craft retopo/anatomy/net/image filters, CPU fluids/smoke, voxel navmesh from arbitrary/CSG meshes, hierarchical 1024/64 city lives, remote scene/timeline/undo studio, multi-round consensus receipts, city census, structured reference rights, ITD/ILD loop seams, nine-kind semantic corpus plus open-class compiler, SDF CSG/loft/sweep, geometry/anatomy critics, particle constraints, iterative kinematic CCD, CPU PSNR/SSIM regression, chunk hysteresis streaming, Earth-like planetary geophysics with D-O15 partitions, FNWS heightfield water with licensed-layer ingest, TITKO PBR prompt graphs (virtual-K, not stored 16K), structured universal motion + Explorer apply, world synthesis genres, own 3D Tiles HLOD, continuity ladder, internal GIS fixture, Kepler/sky sample, planet heightfield nav, continuum/forge/emulation/realis/kernel/atelier/genesis artifacts, UES GPU API with CPU compute, shader IR, 9-pass render graph, per-fragment Cook-Torrance radiance with ortho PCF/IBL/ACES, luminance image-to-mesh, spatial adapters without vendor lock, statistical million population, SNB toolbox/lore layers, first-generation ship gates and HSDS SVG/SSE: operational within declared lightweight scope. Live NASA/GIS/photoreal tiles, WebGPU presentation and video motion analysis remain adapter-required. RRW is the Genesis foundation (intent → knowledge → D-O15 → materialization → verification → refinement). The close loop composes biomes, holds checksummed worlds, walks extents and binds society without consciousness. Compatibility radiance/PBR does not define the architecture. Genesis is not closed.
- DsOS project/core/module/compliance/resource architecture: foundation/partial; no boot image claim; not the product that competes in V1.

## SNB cognitive programs (implemented scope only)

${JSON.stringify(by(snbCognitivePrograms,item=>item.state),null,2)}

These states cover only each documented implemented scope. They are **not** a claim that the first generation is launch-complete.

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
${v1Gaps.filter(item=>item.area==='SNB Infrastructure').map(item=>`- **${item.name}** — ${item.state}; dependency: ${item.dependency}; activation: ${item.activation}`).join('\n')||'- None listed as V1 blockers; external-only deployment remains a gate, not a fake integration.'}

## Non-blocking external validation gates

${externalValidationGates.map(item=>`- **${item.id}** (${item.area}) — ${item.requires}; ${item.reason}`).join('\n')}

These gates stay visible. They do not redefine V1 as a reduced product.

## Supporting scores (not a substitute for the compete bar)

- SNB 30-program implemented-scope score: **${cognitiveCoreScore}%**
- Compete axes: ${JSON.stringify(generation.byAxis)}
- DsOS module: **20–30%** of itself

The SNB cognitive score remains: \`operational-core=1\`, \`foundation=0.5\`, \`research-program=0.25\`, divided by 30. Architecture or adapters do not receive production credit.

## Verification command

\`npm run beta:check\` runs lint, unit/integration/API/security/sandbox/artifact tests, frontend/backend TypeScript, production build and production dependency audit.

## Known environment limitation

Playwright specifications exist, but Chromium installation must run in a connected CI/worker because the sandbox CDN download previously returned ECONNRESET. This is not recorded as a passed E2E test.

## Release principle

No external provider, advanced engine adapter, OS image, GPU build or browser execution is marked operational until the configured infrastructure executes and its artifact/receipt passes verification.
`
await writeFile('docs/FINAL-V1-READINESS.md',report)
console.log('Generated docs/FINAL-V1-READINESS.md')
