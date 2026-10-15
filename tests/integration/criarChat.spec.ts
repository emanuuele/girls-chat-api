import { test } from '@japa/runner'
import { ApiClient } from '@japa/api-client'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('Gestão de Chats', (group) => {
  let client: ApiClient
  let usuario1Id: number
  let usuario2Id: number

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
      email: 'host@example.com',
      password: 'senha123',
      name: 'Usuario Host'
    })
    usuario1Id = user1Response.body().user.id

    const user2Response = await client.post('/criar-usuario').json({
      email: 'participant@example.com',
      password: 'senha123',
      name: 'Usuario Participant'
    })
    usuario2Id = user2Response.body().user.id
  })

  test('deve criar um novo chat entre dois usuários', async ({ assert }) => {
    const chatData = {
      hostID: usuario1Id,
      participantID: usuario2Id
    }

    const response = await client.post('/criar-chat').json(chatData)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    
    const responseBody = response.body()
    assert.exists(responseBody.chat)
    assert.equal(responseBody.chat.id_host, usuario1Id)
    assert.exists(responseBody.chat.id)
    assert.exists(responseBody.chat.createdAt)
  })

  test('deve falhar ao criar chat sem hostID', async ({ assert }) => {
    const response = await client.post('/criar-chat').json({
      participantID: usuario2Id
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: false })
    
    const responseBody = response.body()
    assert.exists(responseBody.msg)
  })

  test('deve falhar ao criar chat sem participantID', async ({ assert }) => {
    const response = await client.post('/criar-chat').json({
      hostID: usuario1Id
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: false })
    
    const responseBody = response.body()
    assert.exists(responseBody.msg)
  })

  test('deve falhar ao criar chat com usuários inexistentes', async ({ assert }) => {
    const response = await client.post('/criar-chat').json({
      hostID: 999999,
      participantID: 999998
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: false })
    
    const responseBody = response.body()
    assert.exists(responseBody.msg)
  })

  test('deve buscar detalhes de um chat específico', async ({ assert }) => {
    // Primeiro criar um chat
    const chatResponse = await client.post('/criar-chat').json({
      hostID: usuario1Id,
      participantID: usuario2Id
    })
    const chatId = chatResponse.body().chat.id

    // Buscar detalhes do chat
    const response = await client.get('/chat').qs({
      id: chatId,
      userID: usuario1Id
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    
    const responseBody = response.body()
    assert.exists(responseBody.chat)
    assert.equal(responseBody.chat.id, chatId)
    assert.equal(responseBody.chat.id_host, usuario1Id)
  })

  test('deve falhar ao buscar chat inexistente', async ({ assert }) => {
    const response = await client.get('/chat').qs({
      id: 999999,
      userID: usuario1Id
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: false })
    
    const responseBody = response.body()
    assert.exists(responseBody.msg)
  })

  test('deve listar chats do usuário', async ({ assert }) => {
    // Criar alguns chats
    await client.post('/criar-chat').json({
      hostID: usuario1Id,
      participantID: usuario2Id
    })

    // Criar usuário adicional para segundo chat
    const user3Response = await client.post('/criar-usuario').json({
      email: 'user3@example.com',
      password: 'senha123',
      name: 'Usuario 3'
    })
    const usuario3Id = user3Response.body().user.id

    await client.post('/criar-chat').json({
      hostID: usuario1Id,
      participantID: usuario3Id
    })

    // Listar chats do usuário 1
    const response = await client.get('/chats').qs({
      userID: usuario1Id
    }).header('expo-push-token', 'test-token') // Header necessário para o middleware

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    
    const responseBody = response.body()
    assert.exists(responseBody.chats)
    assert.isArray(responseBody.chats)
    assert.isAtLeast(responseBody.chats.length, 2)
  })

  test('deve falhar ao listar chats sem userID', async ({ assert }) => {
    const response = await client.get('/chats')
      .header('expo-push-token', 'test-token')

    response.assertStatus(200)
    response.assertBodyContains({ success: false })
    
    const responseBody = response.body()
    assert.exists(responseBody.msg)
  })

  test('deve falhar ao listar chats sem token expo (middleware)', async () => {
    const response = await client.get('/chats').qs({
      userID: usuario1Id
    })

    // O middleware deve bloquear a requisição
    response.assertStatus(400)
  })
})
