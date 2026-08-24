import { createHash, randomBytes } from 'node:crypto'
import { SignJWT, jwtVerify } from 'jose'
import { compare, hash } from 'bcryptjs'
import { id, now } from '../lib/id.js'
import { AppError, UnauthorizedError } from '../lib/errors.js'
import type { Store, StoredUser } from '../repositories/store.js'

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

export class AuthService {
  private secret: Uint8Array
  constructor(secret: string, private store: Store) { this.secret = new TextEncoder().encode(secret) }

  async register(email: string, password: string, name: string) {
    const normalized = email.trim().toLowerCase()
    const user: StoredUser = { id: id('usr'), email: normalized, name: name.trim(), passwordHash: await hash(password, 12), createdAt: now() }
    this.store.createUser(user)
    this.store.audit({ id: id('audit'), userId: user.id, action: 'auth.register', resource: 'user', createdAt: now() })
    return this.session(user, true)
  }

  async login(email: string, password: string) {
    const user = this.store.findUserByEmail(email.trim().toLowerCase())
    if (!user || !(await compare(password, user.passwordHash))) throw new UnauthorizedError('E-mail ou senha inválidos.')
    this.store.audit({ id: id('audit'), userId: user.id, action: 'auth.login', resource: 'session', createdAt: now() })
    return this.session(user, true)
  }

  async guest() {
    const user = { id: id('guest'), name: 'Guest Workspace', guest: true }
    const token = await this.accessToken(user.id, '2h')
    return { user, token, accessToken: token, expiresIn: 7200 }
  }

  async refresh(rawToken: string) {
    const tokenHash = hashToken(rawToken)
    const stored = this.store.findRefreshToken(tokenHash)
    if (!stored || stored.revokedAt || new Date(stored.expiresAt) <= new Date()) {
      if (stored?.userId) this.store.revokeUserRefreshTokens(stored.userId)
      throw new UnauthorizedError('Refresh token inválido, expirado ou reutilizado.')
    }
    const user = this.store.findUserById(stored.userId)
    if (!user) throw new UnauthorizedError()
    this.store.revokeRefreshToken(tokenHash)
    this.store.audit({ id: id('audit'), userId: user.id, action: 'auth.refresh', resource: 'session', createdAt: now() })
    return this.session(user, true)
  }

  logout(rawToken: string) { this.store.revokeRefreshToken(hashToken(rawToken)) }
  logoutAll(userId: string) { this.store.revokeUserRefreshTokens(userId) }
  requestPasswordReset(email:string,exposeDevelopmentToken=false){const user=this.store.findUserByEmail(email.trim().toLowerCase()),generic={message:'Se a conta existir, uma recuperação foi iniciada.'};if(!user)return generic;const raw=randomBytes(32).toString('base64url'),createdAt=now();this.store.savePasswordResetToken({id:id('reset'),userId:user.id,tokenHash:hashToken(raw),expiresAt:new Date(Date.now()+15*60000).toISOString(),createdAt});this.store.audit({id:id('audit'),userId:user.id,action:'auth.password_reset.requested',resource:'user',createdAt});return exposeDevelopmentToken?{...generic,developmentResetToken:raw}:generic}
  async resetPassword(rawToken:string,password:string){const tokenHash=hashToken(rawToken),token=this.store.findPasswordResetToken(tokenHash);if(!token||token.usedAt||new Date(token.expiresAt)<=new Date())throw new UnauthorizedError('Token de recuperação inválido ou expirado.');await this.store.updateUserPassword(token.userId,await hash(password,12));const usedAt=now();this.store.consumePasswordResetToken(tokenHash,usedAt);this.store.revokeUserRefreshTokens(token.userId);this.store.audit({id:id('audit'),userId:token.userId,action:'auth.password_reset.completed',resource:'user',createdAt:usedAt});return{message:'Senha atualizada. Entre novamente.'}}

  async verify(token: string) {
    try { const result = await jwtVerify(token, this.secret, { algorithms: ['HS256'], issuer: 'singularity-api', audience: 'singularity-clients' }); return String(result.payload.sub) }
    catch { throw new UnauthorizedError('Sessão inválida ou expirada.') }
  }

  private async session(user: StoredUser, includeRefresh: boolean) {
    const accessToken = await this.accessToken(user.id, '15m')
    const refreshToken = includeRefresh ? randomBytes(48).toString('base64url') : undefined
    if (refreshToken) this.store.saveRefreshToken({ id: id('rft'), userId: user.id, tokenHash: hashToken(refreshToken), expiresAt: new Date(Date.now() + 30 * 86400_000).toISOString(), createdAt: now() })
    return { user: this.publicUser(user), token: accessToken, accessToken, refreshToken, expiresIn: 900 }
  }

  private accessToken(userId: string, expiresIn: string) {
    return new SignJWT({ scope: ['workspace:read', 'workspace:write'] }).setProtectedHeader({ alg: 'HS256', typ: 'JWT' }).setSubject(userId).setIssuer('singularity-api').setAudience('singularity-clients').setIssuedAt().setJti(id('jwt')).setExpirationTime(expiresIn).sign(this.secret)
  }
  private publicUser(user: StoredUser) { return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt } }
}
