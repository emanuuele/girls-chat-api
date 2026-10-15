import { test } from '@japa/runner'
import { ApiClient } from '@japa/api-client'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('Gestão de Usuários', (group) => {
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

  test('deve criar um novo usuário com sucesso', async ({ assert }) => {
    const userData = {
      email: 'novo@example.com',
      password: 'senha123',
      name: 'Usuario Novo'
    }

    const response = await client.post('/criar-usuario').json(userData)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    
    const responseBody = response.body()
    assert.exists(responseBody.user)
    assert.equal(responseBody.user.email, userData.email)
    assert.equal(responseBody.user.name, userData.name)
    assert.notExists(responseBody.user.password) // Senha não deve ser retornada
    assert.exists(responseBody.user.id)
    assert.exists(responseBody.user.createdAt)
  })

  test('deve falhar ao criar usuário com email já existente', async ({ assert }) => {
    const userData = {
      email: 'duplicado@example.com',
      password: 'senha123',
      name: 'Usuario Original'
    }

    // Criar primeiro usuário
    await client.post('/criar-usuario').json(userData)

    // Tentar criar segundo usuário com mesmo email
    const response = await client.post('/criar-usuario').json({
      email: userData.email,
      password: 'outrasenha',
      name: 'Usuario Duplicado'
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: false })
    
    const responseBody = response.body()
    assert.exists(responseBody.msg)
  })

  test('deve falhar ao criar usuário sem dados obrigatórios', async () => {
    // Teste sem email
    let response = await client.post('/criar-usuario').json({
      password: 'senha123',
      name: 'Usuario Sem Email'
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: false })

    // Teste sem password
    response = await client.post('/criar-usuario').json({
      email: 'semsenha@example.com',
      name: 'Usuario Sem Senha'
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: false })

    // Teste sem name
    response = await client.post('/criar-usuario').json({
      email: 'semnome@example.com',
      password: 'senha123'
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: false })
  })

  test('deve listar usuários exceto o próprio usuário', async ({ assert }) => {
    // Criar alguns usuários
    const usuarios = [
      { email: 'user1@example.com', password: 'senha123', name: 'Usuario 1' },
      { email: 'user2@example.com', password: 'senha123', name: 'Usuario 2' },
      { email: 'user3@example.com', password: 'senha123', name: 'Usuario 3' }
    ]

    let userIds: number[] = []
    for (const userData of usuarios) {
      const response = await client.post('/criar-usuario').json(userData)
      const user = response.body().user
      userIds.push(user.id)
    }

    // Listar usuários excluindo o primeiro
    const response = await client.get('/usuarios').qs({ userID: userIds[0] })

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    
    const responseBody = response.body()
    assert.exists(responseBody.users)
    assert.isArray(responseBody.users)
    assert.equal(responseBody.users.length, 2) // Deve retornar 2 usuários (excluindo o próprio)
    
    // Verificar se o próprio usuário não está na lista
    const returnedIds = responseBody.users.map(u => u.id)
    assert.notInclude(returnedIds, userIds[0])
    assert.include(returnedIds, userIds[1])
    assert.include(returnedIds, userIds[2])
  })

  test('deve buscar usuário por ID', async ({ assert }) => {
    const userData = {
      email: 'buscar@example.com',
      password: 'senha123',
      name: 'Usuario Para Buscar'
    }

    const createResponse = await client.post('/criar-usuario').json(userData)
    const userId = createResponse.body().user.id

    const response = await client.get(`/usuario/${userId}`)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    
    const responseBody = response.body()
    assert.exists(responseBody.user)
    assert.equal(responseBody.user.id, userId)
    assert.equal(responseBody.user.email, userData.email)
    assert.equal(responseBody.user.name, userData.name)
    assert.notExists(responseBody.user.password)
  })

  test('deve falhar ao buscar usuário com ID inexistente', async ({ assert }) => {
    const response = await client.get('/usuario/999999')

    response.assertStatus(200)
    response.assertBodyContains({ success: false })
    
    const responseBody = response.body()
    assert.exists(responseBody.msg)
  })

  test('deve atualizar perfil do usuário', async ({ assert }) => {
    // Criar usuário
    const userData = {
      email: 'atualizar@example.com',
      password: 'senha123',
      name: 'Usuario Original'
    }

    const createResponse = await client.post('/criar-usuario').json(userData)
    const userId = createResponse.body().user.id

    // Atualizar dados
    const updateData = {
      name: 'Usuario Atualizado',
      bio: 'Nova bio do usuário'
    }

    const response = await client.put(`/atualizar-usuario/${userId}`).json(updateData)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    
    const responseBody = response.body()
    assert.exists(responseBody.user)
    assert.equal(responseBody.user.name, updateData.name)
    assert.equal(responseBody.user.bio, updateData.bio)
    assert.equal(responseBody.user.email, userData.email) // Email deve permanecer o mesmo
  })

  test('deve permitir atualizar email do usuário', async ({ assert }) => {
    // Criar usuário
    const userData = {
      email: 'original@example.com',
      password: 'senha123',
      name: 'Usuario Email'
    }

    const createResponse = await client.post('/criar-usuario').json(userData)
    const userId = createResponse.body().user.id

    // Atualizar email
    const updateData = {
      email: 'novoemail@example.com'
    }

    const response = await client.put(`/atualizar-usuario/${userId}`).json(updateData)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })
    
    const responseBody = response.body()
    assert.equal(responseBody.user.email, updateData.email)
  })
})