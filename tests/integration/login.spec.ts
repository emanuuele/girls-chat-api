import { test } from '@japa/runner'
import { ApiClient } from '@japa/api-client'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('Autenticação - Login', (group) => {
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

  test('deve fazer login com credenciais válidas', async ({ assert }) => {
    // Primeiro criar um usuário para teste
    const userData = {
      email: 'teste@example.com',
      password: 'senha123',
      name: 'Usuario Teste'
    }

    await client.post('/criar-usuario').json(userData)

    // Tentar fazer login
    const response = await client.post('/login').json({
      email: userData.email,
      password: userData.password
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    
    const responseBody = response.body()
    assert.exists(responseBody.user)
    assert.equal(responseBody.user.email, userData.email)
    assert.equal(responseBody.user.name, userData.name)
    assert.notExists(responseBody.user.password) // Senha não deve ser retornada
  })

  test('deve falhar no login com email inexistente', async ({ assert }) => {
    const response = await client.post('/login').json({
      email: 'inexistente@example.com',
      password: 'qualquersenha'
    })

    response.assertStatus(200) // API retorna 200 mesmo com erro
    response.assertBodyContains({ success: false })
    
    const responseBody = response.body()
    assert.exists(responseBody.msg)
  })

  test('deve falhar no login com senha incorreta', async ({ assert }) => {
    // Criar usuário
    const userData = {
      email: 'teste2@example.com',
      password: 'senha123',
      name: 'Usuario Teste 2'
    }

    await client.post('/criar-usuario').json(userData)

    // Tentar login com senha incorreta
    const response = await client.post('/login').json({
      email: userData.email,
      password: 'senhaerrada'
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: false })
    
    const responseBody = response.body()
    assert.exists(responseBody.msg)
  })

  test('deve falhar no login sem email', async () => {
    const response = await client.post('/login').json({
      password: 'senha123'
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: false })
  })

  test('deve falhar no login sem senha', async () => {
    const response = await client.post('/login').json({
      email: 'teste@example.com'
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: false })
  })
})
