import { test } from '@japa/runner'
import sinon from 'sinon'
import { md5 } from 'js-md5'

import ChatsService from 'App/services/ChatsService'
import UserService from 'App/services/UserService'

import User from 'App/Models/User'
import Chat from 'App/Models/Chat'
import Participant from 'App/Models/Participant'
import { FirebaseAdminService } from 'App/services/FirebaseAdmin'

import {
  fakeChat,
  fakeParticipant,
  fakeQuery,
  fakeUser,
} from '../shared/fakes'

/*
 * O Japa não possui mocking embutido.
 * Os métodos estáticos dos models Lucid são substituídos pelo Sinon
 * e restaurados depois de cada teste.
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

/*
|--------------------------------------------------------------------------
| ChatsService
|--------------------------------------------------------------------------
*/

test.group('ChatsService', (group) => {
  const service = new ChatsService()

  group.each.setup(() => {
    stubs = stubModels()

    return () => {
      sinon.restore()
    }
  })

  test(
    'cria chat entre dois usuários com host e dois participantes',
    async ({ assert }) => {
      stubs.userFind.callsFake(
        async (id: any) => fakeUser(Number(id)) as any
      )

      stubs.participantQuery.returns(fakeQuery([]) as any)
      stubs.chatCreate.resolves(fakeChat(10, 1) as any)

      const chat = await service.createChat('1', '2')

      assert.equal(chat.id, 10)
      assert.equal(chat.host.name, 'User 1')

      assert.deepEqual(
        stubs.chatCreate.firstCall.args[0],
        { id_host: 1 }
      )

      assert.equal(stubs.participantCreate.callCount, 2)

      assert.deepEqual(
        stubs.participantCreate.secondCall.args[0],
        {
          id_chat: 10,
          id_user: 2,
        }
      )
    }
  )

  test(
    'falha ao criar chat sem os IDs obrigatórios',
    async ({ assert }) => {
      await assert.rejects(
        () => service.createChat('', '2'),
        /Os IDs do host e participante são obrigatórios/
      )

      assert.isFalse(stubs.chatCreate.called)
    }
  )

  test(
    'falha ao criar chat quando o host não existe',
    async ({ assert }) => {
      stubs.userFind.callsFake(async (id: any) => {
        return Number(id) === 1
          ? null
          : (fakeUser(Number(id)) as any)
      })

      await assert.rejects(
        () => service.createChat('1', '2'),
        /Usuário host com ID 1 não encontrado/
      )
    }
  )

  test(
    'falha ao criar chat duplicado entre os mesmos usuários',
    async ({ assert }) => {
      stubs.userFind.callsFake(
        async (id: any) => fakeUser(Number(id)) as any
      )

      stubs.participantQuery
        .onFirstCall()
        .returns(
          fakeQuery([
            fakeParticipant(10, 1),
          ]) as any
        )

      stubs.participantQuery
        .onSecondCall()
        .returns(
          fakeQuery([
            fakeParticipant(10, 2),
          ]) as any
        )

      stubs.chatFind.resolves(fakeChat(10, 1) as any)

      await assert.rejects(
        () => service.createChat('1', '2'),
        /Chat já existe entre esses usuários/
      )

      assert.isFalse(stubs.chatCreate.called)
    }
  )

  test(
    'encontra o chat em comum entre dois usuários',
    async ({ assert }) => {
      stubs.participantQuery
        .onFirstCall()
        .returns(
          fakeQuery([
            fakeParticipant(10, 1),
            fakeParticipant(11, 1),
          ]) as any
        )

      stubs.participantQuery
        .onSecondCall()
        .returns(
          fakeQuery([
            fakeParticipant(11, 2),
          ]) as any
        )

      stubs.chatFind.callsFake(
        async (id: any) => fakeChat(Number(id), 1) as any
      )

      const chat = await service.chatBetweenUsers('1', '2')

      assert.equal(chat?.id, 11)
      assert.isTrue(stubs.chatFind.calledWith(11))
    }
  )

  test(
    'retorna null quando não existe chat entre usuários',
    async ({ assert }) => {
      stubs.participantQuery
        .onFirstCall()
        .returns(fakeQuery([]) as any)

      stubs.participantQuery
        .onSecondCall()
        .returns(fakeQuery([]) as any)

      const chat = await service.chatBetweenUsers('1', '2')

      assert.isNull(chat)
    }
  )

  test(
    'atualiza a última mensagem e a data do chat',
    async ({ assert }) => {
      const chat = fakeChat(10, 1)

      stubs.chatFind.resolves(chat as any)

      await service.updateLastMessage(10, 'Olá!')

      assert.equal(chat.last_message, 'Olá!')
      assert.isNotNull(chat.last_message_at)
      assert.isTrue(chat.saved)
    }
  )

  test(
    'falha ao atualizar a última mensagem de chat inexistente',
    async ({ assert }) => {
      stubs.chatFind.resolves(null)

      await assert.rejects(
        () => service.updateLastMessage(99, 'Olá!'),
        /Chat não encontrado/
      )
    }
  )

  test(
    'falha ao adicionar usuário que já participa do chat',
    async ({ assert }) => {
      stubs.chatFind.resolves(fakeChat(10, 1) as any)
      stubs.userFind.resolves(fakeUser(2) as any)

      stubs.participantQuery.returns(
        fakeQuery([
          fakeParticipant(10, 2),
        ]) as any
      )

      await assert.rejects(
        () => service.addParticipantToChat(10, 2),
        /Usuário já é participante do chat/
      )

      assert.isFalse(stubs.participantCreate.called)
    }
  )

  test(
    'adiciona participante ao chat com sucesso',
    async ({ assert }) => {
      stubs.chatFind.resolves(fakeChat(10, 1) as any)
      stubs.userFind.resolves(fakeUser(2) as any)

      stubs.participantQuery.returns(
        fakeQuery([]) as any
      )

      stubs.participantCreate.resolves(
        fakeParticipant(10, 2) as any
      )

      const participant =
        await service.addParticipantToChat(10, 2)

      assert.equal(participant.id_chat, 10)
      assert.equal(participant.id_user, 2)
    }
  )

  test(
    'falha ao adicionar participante em chat inexistente',
    async ({ assert }) => {
      stubs.chatFind.resolves(null)

      await assert.rejects(
        () => service.addParticipantToChat(10, 2),
        /Chat não encontrado/
      )
    }
  )

  test(
    'falha ao adicionar participante inexistente',
    async ({ assert }) => {
      stubs.chatFind.resolves(fakeChat(10, 1) as any)
      stubs.userFind.resolves(null)

      await assert.rejects(
        () => service.addParticipantToChat(10, 2),
        /Usuário não encontrado/
      )
    }
  )

  test(
    'remove participante existente do chat',
    async ({ assert }) => {
      const participant = fakeParticipant(10, 2)

      stubs.participantQuery.returns(
        fakeQuery([participant]) as any
      )

      const result =
        await service.removeParticipantFromChat(10, 2)

      assert.isTrue(result)
      assert.isTrue(participant.deleted)
    }
  )

  test(
    'retorna participantes do chat',
    async ({ assert }) => {
      stubs.participantQuery.returns(
        fakeQuery([
          { user: fakeUser(1) },
          { user: fakeUser(2) },
        ]) as any
      )

      const participants =
        await service.getChatParticipants(10)

      assert.lengthOf(participants, 2)
      assert.equal(participants[0].id, 1)
      assert.equal(participants[1].id, 2)
    }
  )

  test(
    'retorna lista vazia quando usuário não possui chats',
    async ({ assert }) => {
      stubs.participantQuery.returns(
        fakeQuery([]) as any
      )

      const chats = await service.getUserChats('1')

      assert.lengthOf(chats, 0)
    }
  )

  test(
    'retorna chats do usuário',
    async ({ assert }) => {
      const participation = {
        chat: {
          id: 10,
          toJSON: () => ({
            id: 10,
            last_message_at: new Date().toISOString(),
          }),
        },
      }

      stubs.participantQuery
        .onFirstCall()
        .returns(
          fakeQuery([participation]) as any
        )

      stubs.participantQuery
        .onSecondCall()
        .returns(
          fakeQuery([
            {
              user: fakeUser(2),
            },
          ]) as any
        )

      const chats = await service.getUserChats('1')

      assert.lengthOf(chats, 1)
      assert.equal(chats[0].id, 10)
      assert.lengthOf(chats[0].otherParticipants, 1)
      assert.equal(chats[0].otherParticipants[0].id, 2)
    }
  )

  test(
    'falha ao buscar chat inexistente',
    async ({ assert }) => {
      sinon.stub(Chat, 'query').returns({
        where: () => ({
          preload: () => ({
            preload: () => ({
              preload: () => ({
                first: async () => null,
              }),
            }),
          }),
        }),
      } as any)

      await assert.rejects(
        () => service.showChat('99'),
        /Chat não encontrado/
      )
    }
  )

  test(
    'retorna chat existente',
    async ({ assert }) => {
      const chat = {
        id: 10,
        toJSON: () => ({
          id: 10,
        }),
      }

      sinon.stub(Chat, 'query').returns({
        where: () => ({
          preload: () => ({
            preload: () => ({
              preload: () => ({
                first: async () => chat,
              }),
            }),
          }),
        }),
      } as any)

      const result: any =
        await service.showChat('10')

      assert.equal(result.id, 10)
    }
  )

  test(
    'retorna chat com participantes quando informado usuário logado',
    async ({ assert }) => {
      const chat = {
        id: 10,
        toJSON: () => ({
          id: 10,
        }),
      }

      sinon.stub(Chat, 'query').returns({
        where: () => ({
          preload: () => ({
            preload: () => ({
              preload: () => ({
                first: async () => chat,
              }),
            }),
          }),
        }),
      } as any)

      stubs.participantQuery.returns(
        fakeQuery([
          {
            user: fakeUser(2),
          },
        ]) as any
      )

      const result: any =
        await service.showChat('10', '1')

      assert.equal(result.id, 10)
      assert.lengthOf(result.participant, 1)
      assert.equal(result.participant[0].id, 2)
    }
  )
  test('falha ao buscar chats sem informar o usuário', async ({ assert }) => {
    await assert.rejects(() => service.getUserChats(''), /O ID do usuário é obrigatório/)
  })

  test('ordena os chats do usuário pela última mensagem', async ({ assert }) => {
    const participation = (id: number, lastMessageAt: string | null) => ({
      chat: { id, toJSON: () => ({ id, last_message_at: lastMessageAt }) },
    })
    stubs.participantQuery.onFirstCall().returns(
      fakeQuery([
        participation(10, '2026-01-01T10:00:00.000Z'),
        participation(11, '2026-02-01T10:00:00.000Z'),
        participation(12, null),
      ]) as any
    )
    stubs.participantQuery.returns(fakeQuery([{ user: fakeUser(2) }]) as any)

    const chats = await service.getUserChats('1')

    assert.deepEqual(chats.map((chat: any) => chat.id), [11, 10, 12])
  })

  test('falha ao buscar chat sem informar o id', async ({ assert }) => {
    await assert.rejects(() => service.showChat(''), /O ID do chat é obrigatório/)
  })

  test('falha ao criar chat quando o participante não existe', async ({ assert }) => {
    stubs.userFind.callsFake(async (id: any) => (id === 2 ? null : (fakeUser(id) as any)))

    await assert.rejects(
      () => service.createChat('1', '2'),
      /Usuário participante com ID 2 não encontrado/
    )
    assert.isFalse(stubs.chatCreate.called)
  })

  test('falha ao verificar chat entre usuários sem informar os IDs', async ({ assert }) => {
    await assert.rejects(
      () => service.chatBetweenUsers('', '2'),
      /Os IDs dos usuários são obrigatórios/
    )
  })

  test('falha ao atualizar a última mensagem sem informar o texto', async ({ assert }) => {
    await assert.rejects(
      () => service.updateLastMessage(10, ''),
      /O ID do chat e o texto da mensagem são obrigatórios/
    )
  })

  test('falha ao remover participante que não está no chat', async ({ assert }) => {
    stubs.participantQuery.returns(fakeQuery([]) as any)

    await assert.rejects(
      () => service.removeParticipantFromChat(10, 2),
      /Participante não encontrado no chat/
    )
  })
})

