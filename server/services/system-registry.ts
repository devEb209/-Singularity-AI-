export type SystemStatus = 'planned' | 'foundation' | 'operational'
export interface SingularitySystem { id: number; name: string; domain: string; status: SystemStatus }

const names = `Singularity World
Intelligence Foundry
Autonomous Research Civilization
Reality Simulator
Universal Creation Engine
Digital Twin
Project Civilization
Universal Software Brain
AI Operating Environment
Intelligence Marketplace
Model Evolution System
Collective Intelligence Network
Meta-Agent Architect
Intelligence Compiler
Cognitive Operating Graph
Universal Task Engine
Mission Control
Parallel Problem Solver
Intelligence Tournament
Meta-Intelligence Laboratory
Universal Knowledge Graph
Living Knowledge
Evidence Civilization
Global Research Engine
Scientific Discovery Engine
Technology Radar
Knowledge Archaeology
Contradiction Universe
Unknown Map
Knowledge Synthesis Engine
Universal Developer
Autonomous Software Factory
Code Universe
Software Simulation Lab
Bug Universe
Legacy Resurrection
Cross-Engine Development System
Universal Build Factory
Software Archaeologist
Software Evolution Engine
Full Game Genesis
Specification-to-Game
Creative Autonomy Engine
AAA Game Factory
Rapid Game Forge
Deep Game Forge
Game Director
Game Universe Generator
World Simulation Engine
NPC Civilization
Dynamic Story Civilization
Game Balance Simulator
Player Simulation Civilization
Infinite Content Engine
Procedural World Civilization
Engine Genesis
Universal Engine Architect
Engine Compiler
Engine Module Factory
Rendering Engine Forge
Physics Engine Forge
Animation Engine Forge
Audio Engine Forge
Networking Engine Forge
AI Engine Forge
Editor Genesis
Shader Engine Forge
Asset Pipeline Forge
Engine Optimization Laboratory
Engine Evolution System
3D Universe
AAA 3D Genesis
Universal Object Generator
Character Genesis
Creature Genesis
Environment Genesis
Architecture Genesis
Material Laboratory
PBR Universe
Photorealistic Reconstruction
Semantic 3D Universe
3D Evolution Engine
Virtual Manufacturing Lab
Physical Intelligence Studio
Universal Asset Factory
Animation Civilization
Advanced Motion System
Blender Intelligence
Motion Retargeting Civilization
Facial Animation System
Image Intelligence Factory
Video Intelligence Factory
Audio Intelligence Factory
Cinematic Director
Virtual Camera System
Automatic Lighting Director
Texture Civilization
Asset Quality Inspector
Universal Asset Converter
Creative Pipeline Manager
Autonomous QA Civilization
Bug Hunter Swarm
Regression Intelligence
Performance Intelligence
Security Analysis System
Self-Repair Pipeline
Failure Analysis Engine
Autonomous Debugging Loop
Quality Gate System
Continuous Verification Engine
Universal Project Manager
Project Memory Civilization
Cross-Project Knowledge
Universal Integration Layer
Software Connector Factory
IDE Intelligence
Game Engine Intelligence
Browser Intelligence
File Intelligence
Universal API Bridge
Total Shared Context
Long-Term Memory
Episodic Memory
Semantic Memory
Model Registry
Dynamic Tier System
Intelligent Model Router
Provider Adapter System
Intelligent Fallback
Recovery/Rollback System
Model Benchmark Civilization
Capability Profiler
Routing Learning System
Prompt/Instruction Optimization
Agent Benchmarking
Workflow Evolution
Self-Evaluation System
Multi-Agent Peer Review
Knowledge Refresh Engine
Singularity Evolution Core
Universal Simulation Laboratory
Digital Twin Projects
Parallel Reality Builder
Autonomous Optimization Civilization
Universal Creation Graph
Intelligence Memory Fabric
Singularity Control Plane
Singularity API
Singularity Autonomous Factory
Singularity Intelligence Fabric`.split('\n')

const domains = ['Núcleo de inteligência','Meta-inteligência','Conhecimento','Software','Criação de jogos','Mundo, gameplay e engines','Engine avançada','3D','3D avançado e animação','Multimídia e produção','Testes e autonomia','Projetos e integração','Memória, modelos e fallback','Evolução','Camada final']
const operational = new Set([119,125,128,148])
const foundation = new Set([1,5,6,7,9,11,12,14,16,17,18,19,21,22,23,24,29,30,31,32,33,34,35,38,39,40,71,78,79,85,91,92,93,98,99,100,101,103,104,105,106,107,108,109,110,111,112,113,114,120,121,122,123,124,126,127,129,130,131,132,133,135,137,138,139,140,141,143,145,146,147,149,150])

export const singularitySystems: SingularitySystem[] = names.map((name, index) => {
  const id = index + 1
  return { id, name, domain: domains[Math.floor(index / 10)], status: operational.has(id) ? 'operational' : foundation.has(id) ? 'foundation' : 'planned' }
})

if (singularitySystems.length !== 150) throw new Error(`System Registry inválido: esperado 150, recebido ${singularitySystems.length}.`)

export function systemSummary() {
  return { total: singularitySystems.length, operational: singularitySystems.filter(item => item.status === 'operational').length, foundation: singularitySystems.filter(item => item.status === 'foundation').length, planned: singularitySystems.filter(item => item.status === 'planned').length, domains }
}
