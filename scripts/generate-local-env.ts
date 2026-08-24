import { randomBytes } from 'node:crypto'
import { writeFile } from 'node:fs/promises'

const secret=()=>randomBytes(48).toString('base64url')
const content=`NODE_ENV=development
HOST=0.0.0.0
PORT=8787
CORS_ORIGIN=http://localhost:4173,http://127.0.0.1:4173
PUBLIC_BASE_URL=http://localhost:4173
JWT_SECRET=${secret()}
MODEL_SYNC_SECRET=${secret()}
EXECUTION_RECEIPT_SECRET=${secret()}
WORKER_SECRET=${secret()}
DATABASE_PATH=./data/singularity.db
MAX_UPLOAD_BYTES=26214400
PHYSICAL_EXECUTION_ENABLED=false
WORKER_LEASE_SECONDS=30
WORKER_POLL_MS=1000
LOG_LEVEL=info
`
await writeFile('.env',content,{mode:0o600,flag:process.argv.includes('--force')?'w':'wx'})
console.log('Created .env with independent random secrets and mode 0600. Values were not printed.')
