import { test } from '@japa/runner'
import { ApiClient } from '@japa/api-client'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('Notificações Push', (group) => {
  let client: ApiClient
  let usuarioId: number

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
    
    // Criar usuário para os testes
    const userResponse = await client.post('/criar-usuario').json({
      email: 'pushuser@example.com',
      password: 'senha123',
      name: 'Usuario Push Notifications'
    })
    usuarioId = userResponse.body().user.id
  })

  test('deve registrar token de push notification', async ({ assert }) => {
    const tokenData = {
      userID: usuarioId,
      token: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]'
    }

    const response = await client.post('/registrar-push-token').json(tokenData)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    
    const responseBody = response.body()
    assert.exists(responseBody.msg)
    assert.include(responseBody.msg, 'registrado')
  })

  test('deve falhar ao registrar token sem userID', async ({ assert }) => {
    const response = await client.post('/registrar-push-token').json({
      token: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]'
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: false })
    
    const responseBody = response.body()
    assert.exists(responseBody.msg)
  })

  test('deve falhar ao registrar token sem token', async ({ assert }) => {
    const response = await client.post('/registrar-push-token').json({
      userID: usuarioId
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: false })
    
    const responseBody = response.body()
    assert.exists(responseBody.msg)
  })

  test('deve atualizar token existente para o mesmo usuário', async ({ assert }) => {
    // Registrar primeiro token
    await client.post('/registrar-push-token').json({
      userID: usuarioId,
      token: 'ExponentPushToken[token-antigo]'
    })

    // Registrar novo token para o mesmo usuário
    const response = await client.post('/registrar-push-token').json({
      userID: usuarioId,
      token: 'ExponentPushToken[token-novo]'
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    
    const responseBody = response.body()
    assert.exists(responseBody.msg)
    assert.include(responseBody.msg, 'atualizado')
  })

  test('deve remover token de push notification', async ({ assert }) => {
    // Primeiro registrar um token
    await client.post('/registrar-push-token').json({
      userID: usuarioId,
      token: 'ExponentPushToken[para-remover]'
    })

    // Remover o token
    const response = await client.post('/remover-push-token').json({
      userID: usuarioId
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    
    const responseBody = response.body()
    assert.exists(responseBody.msg)
    assert.include(responseBody.msg, 'removido')
  })

  test('deve falhar ao remover token sem userID', async ({ assert }) => {
    const response = await client.post('/remover-push-token').json({})

    response.assertStatus(200)
    response.assertBodyContains({ success: false })
    
    const responseBody = response.body()
    assert.exists(responseBody.msg)
  })

  test('deve conseguir remover token mesmo se não existir', async () => {
    // Tentar remover token de usuário sem token registrado
    const response = await client.post('/remover-push-token').json({
      userID: usuarioId
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
  })
})

test.group('Upload de Arquivos', (group) => {
  let client: ApiClient

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
  })

  test('deve ter endpoint de upload de arquivo funcional', async ({ assert }) => {
    // Teste básico de estrutura do endpoint
    // Nota: Para teste completo seria necessário mock do Firebase Storage
    
    const response = await client.post('/upload-arquivo')
      .field('fileName', 'test-image.jpg')

    // Como não temos arquivo real, deve retornar erro apropriado
    response.assertStatus(200)
    
    const responseBody = response.body()
    // Deve ter alguma resposta estruturada (success true ou false)
    assert.exists(responseBody)
  })

  test('endpoint de upload deve estar acessível', async ({ assert }) => {
    // Verifica se o endpoint existe e não retorna 404
    const response = await client.post('/upload-arquivo')

    // Não deve ser 404 (endpoint não encontrado)
    assert.notEqual(response.response.status, 404)
  })
})