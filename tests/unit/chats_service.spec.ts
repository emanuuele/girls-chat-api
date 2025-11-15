import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import Chat from 'App/Models/Chat'
import Message from 'App/Models/Message'
import ChatsService from 'App/services/ChatsService'

test.group('ChatsService', (group) => {
  let chatsService: ChatsService
  let user1: User
  let user2: User
  let chat: Chat

  group.setup(async () => {
    chatsService = new ChatsService()
  })

  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    
    // Criar usuários de teste
    user1 = await User.create({
      email: 'user1@test.com',
      password: 'password123',
      name: 'User One'
    })
    
    user2 = await User.create({
      email: 'user2@test.com',
      password: 'password123',
      name: 'User Two'
    })
  })

  group.each.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve criar um novo chat entre dois usuários', async ({ assert }) => {
    const newChat = await chatsService.createChat(user1.id.toString(), user2.id.toString())

    assert.exists(newChat.id)
    assert.equal(newChat.id_host, user1.id)
    assert.equal(newChat.participant, user2.id)
    assert.exists(newChat.host)
    assert.exists(newChat.participantUser)
    assert.equal(newChat.host.name, 'User One')
    assert.equal(newChat.participantUser.name, 'User Two')
  })

  test('deve falhar ao tentar criar chat duplicado', async ({ assert }) => {
    // Criar primeiro chat
    await chatsService.createChat(user1.id.toString(), user2.id.toString())

    // Tentar criar chat duplicado
    try {
      await chatsService.createChat(user1.id.toString(), user2.id.toString())
      assert.fail('Deveria ter lançado erro para chat duplicado')
    } catch (error) {
      assert.include(error.message, 'Chat já existe entre esses usuários')
    }
  })

  test('deve falhar ao tentar criar chat duplicado (ordem inversa)', async ({ assert }) => {
    // Criar primeiro chat
    await chatsService.createChat(user1.id.toString(), user2.id.toString())

    // Tentar criar chat duplicado com ordem inversa
    try {
      await chatsService.createChat(user2.id.toString(), user1.id.toString())
      assert.fail('Deveria ter lançado erro para chat duplicado')
    } catch (error) {
      assert.include(error.message, 'Chat já existe entre esses usuários')
    }
  })

  test('deve falhar ao criar chat sem parâmetros obrigatórios', async ({ assert }) => {
    try {
      await chatsService.createChat('', user2.id.toString())
      assert.fail('Deveria ter lançado erro para host vazio')
    } catch (error) {
      assert.include(error.message, 'Os IDs do host e participante são obrigatórios')
    }

    try {
      await chatsService.createChat(user1.id.toString(), '')
      assert.fail('Deveria ter lançado erro para participant vazio')
    } catch (error) {
      assert.include(error.message, 'Os IDs do host e participante são obrigatórios')
    }
  })

  test('deve buscar chats de um usuário', async ({ assert }) => {
    // Criar alguns chats
    const chat1 = await Chat.create({
      id_host: user1.id,
      participant: user2.id,
      last_message: 'Primeira mensagem',
      last_message_at: DateTime.now()
    })

    const user3 = await User.create({
      email: 'user3@test.com',
      password: 'password123',
      name: 'User Three'
    })

    const chat2 = await Chat.create({
      id_host: user3.id,
      participant: user1.id,
      last_message: 'Segunda mensagem',
      last_message_at: DateTime.now()
    })

    const userChats = await chatsService.getUserChats(user1.id.toString())

    assert.isArray(userChats)
    assert.lengthOf(userChats, 2)
    
    // Verificar se ambos os chats foram retornados
    const chatIds = userChats.map(chat => chat.id)
    assert.include(chatIds, chat1.id)
    assert.include(chatIds, chat2.id)
  })

  test('deve buscar um chat específico com mensagens', async ({ assert }) => {
    // Criar chat
    chat = await Chat.create({
      id_host: user1.id,
      participant: user2.id,
      last_message: 'Mensagem de teste',
      last_message_at: DateTime.now()
    })

    // Criar algumas mensagens
    await Message.create({
      id_chat: chat.id,
      text: 'Primeira mensagem',
      seen: false,
      sentBy: user1.id,
      sentTo: user2.id
    })

    await Message.create({
      id_chat: chat.id,
      text: 'Segunda mensagem',
      seen: true,
      sentBy: user2.id,
      sentTo: user1.id
    })

    const foundChat = await chatsService.showChat(chat.id.toString())

    assert.exists(foundChat)
    assert.equal(foundChat.id, chat.id)
    assert.exists(foundChat.messages)
    assert.lengthOf(foundChat.messages, 2)
    assert.exists(foundChat.host)
    assert.exists(foundChat.participantUser)
    
    // Verificar se as mensagens têm os relacionamentos carregados
    assert.exists(foundChat.messages[0].sender)
    assert.exists(foundChat.messages[0].receiver)
  })

  test('deve falhar ao buscar chat inexistente', async ({ assert }) => {
    try {
      await chatsService.showChat('999999')
      assert.fail('Deveria ter lançado erro para chat inexistente')
    } catch (error) {
      assert.include(error.message, 'Chat não encontrado')
    }
  })

  test('deve falhar ao buscar chat sem ID', async ({ assert }) => {
    try {
      await chatsService.showChat('')
      assert.fail('Deveria ter lançado erro para ID vazio')
    } catch (error) {
      assert.include(error.message, 'O ID do chat é obrigatório')
    }
  })

  test('deve falhar ao buscar chats de usuário sem ID', async ({ assert }) => {
    try {
      await chatsService.getUserChats('')
      assert.fail('Deveria ter lançado erro para userID vazio')
    } catch (error) {
      assert.include(error.message, 'O ID do usuário é obrigatório')
    }
  })
})
