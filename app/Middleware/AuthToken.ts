import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AuthService from 'App/services/AuthService'

export default class AuthToken {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    try {
      // Extrai o token do header Authorization
      const authHeader = request.header('Authorization')
      
      if (!authHeader) {
        // Se não houver token, retorna erro
        return response.status(401).json({
          success: false,
          message: 'Token não fornecido. Use GET /init-chat para obter um token.'
        })
      }

      // Remove "Bearer " do começo se existir
      const token = authHeader.replace(/^Bearer\s+/i, '')
      
      if (!token) {
        return response.status(401).json({
          success: false,
          message: 'Token inválido'
        })
      }

      // Valida o token
      const authService = new AuthService()
      const user = await authService.validateToken(token)
      
      // Adiciona o usuário ao contexto da requisição
      ;(request as any).user = user

      await next()
    } catch (error) {
      return response.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Token inválido'
      })
    }
  }
}
