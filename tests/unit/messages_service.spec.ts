import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import Chat from 'App/Models/Chat'
import Message from 'App/Models/Message'
import MessagesService from 'App/services/MessagesService'

test.group('MessagesService', (group) => {
  let messagesService: MessagesService
  let user1: User
  let user2: User
  let chat: Chat

  group.setup(async () => {
    messagesService = new MessagesService()
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

    // Criar chat de teste
    chat = await Chat.create({
      id_host: user1.id,
      participant: user2.id,
      last_message: 'Initial message',
      last_message_at: DateTime.now()
    })
  })

  group.each.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve buscar mensagens por ID do chat', async ({ assert }) => {
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

    const messages = await messagesService.getMessagesByChatID(chat.id.toString())

    assert.isArray(messages)
    assert.lengthOf(messages, 2)
    assert.equal(messages[0].text, 'Primeira mensagem')
    assert.equal(messages[1].text, 'Segunda mensagem')
    
    // Verificar ordenação por created_at
    assert.isTrue(messages[0].createdAt <= messages[1].createdAt)
  })

  test('deve falhar ao buscar mensagens sem ID do chat', async ({ assert }) => {
    try {
      await messagesService.getMessagesByChatID('')
      assert.fail('Deveria ter lançado erro para chatID vazio')
    } catch (error) {
      assert.include(error.message, 'O ID do chat é obrigatório')
    }
  })

  test('deve criar uma nova mensagem', async ({ assert }) => {
    const messageData = {
      sentBy: user1.id.toString(),
      sentTo: user2.id.toString(),
      text: 'Nova mensagem de teste'
    }

    const newMessage = await messagesService.createMessage(chat.id, messageData)

    assert.exists(newMessage.id)
    assert.equal(newMessage.id_chat, chat.id)
    assert.equal(newMessage.sentBy, user1.id)
    assert.equal(newMessage.sentTo, user2.id)
    assert.equal(newMessage.text, 'Nova mensagem de teste')
    assert.isFalse(newMessage.seen) // Default should be false
  })

  test('deve criar mensagem e chat se chatID não for fornecido', async ({ assert }) => {
    const user3 = await User.create({
      email: 'user3@test.com',
      password: 'password123',
      name: 'User Three'
    })

    const messageData = {
      sentBy: user1.id.toString(),
      sentTo: user3.id.toString(),
      text: 'Primeira mensagem entre esses usuários'
    }

    const newMessage = await messagesService.createMessage(0, messageData)

    assert.exists(newMessage.id)
    assert.exists(newMessage.id_chat)
    assert.equal(newMessage.sentBy, user1.id)
    assert.equal(newMessage.sentTo, user3.id)
    assert.equal(newMessage.text, 'Primeira mensagem entre esses usuários')
    
    // Verificar se o chat foi criado
    const createdChat = await Chat.find(newMessage.id_chat)
    assert.exists(createdChat)
  })

  test('deve falhar ao criar mensagem sem campos obrigatórios', async ({ assert }) => {
    // Teste sem sentBy
    try {
      await messagesService.createMessage(chat.id, {
        sentBy: '',
        sentTo: user2.id.toString(),
        text: 'Teste'
      })
      assert.fail('Deveria ter lançado erro para sentBy vazio')
    } catch (error) {
      assert.include(error.message, 'Os campos sentBy, sentTo e text são obrigatórios')
    }

    // Teste sem sentTo
    try {
      await messagesService.createMessage(chat.id, {
        sentBy: user1.id.toString(),
        sentTo: '',
        text: 'Teste'
      })
      assert.fail('Deveria ter lançado erro para sentTo vazio')
    } catch (error) {
      assert.include(error.message, 'Os campos sentBy, sentTo e text são obrigatórios')
    }

    // Teste sem text
    try {
      await messagesService.createMessage(chat.id, {
        sentBy: user1.id.toString(),
        sentTo: user2.id.toString(),
        text: ''
      })
      assert.fail('Deveria ter lançado erro para text vazio')
    } catch (error) {
      assert.include(error.message, 'Os campos sentBy, sentTo e text são obrigatórios')
    }
  })

  test('deve atualizar status de visualização das mensagens', async ({ assert }) => {
    // Criar algumas mensagens não visualizadas
    await Message.create({
      id_chat: chat.id,
      text: 'Mensagem 1',
      seen: false,
      sentBy: user1.id,
      sentTo: user2.id
    })

    await Message.create({
      id_chat: chat.id,
      text: 'Mensagem 2',
      seen: false,
      sentBy: user1.id,
      sentTo: user2.id
    })

    await messagesService.updateMessageSeenStatus(chat.id.toString())

    // Verificar se todas as mensagens foram marcadas como vistas
    const messages = await Message.query().where('id_chat', chat.id)
    for (const message of messages) {
      assert.isTrue(message.seen)
    }
  })

  test('deve falhar ao atualizar status sem ID do chat', async ({ assert }) => {
    try {
      await messagesService.updateMessageSeenStatus('')
      assert.fail('Deveria ter lançado erro para chatID vazio')
    } catch (error) {
      assert.include(error.message, 'O ID do chat é obrigatório')
    }
  })

  test('deve falhar ao atualizar status de chat inexistente', async ({ assert }) => {
    try {
      await messagesService.updateMessageSeenStatus('999999')
      assert.fail('Deveria ter lançado erro para chat inexistente')
    } catch (error) {
      assert.include(error.message, 'Chat não encontrado')
    }
  })
})
