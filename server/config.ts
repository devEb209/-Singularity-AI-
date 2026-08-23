import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(8787),
  CORS_ORIGIN: z.string().default('http://localhost:4173,http://127.0.0.1:4173'),
  PUBLIC_BASE_URL: z.string().url().default('http://localhost:4173'),
  JWT_SECRET: z.string().min(32).default('development-only-secret-change-before-production'),
  DATABASE_PATH: z.string().default('./data/singularity.db'),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(25 * 1024 * 1024),
  MODEL_SYNC_SECRET: z.string().min(32).default('development-model-sync-secret-change-me'),
  EXECUTION_RECEIPT_SECRET: z.string().min(32).default('development-receipt-secret-change-me-now'),
  PHYSICAL_EXECUTION_ENABLED: z.enum(['true','false']).default('false').transform(value => value === 'true'),
  WORKER_SECRET: z.string().min(32).default('development-worker-secret-change-me-now'),
  WORKER_LEASE_SECONDS: z.coerce.number().int().min(10).max(600).default(30),
  WORKER_POLL_MS: z.coerce.number().int().min(100).max(60000).default(1000),
  AI_BASE_URL: z.string().url().optional(),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().default('singularity-main'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
})

export type Config = z.infer<typeof schema>
export const config = schema.parse(process.env)

if(config.NODE_ENV==='production'){
  const insecure=[config.JWT_SECRET,config.MODEL_SYNC_SECRET,config.EXECUTION_RECEIPT_SECRET,config.WORKER_SECRET].some(value=>value.startsWith('development-'))
  if(insecure)throw new Error('Production startup refused: replace all development secrets.')
  if(config.CORS_ORIGIN==='*')throw new Error('Production startup refused: wildcard CORS is forbidden.')
  if(!config.PUBLIC_BASE_URL.startsWith('https://'))throw new Error('Production startup refused: PUBLIC_BASE_URL must use HTTPS.')
}
