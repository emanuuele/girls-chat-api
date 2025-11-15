import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import UserService from 'App/services/UserService'

test.group('UserService', (group) => {
  let userService: UserService

  group.setup(async () => {
    userService = new UserService()
  })

  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('deve criar um novo usuário', async ({ assert }) => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    }

    const newUser = await userService.createUser(userData.email, userData.password, userData.name)

    assert.exists(newUser.id)
    assert.equal(newUser.email, userData.email)
    assert.equal(newUser.name, userData.name)
    assert.exists(newUser.password) // Password should be hashed
    assert.notEqual(newUser.password, userData.password) // Should not be plain text
  })

  test('deve falhar ao criar usuário com email duplicado', async ({ assert }) => {
    const userData = {
      email: 'duplicate@example.com',
      password: 'password123',
      name: 'First User'
    }

    // Criar primeiro usuário
    await userService.createUser(userData.email, userData.password, userData.name)

    // Tentar criar usuário com mesmo email
    try {
      await userService.createUser(userData.email, 'differentpassword', 'Second User')
      assert.fail('Deveria ter lançado erro para email duplicado')
    } catch (error) {
      assert.include(error.message, 'E-mail já cadastrado')
    }
  })

  test('deve falhar ao criar usuário com campos obrigatórios vazios', async ({ assert }) => {
    // Teste sem email
    try {
      await userService.createUser('', 'password123', 'Test User')
      assert.fail('Deveria ter lançado erro para email vazio')
    } catch (error) {
      assert.include(error.message, 'Preencha todos os campos corretamente')
    }

    // Teste sem password
    try {
      await userService.createUser('test@example.com', '', 'Test User')
      assert.fail('Deveria ter lançado erro para password vazio')
    } catch (error) {
      assert.include(error.message, 'Preencha todos os campos corretamente')
    }

    // Teste sem name
    try {
      await userService.createUser('test@example.com', 'password123', '')
      assert.fail('Deveria ter lançado erro para name vazio')
    } catch (error) {
      assert.include(error.message, 'Preencha todos os campos corretamente')
    }
  })

  test('deve falhar ao criar usuário com email inválido', async ({ assert }) => {
    try {
      await userService.createUser('invalid-email', 'password123', 'Test User')
      assert.fail('Deveria ter lançado erro para email inválido')
    } catch (error) {
      assert.include(error.message, 'Preencha todos os campos corretamente')
    }
  })

  test('deve buscar usuário por email e senha', async ({ assert }) => {
    // Primeiro criar um usuário
    const userData = {
      email: 'login@example.com',
      password: 'password123',
      name: 'Login User'
    }

    const createdUser = await userService.createUser(userData.email, userData.password, userData.name)

    // Agora tentar fazer login
    const foundUser = await userService.getUserByEmailAndPassword(userData.email, userData.password)

    assert.exists(foundUser)
    assert.equal(foundUser.id, createdUser.id)
    assert.equal(foundUser.email, userData.email)
    assert.equal(foundUser.name, userData.name)
  })

  test('deve falhar ao buscar usuário com credenciais inválidas', async ({ assert }) => {
    // Tentar login com usuário inexistente
    try {
      await userService.getUserByEmailAndPassword('nonexistent@example.com', 'password123')
      assert.fail('Deveria ter lançado erro para usuário inexistente')
    } catch (error) {
      assert.include(error.message, 'Usuário não encontrado')
    }
  })

  test('deve falhar ao buscar usuário com campos vazios', async ({ assert }) => {
    try {
      await userService.getUserByEmailAndPassword('', 'password123')
      assert.fail('Deveria ter lançado erro para email vazio')
    } catch (error) {
      assert.include(error.message, 'Preencha o campo senha e e-mail corretamente')
    }

    try {
      await userService.getUserByEmailAndPassword('test@example.com', '')
      assert.fail('Deveria ter lançado erro para password vazio')
    } catch (error) {
      assert.include(error.message, 'Preencha o campo senha e e-mail corretamente')
    }
  })

  test('deve atualizar dados do usuário', async ({ assert }) => {
    // Criar usuário
    const user = await User.create({
      email: 'update@example.com',
      password: 'hashedpassword',
      name: 'Original Name'
    })

    const updatedData = {
      name: 'Updated Name',
      email: 'updated@example.com'
    }

    const updatedUser = await userService.updateUser(user.id.toString(), updatedData)

    assert.equal(updatedUser.id, user.id)
    assert.equal(updatedUser.name, 'Updated Name')
    assert.equal(updatedUser.email, 'updated@example.com')
  })

  test('deve falhar ao atualizar usuário inexistente', async ({ assert }) => {
    try {
      await userService.updateUser('999999', { name: 'New Name' })
      assert.fail('Deveria ter lançado erro para usuário inexistente')
    } catch (error) {
      assert.include(error.message, 'Usuário não encontrado')
    }
  })

  test('deve falhar ao atualizar usuário sem ID', async ({ assert }) => {
    try {
      await userService.updateUser('', { name: 'New Name' })
      assert.fail('Deveria ter lançado erro para ID vazio')
    } catch (error) {
      assert.include(error.message, 'O ID do usuário é obrigatório')
    }
  })

  test('deve buscar todos os usuários exceto o especificado', async ({ assert }) => {
    // Criar alguns usuários
    const user1 = await User.create({
      email: 'user1@example.com',
      password: 'password',
      name: 'User 1'
    })

    const user2 = await User.create({
      email: 'user2@example.com',
      password: 'password',
      name: 'User 2'
    })

    const user3 = await User.create({
      email: 'user3@example.com',
      password: 'password',
      name: 'User 3'
    })

    const users = await userService.getAllUsersExcept(user1.id.toString())

    assert.isArray(users)
    assert.lengthOf(users, 2)
    
    const userIds = users.map(user => user.id)
    assert.include(userIds, user2.id)
    assert.include(userIds, user3.id)
    assert.notInclude(userIds, user1.id)
  })

  test('deve falhar ao buscar usuários sem ID especificado', async ({ assert }) => {
    try {
      await userService.getAllUsersExcept('')
      assert.fail('Deveria ter lançado erro para userID vazio')
    } catch (error) {
      assert.include(error.message, 'O ID do usuário é obrigatório')
    }
  })
})
