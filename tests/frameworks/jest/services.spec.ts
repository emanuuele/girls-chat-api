import { md5 } from 'js-md5'
import ChatsService from 'App/services/ChatsService'
import UserService from 'App/services/UserService'
import User from 'App/Models/User'
import Chat from 'App/Models/Chat'
import Participant from 'App/Models/Participant'
import { FirebaseAdminService } from 'App/services/FirebaseAdmin'
import { fakeChat, fakeParticipant, fakeQuery, fakeUser } from '../shared/fakes'

jest.mock('App/Models/User', () => ({
  __esModule: true,
  default: { find: jest.fn(), query: jest.fn(), create: jest.fn() },
}))
jest.mock('App/Models/Chat', () => ({
  __esModule: true,
  default: { find: jest.fn(), create: jest.fn() },
}))
jest.mock('App/Models/Participant', () => ({
  __esModule: true,
  default: { query: jest.fn(), create: jest.fn() },
}))
jest.mock('App/services/FirebaseAdmin', () => ({ FirebaseAdminService: { getStorage: jest.fn() } }))

const UserMock = User as unknown as Record<'find' | 'query' | 'create', jest.Mock>
const ChatMock = Chat as unknown as Record<'find' | 'create', jest.Mock>
const ParticipantMock = Participant as unknown as Record<'query' | 'create', jest.Mock>
const StorageMock = FirebaseAdminService as unknown as Record<'getStorage', jest.Mock>

beforeEach(() => {
  jest.resetAllMocks()
})

