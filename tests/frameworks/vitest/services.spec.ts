import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest'
import { md5 } from 'js-md5'
import ChatsService from 'App/services/ChatsService'
import UserService from 'App/services/UserService'
import User from 'App/Models/User'
import Chat from 'App/Models/Chat'
import Participant from 'App/Models/Participant'
import { fakeChat, fakeParticipant, fakeQuery, fakeUser } from '../shared/fakes'

vi.mock('App/Models/User', () => ({
  default: { find: vi.fn(), query: vi.fn(), create: vi.fn() },
}))
vi.mock('App/Models/Chat', () => ({
  default: { find: vi.fn(), create: vi.fn() },
}))
vi.mock('App/Models/Participant', () => ({
  default: { query: vi.fn(), create: vi.fn() },
}))
vi.mock('App/services/FirebaseAdmin', () => ({ FirebaseAdminService: {} }))

const UserMock = User as unknown as Record<'find' | 'query' | 'create', Mock>
const ChatMock = Chat as unknown as Record<'find' | 'create', Mock>
const ParticipantMock = Participant as unknown as Record<'query' | 'create', Mock>

beforeEach(() => {
  vi.resetAllMocks()
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

    await expect(service.createChat('1', '2')).rejects.toThrow('Chat já existe entre esses usuários')
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

  test('falha ao criar usuário com e-mail já cadastrado', async () => {
    UserMock.query.mockReturnValue(fakeQuery([fakeUser(1)]))

    await expect(service.createUser('user1@test.com', 'senha123', 'Ana')).rejects.toThrow(
      'E-mail já cadastrado'
    )
    expect(UserMock.create).not.toHaveBeenCalled()
  })
})
