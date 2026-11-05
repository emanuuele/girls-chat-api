/**
 * Dublês (test doubles) compartilhados pelos três frameworks (Japa, Jest e Vitest).
 *
 * Não dependem de nenhum framework de teste: cada framework usa o seu próprio
 * mecanismo de mock/stub para injetar estes objetos no lugar dos models Lucid.
 * Assim, os 12 casos de teste são idênticos e nenhum acessa banco de dados.
 */

/**
 * Simula o query builder do Lucid: todos os métodos encadeáveis retornam o
 * próprio builder, `first()` resolve o primeiro registro e `await builder`
 * resolve a lista completa.
 */
export function fakeQuery<T>(rows: T[] = []) {
  const builder: any = {}
  for (const method of ['where', 'whereNot', 'andWhere', 'select', 'preload', 'orderBy']) {
    builder[method] = () => builder
  }
  builder.first = async () => rows[0] ?? null
  builder.then = (resolve: (v: T[]) => unknown, reject: (e: unknown) => unknown) =>
    Promise.resolve(rows).then(resolve, reject)
  return builder
}

export function fakeUser(id: number, name = `User ${id}`) {
  return { id, name, email: `user${id}@test.com` }
}

export function fakeChat(id: number, idHost: number) {
  const chat: any = {
    id,
    id_host: idHost,
    last_message: null,
    last_message_at: null,
    saved: false,
    async load(relation: string) {
      chat[relation] = relation === 'host' ? fakeUser(idHost) : []
    },
    async save() {
      chat.saved = true
    },
  }
  return chat
}

export function fakeParticipant(idChat: number, idUser: number) {
  const participant: any = {
    id_chat: idChat,
    id_user: idUser,
    deleted: false,
    async delete() {
      participant.deleted = true
    },
  }
  return participant
}
