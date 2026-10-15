import { test } from '@japa/runner'
import { ApiClient } from '@japa/api-client'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('Gestão de Mensagens', (group) => {
  let client: ApiClient
  let usuario1Id: number
  let usuario2Id: number
  let chatId: number

  // Setup para cada grupo de testes
  group.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  // Cleanup após cada grupo de testes
  group.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  // Setup para cada teste individual
  group.each.setup(async ({ context }) => {
    client = context.client
    
    // Criar usuários para os testes
    const user1Response = await client.post('/criar-usuario').json({
      email: 'sender@example.com',
      password: 'senha123',
      name: 'Usuario Sender'
    })
    usuario1Id = user1Response.body().user.id

    const user2Response = await client.post('/criar-usuario').json({
      email: 'receiver@example.com',
      password: 'senha123',
      name: 'Usuario Receiver'
    })
    usuario2Id = user2Response.body().user.id

    // Criar chat entre os usuários
    const chatResponse = await client.post('/criar-chat').json({
      hostID: usuario1Id,
      participantID: usuario2Id
    })
    chatId = chatResponse.body().chat.id
  })

  test('deve enviar uma mensagem de texto simples', async ({ assert }) => {
    const mensagemData = {
      chatID: chatId,
      mensagem: 'Olá! Como você está?',
      senderID: usuario1Id,
      fileURL: '',
      fileType: 'text'
    }

    const response = await client.post('/nova-mensagem').json(mensagemData)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    
    const responseBody = response.body()
    assert.exists(responseBody.mensagem)
    assert.equal(responseBody.mensagem.mensagem, mensagemData.mensagem)
    assert.equal(responseBody.mensagem.id_sender, usuario1Id)
    assert.equal(responseBody.mensagem.id_chat, chatId)
    assert.equal(responseBody.mensagem.tipo, 'text')
    assert.exists(responseBody.mensagem.createdAt)
  })

  test('deve enviar uma mensagem com arquivo/imagem', async ({ assert }) => {
    const mensagemData = {
      chatID: chatId,
      mensagem: 'Imagem enviada',
      senderID: usuario1Id,
      fileURL: 'https://example.com/image.jpg',
      fileType: 'image'
    }

    const response = await client.post('/nova-mensagem').json(mensagemData)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    
    const responseBody = response.body()
    assert.exists(responseBody.mensagem)
    assert.equal(responseBody.mensagem.mensagem, mensagemData.mensagem)
    assert.equal(responseBody.mensagem.url_file, mensagemData.fileURL)
    assert.equal(responseBody.mensagem.tipo, 'image')
  })

  test('deve falhar ao enviar mensagem sem chatID', async ({ assert }) => {
    const response = await client.post('/nova-mensagem').json({
      mensagem: 'Mensagem sem chat',
      senderID: usuario1Id,
      fileURL: '',
      fileType: 'text'
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: false })
    
    const responseBody = response.body()
    assert.exists(responseBody.msg)
  })

  test('deve falhar ao enviar mensagem sem senderID', async ({ assert }) => {
    const response = await client.post('/nova-mensagem').json({
      chatID: chatId,
      mensagem: 'Mensagem sem sender',
      fileURL: '',
      fileType: 'text'
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: false })
    
    const responseBody = response.body()
    assert.exists(responseBody.msg)
  })

  test('deve falhar ao enviar mensagem vazia', async ({ assert }) => {
    const response = await client.post('/nova-mensagem').json({
      chatID: chatId,
      mensagem: '',
      senderID: usuario1Id,
      fileURL: '',
      fileType: 'text'
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: false })
    
    const responseBody = response.body()
    assert.exists(responseBody.msg)
  })

  test('deve listar mensagens de um chat', async ({ assert }) => {
    // Enviar algumas mensagens primeiro
    await client.post('/nova-mensagem').json({
      chatID: chatId,
      mensagem: 'Primeira mensagem',
      senderID: usuario1Id,
      fileURL: '',
      fileType: 'text'
    })

    await client.post('/nova-mensagem').json({
      chatID: chatId,
      mensagem: 'Segunda mensagem',
      senderID: usuario2Id,
      fileURL: '',
      fileType: 'text'
    })

    // Listar mensagens do chat
    const response = await client.get('/mensagens').qs({
      chatID: chatId
    }).header('expo-push-token', 'test-token') // Header necessário para o middleware

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    
    const responseBody = response.body()
    assert.exists(responseBody.mensagens)
    assert.isArray(responseBody.mensagens)
    assert.isAtLeast(responseBody.mensagens.length, 2)
    
    // Verificar se as mensagens estão ordenadas por data
    const mensagens = responseBody.mensagens
    assert.equal(mensagens[0].mensagem, 'Primeira mensagem')
    assert.equal(mensagens[1].mensagem, 'Segunda mensagem')
  })

  test('deve falhar ao listar mensagens sem chatID', async ({ assert }) => {
    const response = await client.get('/mensagens')
      .header('expo-push-token', 'test-token')

    response.assertStatus(200)
    response.assertBodyContains({ success: false })
    
    const responseBody = response.body()
    assert.exists(responseBody.msg)
  })

  test('deve falhar ao listar mensagens sem token expo (middleware)', async () => {
    const response = await client.get('/mensagens').qs({
      chatID: chatId
    })

    // O middleware deve bloquear a requisição
    response.assertStatus(400)
  })

  test('deve atualizar status de leitura das mensagens', async ({ assert }) => {
    // Enviar mensagem
    const mensagemResponse = await client.post('/nova-mensagem').json({
      chatID: chatId,
      mensagem: 'Mensagem para marcar como lida',
      senderID: usuario1Id,
      fileURL: '',
      fileType: 'text'
    })
    const mensagemId = mensagemResponse.body().mensagem.id

    // Atualizar status de leitura
    const response = await client.post('/marcar-como-lida').json({
      messageID: mensagemId,
      readerID: usuario2Id
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    
    // Verificar se o status foi atualizado
    const mensagensResponse = await client.get('/mensagens').qs({
      chatID: chatId
    }).header('expo-push-token', 'test-token')
    
    const mensagens = mensagensResponse.body().mensagens
    const mensagemAtualizada = mensagens.find((m: any) => m.id === mensagemId)
    assert.isTrue(mensagemAtualizada.is_read)
  })

  test('deve falhar ao marcar mensagem como lida sem messageID', async ({ assert }) => {
    const response = await client.post('/marcar-como-lida').json({
      readerID: usuario2Id
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: false })
    
    const responseBody = response.body()
    assert.exists(responseBody.msg)
  })

  test('deve falhar ao marcar mensagem como lida sem readerID', async ({ assert }) => {
    const response = await client.post('/marcar-como-lida').json({
      messageID: 1
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: false })
    
    const responseBody = response.body()
    assert.exists(responseBody.msg)
  })

  test('deve listar mensagens não lidas de um usuário', async ({ assert }) => {
    // Enviar mensagens de diferentes usuários
    await client.post('/nova-mensagem').json({
      chatID: chatId,
      mensagem: 'Mensagem não lida 1',
      senderID: usuario1Id,
      fileURL: '',
      fileType: 'text'
    })

    await client.post('/nova-mensagem').json({
      chatID: chatId,
      mensagem: 'Mensagem não lida 2',
      senderID: usuario1Id,
      fileURL: '',
      fileType: 'text'
    })

    // Criar segundo chat para testar mensagens de diferentes chats
    const user3Response = await client.post('/criar-usuario').json({
      email: 'user3@example.com',
      password: 'senha123',
      name: 'Usuario 3'
    })
    const usuario3Id = user3Response.body().user.id

    const chat2Response = await client.post('/criar-chat').json({
      hostID: usuario3Id,
      participantID: usuario2Id
    })
    const chat2Id = chat2Response.body().chat.id

    await client.post('/nova-mensagem').json({
      chatID: chat2Id,
      mensagem: 'Mensagem de outro chat',
      senderID: usuario3Id,
      fileURL: '',
      fileType: 'text'
    })

    // Buscar mensagens não lidas para usuario2
    const response = await client.get('/mensagens-nao-lidas').qs({
      userID: usuario2Id
    }).header('expo-push-token', 'test-token')

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    
    const responseBody = response.body()
    assert.exists(responseBody.mensagensNaoLidas)
    assert.isArray(responseBody.mensagensNaoLidas)
    assert.isAtLeast(responseBody.mensagensNaoLidas.length, 3)
  })

  test('deve falhar ao buscar mensagens não lidas sem userID', async ({ assert }) => {
    const response = await client.get('/mensagens-nao-lidas')
      .header('expo-push-token', 'test-token')

    response.assertStatus(200)
    response.assertBodyContains({ success: false })
    
    const responseBody = response.body()
    assert.exists(responseBody.msg)
  })
})