describe('ChatsService', () => {
  const service = new ChatsService()

  test('cria chat entre dois usuários com host e dois participantes', async () => {
    UserMock.find.mockImplementation(async (id: number) => fakeUser(id))
    ParticipantMock.query.mockReturnValue(fakeQuery([]))
    ChatMock.create.mockResolvedValue(fakeChat(10, 1))

    const chat = await service.createChat('1', '2')

    expect(chat.id).toBe(10)
    expect(chat.host.name).toBe('User 1')
    expect(ChatMock.create).toHaveBeenCalledWith({ id_host: 1 })
    expect(ParticipantMock.create).toHaveBeenCalledTimes(2)
    expect(ParticipantMock.create).toHaveBeenCalledWith({ id_chat: 10, id_user: 2 })
  })

  test('falha ao criar chat sem os IDs obrigatórios', async () => {
    await expect(service.createChat('', '2')).rejects.toThrow(
      'Os IDs do host e participante são obrigatórios'
    )
    expect(ChatMock.create).not.toHaveBeenCalled()
  })

  test('falha ao criar chat quando o host não existe', async () => {
    UserMock.find.mockImplementation(async (id: number) => (id === 1 ? null : fakeUser(id)))

    await expect(service.createChat('1', '2')).rejects.toThrow(
      'Usuário host com ID 1 não encontrado'
    )
  })

  test('falha ao criar chat duplicado entre os mesmos usuários', async () => {
    UserMock.find.mockImplementation(async (id: number) => fakeUser(id))
    ParticipantMock.query
      .mockReturnValueOnce(fakeQuery([fakeParticipant(10, 1)]))
      .mockReturnValueOnce(fakeQuery([fakeParticipant(10, 2)]))
    ChatMock.find.mockResolvedValue(fakeChat(10, 1))

    await expect(service.createChat('1', '2')).rejects.toThrow(
      'Chat já existe entre esses usuários'
    )
    expect(ChatMock.create).not.toHaveBeenCalled()
  })

  test('encontra o chat em comum entre dois usuários', async () => {
    ParticipantMock.query
      .mockReturnValueOnce(fakeQuery([fakeParticipant(10, 1), fakeParticipant(11, 1)]))
      .mockReturnValueOnce(fakeQuery([fakeParticipant(11, 2)]))
    ChatMock.find.mockImplementation(async (id: number) => fakeChat(id, 1))

    const chat = await service.chatBetweenUsers('1', '2')

    expect(chat?.id).toBe(11)
    expect(ChatMock.find).toHaveBeenCalledWith(11)
  })

  test('atualiza a última mensagem e a data do chat', async () => {
    const chat = fakeChat(10, 1)
    ChatMock.find.mockResolvedValue(chat)

    await service.updateLastMessage(10, 'Olá!')

    expect(chat.last_message).toBe('Olá!')
    expect(chat.last_message_at).not.toBeNull()
    expect(chat.saved).toBe(true)
  })

  test('falha ao atualizar a última mensagem de chat inexistente', async () => {
    ChatMock.find.mockResolvedValue(null)

    await expect(service.updateLastMessage(99, 'Olá!')).rejects.toThrow('Chat não encontrado')
  })

  test('falha ao adicionar usuário que já participa do chat', async () => {
    ChatMock.find.mockResolvedValue(fakeChat(10, 1))
    UserMock.find.mockResolvedValue(fakeUser(2))
    ParticipantMock.query.mockReturnValue(fakeQuery([fakeParticipant(10, 2)]))

    await expect(service.addParticipantToChat(10, 2)).rejects.toThrow(
      'Usuário já é participante do chat'
    )
    expect(ParticipantMock.create).not.toHaveBeenCalled()
  })

  test('remove participante existente do chat', async () => {
    const participant = fakeParticipant(10, 2)
    ParticipantMock.query.mockReturnValue(fakeQuery([participant]))

    const result = await service.removeParticipantFromChat(10, 2)

    expect(result).toBe(true)
    expect(participant.deleted).toBe(true)
  })
  test('retorna null quando não existe chat entre usuários', async () => {
    ParticipantMock.query.mockReturnValueOnce(fakeQuery([])).mockReturnValueOnce(fakeQuery([]))

    const chat = await service.chatBetweenUsers('1', '2')

    expect(chat).toBeNull()
  })

  test('adiciona participante ao chat com sucesso', async () => {
    ChatMock.find.mockResolvedValue(fakeChat(10, 1))
    UserMock.find.mockResolvedValue(fakeUser(2))
    ParticipantMock.query.mockReturnValue(fakeQuery([]))

    ParticipantMock.create.mockResolvedValue(fakeParticipant(10, 2))

    const participant = await service.addParticipantToChat(10, 2)

    expect(participant.id_chat).toBe(10)
  })

  test('falha ao adicionar participante em chat inexistente', async () => {
    ChatMock.find.mockResolvedValue(null)

    await expect(service.addParticipantToChat(10, 2)).rejects.toThrow('Chat não encontrado')
  })

  test('falha ao adicionar participante inexistente', async () => {
    ChatMock.find.mockResolvedValue(fakeChat(10, 1))
    UserMock.find.mockResolvedValue(null)

    await expect(service.addParticipantToChat(10, 2)).rejects.toThrow('Usuário não encontrado')
  })

  test('retorna participantes do chat', async () => {
    ParticipantMock.query.mockReturnValue(fakeQuery([{ user: fakeUser(1) }, { user: fakeUser(2) }]))

    const participants = await service.getChatParticipants(10)

    expect(participants).toHaveLength(2)
  })

  test('retorna lista vazia quando usuário não possui chats', async () => {
    ParticipantMock.query.mockReturnValue(fakeQuery([]))

    const chats = await service.getUserChats('1')

    expect(chats).toEqual([])
  })

  test('falha ao buscar chat inexistente', async () => {
    ;(ChatMock as any).query = jest.fn(() => ({
      where: () => ({
        preload: () => ({
          preload: () => ({
            preload: () => ({
              first: async () => null,
            }),
          }),
        }),
      }),
    }))

    await expect(service.showChat('99')).rejects.toThrow('Chat não encontrado')
  })
  test('retorna chats do usuário', async () => {
    const participation = {
      chat: {
        id: 10,
        toJSON: () => ({
          id: 10,
          last_message_at: new Date().toISOString(),
        }),
      },
    }

    ParticipantMock.query.mockReturnValueOnce(fakeQuery([participation])).mockReturnValueOnce(
      fakeQuery([
        {
          user: fakeUser(2),
        },
      ])
    )

    const chats = await service.getUserChats('1')

    expect(chats).toHaveLength(1)
    expect(chats[0].id).toBe(10)
  })
  test('retorna chat existente', async () => {
    const chat = {
      id: 10,
      toJSON: () => ({ id: 10 }),
    }

    ;(ChatMock as any).query = jest.fn(() => ({
      where: () => ({
        preload: () => ({
          preload: () => ({
            preload: () => ({
              first: async () => chat,
            }),
          }),
        }),
      }),
    }))

    const result: any = await service.showChat('10')

    expect(result.id).toBe(10)
  })
  test('retorna chat com participantes quando informado usuário logado', async () => {
    const chat = {
      id: 10,
      toJSON: () => ({ id: 10 }),
    }

    ;(ChatMock as any).query = jest.fn(() => ({
      where: () => ({
        preload: () => ({
          preload: () => ({
            preload: () => ({
              first: async () => chat,
            }),
          }),
        }),
      }),
    }))

    ParticipantMock.query.mockReturnValue(
      fakeQuery([
        {
          user: fakeUser(2),
        },
      ])
    )

    const result: any = await service.showChat('10', '1')

    expect(result.participant).toHaveLength(1)
  })
  test('falha ao buscar chats sem informar o usuário', async () => {
    await expect(service.getUserChats('')).rejects.toThrow('O ID do usuário é obrigatório')
  })

  test('ordena os chats do usuário pela última mensagem', async () => {
    const participation = (id: number, lastMessageAt: string | null) => ({
      chat: { id, toJSON: () => ({ id, last_message_at: lastMessageAt }) },
    })
    ParticipantMock.query
      .mockReturnValueOnce(
        fakeQuery([
          participation(10, '2026-01-01T10:00:00.000Z'),
          participation(11, '2026-02-01T10:00:00.000Z'),
          participation(12, null),
        ])
      )
      .mockReturnValue(fakeQuery([{ user: fakeUser(2) }]))

    const chats = await service.getUserChats('1')

    expect(chats.map((chat: any) => chat.id)).toEqual([11, 10, 12])
  })

  test('falha ao buscar chat sem informar o id', async () => {
    await expect(service.showChat('')).rejects.toThrow('O ID do chat é obrigatório')
  })

  test('falha ao criar chat quando o participante não existe', async () => {
    UserMock.find.mockImplementation(async (id: number) => (id === 2 ? null : fakeUser(id)))

    await expect(service.createChat('1', '2')).rejects.toThrow(
      'Usuário participante com ID 2 não encontrado'
    )
    expect(ChatMock.create).not.toHaveBeenCalled()
  })

  test('falha ao verificar chat entre usuários sem informar os IDs', async () => {
    await expect(service.chatBetweenUsers('', '2')).rejects.toThrow(
      'Os IDs dos usuários são obrigatórios'
    )
  })

  test('falha ao atualizar a última mensagem sem informar o texto', async () => {
    await expect(service.updateLastMessage(10, '')).rejects.toThrow(
      'O ID do chat e o texto da mensagem são obrigatórios'
    )
  })

  test('falha ao remover participante que não está no chat', async () => {
    ParticipantMock.query.mockReturnValue(fakeQuery([]))

    await expect(service.removeParticipantFromChat(10, 2)).rejects.toThrow(
      'Participante não encontrado no chat'
    )
  })
})

