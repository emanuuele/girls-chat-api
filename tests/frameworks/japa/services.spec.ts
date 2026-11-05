import { test } from '@japa/runner'
import sinon from 'sinon'
import { md5 } from 'js-md5'
import ChatsService from 'App/services/ChatsService'
import UserService from 'App/services/UserService'
import User from 'App/Models/User'
import Chat from 'App/Models/Chat'
import Participant from 'App/Models/Participant'
import { fakeChat, fakeParticipant, fakeQuery, fakeUser } from '../shared/fakes'

/*
 * O Japa não possui mocking embutido: os métodos estáticos dos models Lucid
 * são substituídos com o Sinon e restaurados após cada teste.
 */
function stubModels() {
  return {
    userFind: sinon.stub(User, 'find'),
    userQuery: sinon.stub(User, 'query'),
    userCreate: sinon.stub(User, 'create'),
    chatFind: sinon.stub(Chat, 'find'),
    chatCreate: sinon.stub(Chat, 'create'),
    participantQuery: sinon.stub(Participant, 'query'),
    participantCreate: sinon.stub(Participant, 'create'),
  }
}

let stubs: ReturnType<typeof stubModels>

test.group('ChatsService', (group) => {
  const service = new ChatsService()

  group.each.setup(() => {
    stubs = stubModels()
    return () => sinon.restore()
  })

  test('cria chat entre dois usuários com host e dois participantes', async ({ assert }) => {
    stubs.userFind.callsFake(async (id: any) => fakeUser(id) as any)
    stubs.participantQuery.returns(fakeQuery([]))
    stubs.chatCreate.resolves(fakeChat(10, 1))

    const chat = await service.createChat('1', '2')

    assert.equal(chat.id, 10)
    assert.equal(chat.host.name, 'User 1')
    assert.deepEqual(stubs.chatCreate.firstCall.args[0], { id_host: 1 })
    assert.equal(stubs.participantCreate.callCount, 2)
    assert.deepEqual(stubs.participantCreate.secondCall.args[0], { id_chat: 10, id_user: 2 })
  })

  test('falha ao criar chat sem os IDs obrigatórios', async ({ assert }) => {
    await assert.rejects(
      () => service.createChat('', '2'),
      /Os IDs do host e participante são obrigatórios/
    )
    assert.isFalse(stubs.chatCreate.called)
  })

  test('falha ao criar chat quando o host não existe', async ({ assert }) => {
    stubs.userFind.callsFake(async (id: any) => (id === 1 ? null : (fakeUser(id) as any)))

    await assert.rejects(() => service.createChat('1', '2'), /Usuário host com ID 1 não encontrado/)
  })

  test('falha ao criar chat duplicado entre os mesmos usuários', async ({ assert }) => {
    stubs.userFind.callsFake(async (id: any) => fakeUser(id) as any)
    stubs.participantQuery.onFirstCall().returns(fakeQuery([fakeParticipant(10, 1)]))
    stubs.participantQuery.onSecondCall().returns(fakeQuery([fakeParticipant(10, 2)]))
    stubs.chatFind.resolves(fakeChat(10, 1))

    await assert.rejects(() => service.createChat('1', '2'), /Chat já existe entre esses usuários/)
    assert.isFalse(stubs.chatCreate.called)
  })

  test('encontra o chat em comum entre dois usuários', async ({ assert }) => {
    stubs.participantQuery
      .onFirstCall()
      .returns(fakeQuery([fakeParticipant(10, 1), fakeParticipant(11, 1)]))
    stubs.participantQuery.onSecondCall().returns(fakeQuery([fakeParticipant(11, 2)]))
    stubs.chatFind.callsFake(async (id: any) => fakeChat(id, 1))

    const chat = await service.chatBetweenUsers('1', '2')

    assert.equal(chat?.id, 11)
    assert.isTrue(stubs.chatFind.calledWith(11))
  })

  test('atualiza a última mensagem e a data do chat', async ({ assert }) => {
    const chat = fakeChat(10, 1)
    stubs.chatFind.resolves(chat)

    await service.updateLastMessage(10, 'Olá!')

    assert.equal(chat.last_message, 'Olá!')
    assert.isNotNull(chat.last_message_at)
    assert.isTrue(chat.saved)
  })

  test('falha ao atualizar a última mensagem de chat inexistente', async ({ assert }) => {
    stubs.chatFind.resolves(null)

    await assert.rejects(() => service.updateLastMessage(99, 'Olá!'), /Chat não encontrado/)
  })

  test('falha ao adicionar usuário que já participa do chat', async ({ assert }) => {
    stubs.chatFind.resolves(fakeChat(10, 1))
    stubs.userFind.resolves(fakeUser(2) as any)
    stubs.participantQuery.returns(fakeQuery([fakeParticipant(10, 2)]))

    await assert.rejects(
      () => service.addParticipantToChat(10, 2),
      /Usuário já é participante do chat/
    )
    assert.isFalse(stubs.participantCreate.called)
  })

  test('remove participante existente do chat', async ({ assert }) => {
    const participant = fakeParticipant(10, 2)
    stubs.participantQuery.returns(fakeQuery([participant]))

    const result = await service.removeParticipantFromChat(10, 2)

    assert.isTrue(result)
    assert.isTrue(participant.deleted)
  })
})

test.group('UserService', (group) => {
  const service = new UserService()

  group.each.setup(() => {
    stubs = stubModels()
    return () => sinon.restore()
  })

  test('cria usuário armazenando a senha com hash MD5', async ({ assert }) => {
    stubs.userQuery.returns(fakeQuery([]))
    stubs.userCreate.callsFake(async (data: any) => ({ id: 1, ...data }))

    const user = await service.createUser('ana@test.com', 'senha123', 'Ana')

    assert.equal(user.id, 1)
    assert.deepEqual(stubs.userCreate.firstCall.args[0], {
      email: 'ana@test.com',
      password: md5('senha123'),
      name: 'Ana',
    })
  })

  test('falha ao criar usuário com e-mail inválido', async ({ assert }) => {
    await assert.rejects(
      () => service.createUser('email-invalido', 'senha123', 'Ana'),
      /Preencha todos os campos corretamente/
    )
    assert.isFalse(stubs.userQuery.called)
  })

  test('falha ao criar usuário com e-mail já cadastrado', async ({ assert }) => {
    stubs.userQuery.returns(fakeQuery([fakeUser(1)]))

    await assert.rejects(
      () => service.createUser('user1@test.com', 'senha123', 'Ana'),
      /E-mail já cadastrado/
    )
    assert.isFalse(stubs.userCreate.called)
  })
})