/*
|--------------------------------------------------------------------------
| UserService
|--------------------------------------------------------------------------
*/

test.group('UserService', (group) => {
  const service = new UserService()

  group.each.setup(() => {
    stubs = stubModels()

    return () => {
      sinon.restore()
    }
  })

  test(
    'cria usuário armazenando a senha com hash MD5',
    async ({ assert }) => {
      stubs.userQuery.returns(
        fakeQuery([]) as any
      )

      stubs.userCreate.callsFake(
        async (data: any) => ({
          id: 1,
          ...data,
        })
      )

      const user = await service.createUser(
        'ana@test.com',
        'senha123',
        'Ana'
      )

      assert.equal(user.id, 1)

      assert.deepEqual(
        stubs.userCreate.firstCall.args[0],
        {
          email: 'ana@test.com',
          password: md5('senha123'),
          name: 'Ana',
        }
      )
    }
  )

  test(
    'falha ao criar usuário com e-mail inválido',
    async ({ assert }) => {
      await assert.rejects(
        () =>
          service.createUser(
            'email-invalido',
            'senha123',
            'Ana'
          ),
        /Preencha todos os campos corretamente/
      )

      assert.isFalse(stubs.userQuery.called)
    }
  )

  test(
    'falha ao criar usuário com e-mail já cadastrado',
    async ({ assert }) => {
      stubs.userQuery.returns(
        fakeQuery([
          fakeUser(1),
        ]) as any
      )

      await assert.rejects(
        () =>
          service.createUser(
            'user1@test.com',
            'senha123',
            'Ana'
          ),
        /E-mail já cadastrado/
      )

      assert.isFalse(stubs.userCreate.called)
    }
  )

  test(
    'busca usuário por id',
    async ({ assert }) => {
      stubs.userFind.resolves(
        fakeUser(1) as any
      )

      const user =
        await service.getUserById(1)

      assert.equal(user.id, 1)
    }
  )

  test(
    'falha ao buscar usuário inexistente',
    async ({ assert }) => {
      stubs.userFind.resolves(null)

      await assert.rejects(
        () => service.getUserById(999),
        /Usuário não encontrado/
      )
    }
  )

  test(
    'retorna usuários exceto o informado',
    async ({ assert }) => {
      stubs.userQuery.returns(
        fakeQuery([
          fakeUser(2),
          fakeUser(3),
        ]) as any
      )

      const users =
        await service.getAllUsersExcept(1)

      assert.lengthOf(users, 2)
      assert.equal(users[0].id, 2)
      assert.equal(users[1].id, 3)
    }
  )

  test(
    'atualiza usuário existente',
    async ({ assert }) => {
      const user: any = {
        id: 1,
        name: 'Ana',
        merge: sinon.spy(),
        save: sinon.stub().resolves(),
      }

      stubs.userQuery.returns(
        fakeQuery([user]) as any
      )

      const result =
        await service.updateUser('1', {
          name: 'Maria',
        })

      assert.equal(result, user)
      assert.isTrue(user.merge.calledOnce)
      assert.isTrue(
        user.merge.calledWith({
          name: 'Maria',
        })
      )
      assert.isTrue(user.save.calledOnce)
    }
  )

  test(
    'realiza login com email e senha válidos',
    async ({ assert }) => {
      stubs.userQuery.returns(
        fakeQuery([
          {
            id: 1,
            email: 'ana@test.com',
          },
        ]) as any
      )

      const user =
        await service.getUserByEmailAndPassword(
          'ana@test.com',
          '123456'
        )

      assert.equal(user.id, 1)
      assert.equal(user.email, 'ana@test.com')
    }
  )

  test(
    'falha no login quando usuário não existe',
    async ({ assert }) => {
      stubs.userQuery.returns(
        fakeQuery([]) as any
      )

      await assert.rejects(
        () =>
          service.getUserByEmailAndPassword(
            'ana@test.com',
            '123456'
          ),
        /Usuário não encontrado/
      )
    }
  )

  test(
    'falha ao buscar login com email inválido',
    async ({ assert }) => {
      await assert.rejects(
        () =>
          service.getUserByEmailAndPassword(
            'email-invalido',
            '123456'
          ),
        /Preencha o campo senha e e-mail corretamente/
      )

      assert.isFalse(stubs.userQuery.called)
    }
  )

  test(
    'falha ao atualizar usuário inexistente',
    async ({ assert }) => {
      stubs.userQuery.returns(
        fakeQuery([]) as any
      )

      await assert.rejects(
        () =>
          service.updateUser('999', {
            name: 'Maria',
          }),
        /Usuário não encontrado/
      )
    }
  )

  test(
    'falha ao buscar usuários sem informar id',
    async ({ assert }) => {
      await assert.rejects(
        () => service.getAllUsersExcept(''),
        /O ID do usuário é obrigatório/
      )
    }
  )

  test(
    'falha ao buscar usuário sem informar id',
    async ({ assert }) => {
      await assert.rejects(
        () => service.getUserById(''),
        /O ID do usuário é obrigatório/
      )
    }
  )

  test(
    'falha ao salvar foto sem informar usuário',
    async ({ assert }) => {
      await assert.rejects(
        () =>
          service.saveProfilePicture(
            '',
            null as any
          ),
        /O ID do usuário e a imagem são obrigatórios/
      )
    }
  )

  test(
    'falha ao salvar foto para usuário inexistente',
    async ({ assert }) => {
      stubs.userFind.resolves(null)

      const file: any = {
        extname: 'jpg',
        type: 'image/jpeg',
        tmpPath: 'foto-temporaria.jpg',
      }

      await assert.rejects(
        () => service.saveProfilePicture(1, file),
        /Usuário não encontrado/
      )
    }
  )
  test('falha ao atualizar usuário sem informar id', async ({ assert }) => {
    await assert.rejects(
      () => service.updateUser('', { name: 'Maria' }),
      /O ID do usuário é obrigatório/
    )
  })

  test('salva foto de perfil e torna a imagem pública', async ({ assert }) => {
    const user: any = { id: 1, save: sinon.spy() }
    const uploaded = { publicUrl: () => 'https://storage.test/1.jpg', makePublic: sinon.spy() }
    stubs.userFind.resolves(user)
    sinon.stub(FirebaseAdminService, 'getStorage').returns({
      bucket: () => ({ upload: async () => [uploaded] }),
    } as any)
    const file: any = { extname: 'jpg', type: 'image/jpeg', tmpPath: 'foto-temporaria.jpg' }

    const result = await service.saveProfilePicture(1, file)

    assert.equal(result.profile_picture, 'https://storage.test/1.jpg')
    assert.isTrue(uploaded.makePublic.called)
    assert.isTrue(user.save.called)
  })

  test('falha ao salvar foto quando o upload não retorna URL pública', async ({ assert }) => {
    stubs.userFind.resolves({ id: 1, save: sinon.spy() } as any)
    sinon.stub(FirebaseAdminService, 'getStorage').returns({
      bucket: () => ({ upload: async () => [{ publicUrl: () => '', makePublic: sinon.spy() }] }),
    } as any)
    const file: any = { extname: 'jpg', type: 'image/jpeg', tmpPath: 'foto-temporaria.jpg' }

    await assert.rejects(
      () => service.saveProfilePicture(1, file),
      /Falha ao fazer upload da imagem/
    )
  })

  test('falha ao salvar foto quando o Storage rejeita o envio', async ({ assert }) => {
    stubs.userFind.resolves({ id: 1, save: sinon.spy() } as any)
    sinon.stub(FirebaseAdminService, 'getStorage').returns({
      bucket: () => ({ upload: async () => { throw new Error('sem permissão') } }),
    } as any)
    const file: any = { extname: 'jpg', type: 'image/jpeg', tmpPath: 'foto-temporaria.jpg' }

    await assert.rejects(
      () => service.saveProfilePicture(1, file),
      /Erro ao salvar imagem de perfil no Google Storage: sem permissão/
    )
  })
})