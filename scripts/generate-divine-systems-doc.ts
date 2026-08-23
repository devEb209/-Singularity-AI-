import { writeFile } from 'node:fs/promises'
import { divineSystemConcepts } from '../server/services/divine-ecosystem-registry.js'
let output='# 60 Divine Ecosystem Systems\n\nThese are canonical concepts with honest implementation status.\n'
for(const area of ['engine','os'] as const){output+=`\n## ${area==='engine'?'Divine Engine':'Divine Singularity OS'} — 30 systems\n\n`;divineSystemConcepts.filter(item=>item.area===area).forEach((item,index)=>{output+=`${index+1}. **${item.name}** — ${item.purpose}  \n   Status: \`${item.status}\`\n`})}
await writeFile('docs/DIVINE-60-SYSTEMS.md',output)
