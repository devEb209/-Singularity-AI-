import { AppError } from '../../lib/errors.js'
import type { InstalledPlugin } from './types.js'
export const transitionPlugin=(plugin:InstalledPlugin,next:InstalledPlugin['status'])=>{const valid=plugin.status==='installed'?['enabled','disabled']:plugin.status==='enabled'?['disabled']:['enabled'];if(!valid.includes(next))throw new AppError(`Transição ${plugin.status} → ${next} inválida.`,409,'PLUGIN_LIFECYCLE_INVALID');plugin.status=next;plugin.updatedAt=new Date().toISOString();return plugin}
