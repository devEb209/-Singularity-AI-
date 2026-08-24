import { AppError } from '../../lib/errors.js'
const allowed=new Set(['project:read','artifact:read','artifact:write','memory:read','tool:request','network:none'])
export const validatePermissions=(permissions:string[])=>{const denied=permissions.filter(permission=>!allowed.has(permission));if(denied.length)throw new AppError('Plugin solicita permissões proibidas.',409,'PLUGIN_PERMISSION_DENIED',denied);return[...new Set(permissions)]}