describe('UserService', () => {
  const service = new UserService()

  test('cria usuário armazenando a senha com hash MD5', async () => {
    UserMock.query.mockReturnValue(fakeQuery([]))
    UserMock.create.mockImplementation(async (data: object) => ({ id: 1, ...data }))

    const user = await service.createUser('ana@test.com', 'senha123', 'Ana')

    expect(user.id).toBe(1)
    expect(UserMock.create).toHaveBeenCalledWith({
      email: 'ana@test.com',
      password: md5('senha123'),
      name: 'Ana',
    })
  })

  test('falha ao criar usuário com e-mail inválido', async () => {
    await expect(service.createUser('email-invalido', 'senha123', 'Ana')).rejects.toThrow(
      'Preencha todos os campos corretamente'
    )
    expect(UserMock.query).not.toHaveBeenCalled()
  })
  test('falha ao buscar login com email inválido', async () => {
    await expect(service.getUserByEmailAndPassword('email-invalido', '123456')).rejects.toThrow(
      'Preencha o campo senha e e-mail corretamente'
    )
  })
  test('falha ao salvar foto sem informar usuário', async () => {
    await expect(service.saveProfilePicture('' as any, null as any)).rejects.toThrow()
  })
  test('falha ao salvar foto para usuário inexistente', async () => {
    UserMock.find.mockResolvedValue(null)

    const file: any = {
      extname: 'jpg',
    }

    await expect(service.saveProfilePicture(1, file)).rejects.toThrow('Usuário não encontrado')
  })

  test('falha ao criar usuário com e-mail já cadastrado', async () => {
    UserMock.query.mockReturnValue(fakeQuery([fakeUser(1)]))

    await expect(service.createUser('user1@test.com', 'senha123', 'Ana')).rejects.toThrow(
      'E-mail já cadastrado'
    )
    expect(UserMock.create).not.toHaveBeenCalled()
  })
  test('busca usuário por id', async () => {
    UserMock.find.mockResolvedValue(fakeUser(1))

    const user = await service.getUserById(1)

    expect(user.id).toBe(1)
  })

  test('falha ao buscar usuário inexistente', async () => {
    UserMock.find.mockResolvedValue(null)

    await expect(service.getUserById(999)).rejects.toThrow('Usuário não encontrado')
  })

  test('retorna usuários exceto o informado', async () => {
    UserMock.query.mockReturnValue(fakeQuery([fakeUser(2), fakeUser(3)]))

    const users = await service.getAllUsersExcept(1)

    expect(users).toHaveLength(2)
  })

  test('atualiza usuário existente', async () => {
    const user: any = {
      merge: jest.fn(),
      save: jest.fn(),
    }

    UserMock.query.mockReturnValue(fakeQuery([user]))

    const result = await service.updateUser('1', {
      name: 'Maria',
    })

    expect(result).toBe(user)
    expect(user.merge).toHaveBeenCalled()
  })

  test('realiza login com email e senha válidos', async () => {
    UserMock.query.mockReturnValue(
      fakeQuery([
        {
          id: 1,
          email: 'ana@test.com',
        },
      ])
    )

    const user = await service.getUserByEmailAndPassword('ana@test.com', '123456')

    expect(user.id).toBe(1)
  })

  test('falha no login quando usuário não existe', async () => {
    UserMock.query.mockReturnValue(fakeQuery([]))

    await expect(service.getUserByEmailAndPassword('ana@test.com', '123456')).rejects.toThrow(
      'Usuário não encontrado'
    )
  })

  test('falha ao atualizar usuário inexistente', async () => {
    UserMock.query.mockReturnValue(fakeQuery([]))

    await expect(
      service.updateUser('999', {
        name: 'Maria',
      })
    ).rejects.toThrow('Usuário não encontrado')
  })

  test('falha ao buscar usuários sem informar id', async () => {
    await expect(service.getAllUsersExcept('')).rejects.toThrow('O ID do usuário é obrigatório')
  })

  test('falha ao buscar usuário sem informar id', async () => {
    await expect(service.getUserById('')).rejects.toThrow('O ID do usuário é obrigatório')
  })
  test('falha ao atualizar usuário sem informar id', async () => {
    await expect(service.updateUser('', { name: 'Maria' })).rejects.toThrow(
      'O ID do usuário é obrigatório'
    )
  })

  test('salva foto de perfil e torna a imagem pública', async () => {
    const user: any = { id: 1, save: jest.fn() }
    const uploaded = { publicUrl: () => 'https://storage.test/1.jpg', makePublic: jest.fn() }
    UserMock.find.mockResolvedValue(user)
    StorageMock.getStorage.mockReturnValue({
      bucket: () => ({ upload: async () => [uploaded] }),
    })
    const file: any = { extname: 'jpg', type: 'image/jpeg', tmpPath: 'foto-temporaria.jpg' }

    const result = await service.saveProfilePicture(1, file)

    expect(result.profile_picture).toBe('https://storage.test/1.jpg')
    expect(uploaded.makePublic).toHaveBeenCalled()
    expect(user.save).toHaveBeenCalled()
  })

  test('falha ao salvar foto quando o upload não retorna URL pública', async () => {
    UserMock.find.mockResolvedValue({ id: 1, save: jest.fn() })
    StorageMock.getStorage.mockReturnValue({
      bucket: () => ({ upload: async () => [{ publicUrl: () => '', makePublic: jest.fn() }] }),
    })
    const file: any = { extname: 'jpg', type: 'image/jpeg', tmpPath: 'foto-temporaria.jpg' }

    await expect(service.saveProfilePicture(1, file)).rejects.toThrow(
      'Falha ao fazer upload da imagem'
    )
  })

  test('falha ao salvar foto quando o Storage rejeita o envio', async () => {
    UserMock.find.mockResolvedValue({ id: 1, save: jest.fn() })
    StorageMock.getStorage.mockReturnValue({
      bucket: () => ({
        upload: async () => {
          throw new Error('sem permissão')
        },
      }),
    })
    const file: any = { extname: 'jpg', type: 'image/jpeg', tmpPath: 'foto-temporaria.jpg' }

    await expect(service.saveProfilePicture(1, file)).rejects.toThrow(
      'Erro ao salvar imagem de perfil no Google Storage: sem permissão'
    )
  })
})
