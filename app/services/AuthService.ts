import { randomBytes } from 'crypto'
import User from 'App/Models/User'

export default class AuthService {
  /**
   * Cria um usuário anônimo e retorna seu token
   * Se o device já existe, retorna o token existente
   */
  public async getOrCreateUserToken(deviceId: string): Promise<{ user: User; token: string }> {
    try {
      // Tenta encontrar usuário existente com esse deviceId
      let user = await User.query()
        .where('device_id', deviceId)
        .first()

      // Se existe e tem token válido, retorna
      if (user && user.auth_token) {
        return { user, token: user.auth_token }
      }

      // Se não existe, cria novo usuário anônimo
      if (!user) {
        const anonymousName = `User_${Math.random().toString(36).substr(2, 5)}`
        const anonymousEmail = `${anonymousName.toLowerCase()}@portfolio-chat.local`
        const anonymousPassword = randomBytes(16).toString('hex')

        user = await User.create({
          name: anonymousName,
          email: anonymousEmail,
          password: anonymousPassword,
          device_id: deviceId,
          auth_token: randomBytes(32).toString('hex')
        })
      } else {
        // Usuário existe mas sem token, cria novo
        user.auth_token = randomBytes(32).toString('hex')
        await user.save()
      }

      return { user, token: user.auth_token }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      throw new Error(`Erro ao obter/criar token: ${message}`)
    }
  }

  /**
   * Valida um token e retorna o usuário associado
   */
  public async validateToken(token: string): Promise<User> {
    try {
      const user = await User.query()
        .where('auth_token', token)
        .first()

      if (!user) {
        throw new Error('Token inválido')
      }

      return user
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      throw new Error(`Erro ao validar token: ${message}`)
    }
  }

  /**
   * Gera um device ID único
   */
  public generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
