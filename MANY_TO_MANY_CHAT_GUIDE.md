# Guia da Nova Estrutura de Chat - Many-to-Many Participants

## 🔄 Estrutura de Relacionamento Atualizada

### 📊 **Antes vs Depois**

**Antes (One-to-One):**
```
Chat { id_host, participant }
```

**Agora (Many-to-Many):**
```
Chat { id_host }
Participant { id_chat, id_user }
User
```

## 🗄️ Estrutura do Banco de Dados

### Tabela `participants`
```sql
CREATE TABLE participants (
  id SERIAL PRIMARY KEY,
  id_chat INTEGER REFERENCES chats(id),
  id_user INTEGER REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(id_chat, id_user)
);
```

## 🏗️ Modelos AdonisJS

### Chat Model
```typescript
// app/Models/Chat.ts
export default class Chat extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public id_host: number

  // Many-to-Many com Users
  @manyToMany(() => User, {
    pivotTable: 'participants',
    localKey: 'id',
    pivotForeignKey: 'id_chat',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'id_user'
  })
  public participants: ManyToMany<typeof User>

  // Acesso direto aos registros da tabela pivot
  @hasMany(() => Participant, {
    foreignKey: 'id_chat'
  })
  public participantRecords: HasMany<typeof Participant>
}
```

### User Model
```typescript
// app/Models/User.ts
export default class User extends BaseModel {
  // Many-to-Many com Chats
  @manyToMany(() => Chat, {
    pivotTable: 'participants',
    localKey: 'id',
    pivotForeignKey: 'id_user',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'id_chat'
  })
  public participatingChats: ManyToMany<typeof Chat>
}
```

### Participant Model (Pivot)
```typescript
// app/Models/Participant.ts
export default class Participant extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public id_chat: number

  @column()
  public id_user: number

  @belongsTo(() => Chat, {
    foreignKey: 'id_chat'
  })
  public chat: BelongsTo<typeof Chat>

  @belongsTo(() => User, {
    foreignKey: 'id_user'
  })
  public user: BelongsTo<typeof User>
}
```

## 🚀 Métodos do ChatsService Atualizados

### 1. Criar Chat
```typescript
public async createChat(host: string, participant: string) {
  // Criar o chat
  const newChat = await Chat.create({
    id_host: parseInt(host),
  });

  // Adicionar host como participante
  await Participant.create({
    id_chat: newChat.id,
    id_user: parseInt(host),
  });

  // Adicionar participante
  await Participant.create({
    id_chat: newChat.id,
    id_user: parseInt(participant),
  });

  return newChat;
}
```

### 2. Verificar Chat Entre Usuários
```typescript
public async chatBetweenUsers(userA: string, userB: string) {
  // Buscar chats onde ambos os usuários são participantes
  const chatsUserA = await Participant.query()
    .where('id_user', userA)
    .select('id_chat');

  const chatsUserB = await Participant.query()
    .where('id_user', userB)
    .select('id_chat');

  const commonChatIds = chatsUserA
    .map(p => p.id_chat)
    .filter(id => chatsUserB.some(p => p.id_chat === id));

  if (commonChatIds.length > 0) {
    return await Chat.find(commonChatIds[0]);
  }

  return null;
}
```

### 3. Buscar Chats do Usuário
```typescript
public async getUserChats(userID: string) {
  const userParticipations = await Participant.query()
    .where('id_user', userID)
    .preload('chat', (chatQuery) => {
      chatQuery.preload('host')
    });

  const chatsWithParticipants = await Promise.all(
    userParticipations.map(async (participation) => {
      const chat = participation.chat;
      
      // Buscar outros participantes
      const otherParticipants = await Participant.query()
        .where('id_chat', chat.id)
        .whereNot('id_user', userID)
        .preload('user');

      return { 
        ...chat.toJSON(), 
        otherParticipants: otherParticipants.map(p => p.user)
      };
    })
  );

  return chatsWithParticipants;
}
```

## 🛠️ Novos Métodos Disponíveis

### Adicionar Participante
```typescript
public async addParticipantToChat(chatID: number, userID: number) {
  await Participant.create({
    id_chat: chatID,
    id_user: userID
  });
}
```

### Remover Participante
```typescript
public async removeParticipantFromChat(chatID: number, userID: number) {
  const participant = await Participant.query()
    .where('id_chat', chatID)
    .where('id_user', userID)
    .first();

  await participant?.delete();
}
```

### Listar Participantes
```typescript
public async getChatParticipants(chatID: number) {
  const participants = await Participant.query()
    .where('id_chat', chatID)
    .preload('user');

  return participants.map(p => p.user);
}
```

## 🔌 Rotas da API

### Rotas Existentes (Atualizadas)
```typescript
// Buscar chats do usuário
GET /chats?userID=123

// Criar chat entre dois usuários
POST /criar-chat
{
  "host": "123",
  "participant": "456"
}

// Mostrar chat específico
GET /chat/:id
```

### Novas Rotas Possíveis
```typescript
// Adicionar participante ao chat
POST /chat/:id/participantes
{
  "userID": "789"
}

// Remover participante do chat
DELETE /chat/:id/participantes/:userId

// Listar participantes do chat
GET /chat/:id/participantes
```

## 📱 Frontend React Native

### Exemplo de Uso
```javascript
// Buscar chats do usuário
const getChats = async (userId) => {
  const response = await fetch(`/chats?userID=${userId}`);
  const data = await response.json();
  
  // Agora cada chat tem otherParticipants[]
  data.chats.forEach(chat => {
    console.log('Participantes:', chat.otherParticipants);
  });
};

// Criar chat grupo (3+ pessoas)
const createGroupChat = async (hostId, participantIds) => {
  // 1. Criar chat
  const chatResponse = await fetch('/criar-chat', {
    method: 'POST',
    body: JSON.stringify({
      host: hostId,
      participant: participantIds[0] // Primeiro participante
    })
  });

  const chat = await chatResponse.json();

  // 2. Adicionar outros participantes
  for (let i = 1; i < participantIds.length; i++) {
    await fetch(`/chat/${chat.chat.id}/participantes`, {
      method: 'POST',
      body: JSON.stringify({
        userID: participantIds[i]
      })
    });
  }
};
```

## 🔍 Vantagens da Nova Estrutura

### ✅ **Benefícios:**
1. **Chats em Grupo**: Agora suporta múltiplos participantes
2. **Flexibilidade**: Fácil adicionar/remover participantes
3. **Escalabilidade**: Melhor performance para chats grandes
4. **Relacionamentos Limpos**: Estrutura de dados mais organizada

### 📈 **Casos de Uso:**
- Chat individual (2 pessoas)
- Chat em grupo (3+ pessoas)
- Adicionar pessoas a conversas existentes
- Remover pessoas de conversas
- Administração de grupos

## 🚨 Migração de Dados

### Se você tem dados existentes na estrutura antiga:
```sql
-- Migrar dados da estrutura antiga para nova
INSERT INTO participants (id_chat, id_user, created_at, updated_at)
SELECT id, id_host, created_at, updated_at FROM chats
UNION
SELECT id, participant, created_at, updated_at FROM chats
WHERE participant IS NOT NULL;

-- Remover coluna antiga (após verificar que tudo funciona)
-- ALTER TABLE chats DROP COLUMN participant;
```

A nova estrutura está pronta para suportar chats individuais e em grupo! 🎉
