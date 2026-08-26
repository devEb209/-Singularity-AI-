import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { config } from './config.js'
import { SQLiteStore } from './repositories/sqlite-store.js'
import { MissionEngine } from './services/mission-engine.js'
import { ToolEcosystem } from './services/tool-ecosystem.js'
import { PersistentWorkerRuntime, WorkerCoordinator } from './services/worker-runtime.js'

const databasePath=resolve(config.DATABASE_PATH);mkdirSync(dirname(databasePath),{recursive:true})
const store=new SQLiteStore(databasePath)
const missions=new MissionEngine(store)
const tools=new ToolEcosystem(store,config.EXECUTION_RECEIPT_SECRET,config.PHYSICAL_EXECUTION_ENABLED)
const coordinator=new WorkerCoordinator(store,config.WORKER_LEASE_SECONDS)
const worker=coordinator.register(process.env.WORKER_ID??'worker-local-tools',process.env.WORKER_NAME??'Local Safe Tool Worker',['tool'])
const runtime=new PersistentWorkerRuntime(worker.id,coordinator,store,missions,tools)

console.log(JSON.stringify({event:'worker.started',workerId:worker.id,capabilities:worker.capabilities}))
const shutdown=()=>{runtime.stop();store.close();process.exit(0)}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown)
await runtime.run(config.WORKER_POLL_MS)
