import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AuthService from '../../services/AuthService'
import ChatsService from '../../services/ChatsService'
import Chat from 'App/Models/Chat'
import Message from 'App/Models/Message'

export default class PortfolioChatController {
  private authService: AuthService
  private chatsService: ChatsService

  constructor() {
    this.authService = new AuthService()
    this.chatsService = new ChatsService()
  } 

  /**
   * Inicializa o chat do portfólio
   * Cria usuário anônimo e retorna token
   */
  public async init({ request, response }: HttpContextContract) {
    try {
      let deviceId = request.input('deviceId')

      if (!deviceId) {
        deviceId = this.authService.generateDeviceId()
      }

      const { user, token } = await this.authService.getOrCreateUserToken(deviceId)

      // Criar ou buscar chat do usuário
      let chat = await Chat.query()
        .where('id_host', user.id)
        .first()

      if (!chat) {
        chat = await Chat.create({
          id_host: user.id,
        })
      }

      return response.json({
        success: true,
        token,
        deviceId,
        chatId: chat.id,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      })
    } catch (error) {
      const message = (error instanceof Error) ? error.message : String(error)
      return response.status(400).json({
        success: false,
        message
      })
    }
  }

  /**
   * Lista mensagens do chat do usuário
   */
  public async messages({ request, response }: HttpContextContract) {
    try {
      const user = (request as any).user

      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      // Buscar chat do usuário
      const chat = await Chat.query()
        .where('id_host', user.id)
        .first()

      if (!chat) {
        // Se não tiver chat, retorna lista vazia
        return response.json({
          success: true,
          chatId: null,
          messages: []
        })
      }

      // Buscar chat com mensagens usando o serviço
      const chatWithMessages = await this.chatsService.showChat(chat.id.toString(), user.id.toString())

      return response.json({
        success: true,
        chatId: chat.id,
        messages: chatWithMessages
      })
    } catch (error) {
      const message = (error instanceof Error) ? error.message : String(error)
      return response.status(400).json({
        success: false,
        message
      })
    }
  }

  /**
   * Envia uma mensagem no chat do usuário
   */
  public async send({ request, response }: HttpContextContract) {
    try {
      const user = (request as any).user
      const { text, sentTo } = request.body()

      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      if (!text) {
        throw new Error('Texto é obrigatório')
      }

      // Buscar ou criar chat do usuário
      let chat = await Chat.query()
        .where('id_host', user.id)
        .first()

      if (!chat) {
        chat = await this.chatsService.createChat(user.id, '55')
      } else {
        // Atualizar última mensagem usando o serviço
        await this.chatsService.updateLastMessage(chat.id, text)
      }

      // Criar a mensagem
      const message = await Message.create({
        id_chat: chat.id,
        text,
        sentBy: user.id,
        sentTo: sentTo || chat.id_host,
        seen: false
      })

      await message.load('sender')
      await message.load('receiver')

      return response.json({
        success: true,
        chatId: chat.id,
        message
      })
    } catch (error) {
      const message = (error instanceof Error) ? error.message : String(error)
      return response.status(400).json({
        success: false,
        message
      })
    }
  }
}
