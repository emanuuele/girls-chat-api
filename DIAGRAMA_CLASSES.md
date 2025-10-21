# Diagrama de Classes - Girls Chat API

## Visão Geral da Arquitetura

Este projeto segue o padrão **MVC (Model-View-Controller)** com **Service Layer**, utilizando o framework AdonisJS com TypeScript e PostgreSQL.

## Diagrama de Classes UML

```mermaid
classDiagram
    %% ========== MODELS (Entidades) ==========
    class User {
        -id: number
        -email: string
        -password: string
        -name: string
        -lastLogin: DateTime
        -createdAt: DateTime
        -updatedAt: DateTime
        %% Relacionamentos
        +hostedChats: HasMany~Chat~
        +participatingChats: HasMany~Chat~
        +sentMessages: HasMany~Message~
        +receivedMessages: HasMany~Message~
        +notifications: HasMany~Notification~
    }

    class Chat {
        -id: number
        -id_host: number
        -last_message: string
        -last_message_at: DateTime
        -participant: number
        -createdAt: DateTime
        -updatedAt: DateTime
        %% Relacionamentos
        +host: BelongsTo~User~
        +participantUser: BelongsTo~User~
        +messages: HasMany~Message~
        +notifications: HasMany~Notification~
    }

    class Message {
        -id: number
        -id_chat: number
        -text: string
        -seen: boolean
        -sentBy: number
        -sentTo: number
        -createdAt: DateTime
        -updatedAt: DateTime
        %% Relacionamentos
        +chat: BelongsTo~Chat~
        +sender: BelongsTo~User~
        +receiver: BelongsTo~User~
    }

    class Notification {
        -id: number
        -id_chat: number
        -id_user: number
        -text: string
        -seen: boolean
        -createdAt: DateTime
        -updatedAt: DateTime
        %% Relacionamentos
        +chat: BelongsTo~Chat~
        +user: BelongsTo~User~
    }

    %% ========== CONTROLLERS ==========
    class UsersController {
        -userService: UserService
        +constructor()
        +login(context: HttpContextContract): Promise~Response~
        +signUp(context: HttpContextContract): Promise~Response~
        +index(context: HttpContextContract): Promise~Response~
        +update(context: HttpContextContract): Promise~Response~
    }

    class ChatsController {
        -chatsService: ChatsService
        +index(context: HttpContextContract): Promise~Response~
        +show(context: HttpContextContract): Promise~Response~
        +create(context: HttpContextContract): Promise~Response~
    }

    class MessagesController {
        -messagesService: MessagesService
        +index(context: HttpContextContract): Promise~Response~
        +create(context: HttpContextContract): Promise~Response~
        +updateSeenStatus(context: HttpContextContract): Promise~Response~
    }

    %% ========== SERVICES ==========
    class UserService {
        +getUserByEmailAndPassword(email: string, password: string): Promise~User~
        +createUser(email: string, password: string, name: string): Promise~User~
        +updateUser(userID: string, updatedData: any): Promise~User~
        +getAllUsersExcept(userID: string|number): Promise~User[]~
    }

    class ChatsService {
        +getUserChats(userID: string): Promise~Chat[]~
        +showChat(chatID: string): Promise~Chat~
        +createChat(host: string, participant: string): Promise~Chat~
        +existsChatBetweenUsers(userA: string, userB: string): Promise~boolean~
        +updateLastMessage(chatID: string, messageText: string): Promise~void~
    }

    class MessagesService {
        +getMessagesByChatID(chatID: string): Promise~Message[]~
        +createMessage(chatID: string|number, newMessage: object): Promise~Message~
        +updateMessageSeenStatus(chatID: string): Promise~void~
    }

    class IoSocketServer {
        +io: SocketIoServer
        -booted: boolean
        +boot(): void
    }

    %% ========== UTILITIES ==========
    class ValidationUtils {
        <<utility>>
        +isValidEmail(email: string): boolean
    }

    %% ========== RELACIONAMENTOS ENTRE MODELS ==========
    User ||--o{ Chat : "id_host (hostedChats)"
    User ||--o{ Chat : "participant (participatingChats)"
    User ||--o{ Message : "sentBy (sentMessages)"
    User ||--o{ Message : "sentTo (receivedMessages)"
    User ||--o{ Notification : "id_user (notifications)"
    
    Chat ||--o{ Message : "id_chat (messages)"
    Chat ||--o{ Notification : "id_chat (notifications)"
    
    Message }o--|| Chat : "id_chat (chat)"
    Message }o--|| User : "sentBy (sender)"
    Message }o--|| User : "sentTo (receiver)"
    
    Notification }o--|| Chat : "id_chat (chat)"
    Notification }o--|| User : "id_user (user)"

    %% ========== DEPENDÊNCIAS CONTROLLER -> SERVICE ==========
    UsersController --> UserService : uses
    ChatsController --> ChatsService : uses
    MessagesController --> MessagesService : uses

    %% ========== DEPENDÊNCIAS SERVICE -> MODEL ==========
    UserService --> User : manages
    ChatsService --> Chat : manages
    MessagesService --> Message : manages
    MessagesService --> ChatsService : uses

    %% ========== DEPENDÊNCIAS UTILITIES ==========
    UserService --> ValidationUtils : uses
    UserService --> md5 : "uses (js-md5)"

    %% ========== EXTERNAL DEPENDENCIES ==========
    class BaseModel {
        <<AdonisJS>>
    }
    
    class HttpContextContract {
        <<AdonisJS>>
        +request: Request
        +response: Response
        +params: object
    }

    User --|> BaseModel
    Chat --|> BaseModel
    Message --|> BaseModel
    Notification --|> BaseModel

    UsersController ..> HttpContextContract
    ChatsController ..> HttpContextContract  
    MessagesController ..> HttpContextContract
```

## Padrões Arquiteturais Identificados

### 1. **MVC (Model-View-Controller)**
- **Models**: `User`, `Chat`, `Message`, `Notification`
- **Controllers**: `UsersController`, `ChatsController`, `MessagesController`  
- **Views**: Respostas JSON (API REST)

### 2. **Service Layer Pattern**
- **Services**: `UserService`, `ChatsService`, `MessagesService`
- Encapsulam a lógica de negócios
- Controladores delegam operações complexas para os services

### 3. **Active Record Pattern (AdonisJS Lucid ORM)**
- Models herdam de `BaseModel`
- Contêm tanto dados quanto comportamentos
- Relacionamentos definidos via decorators (`@hasMany`, `@belongsTo`)

### 4. **Dependency Injection**
- Controllers instanciam services no construtor
- Services podem usar outros services (ex: `MessagesService` usa `ChatsService`)

## Descrição dos Relacionamentos

### **User (Usuário)**
- **1:N** com Chat (como host e participante)
- **1:N** com Message (como remetente e destinatário)
- **1:N** com Notification

### **Chat (Conversa)**
- **N:1** com User (host e participante)
- **1:N** com Message
- **1:N** com Notification

### **Message (Mensagem)**
- **N:1** com Chat
- **N:1** com User (sender e receiver)

### **Notification (Notificação)**
- **N:1** com Chat
- **N:1** com User

## Funcionalidades por Camada

### **Controllers (Camada de Apresentação)**
- Recebem requisições HTTP
- Validam parâmetros básicos
- Delegam para services
- Retornam respostas JSON padronizadas

### **Services (Camada de Negócios)**
- Validações de regras de negócio
- Operações CRUD complexas
- Coordenação entre diferentes models
- Tratamento de erros específicos do domínio

### **Models (Camada de Dados)**
- Mapeamento objeto-relacional
- Definição de relacionamentos
- Validações a nível de banco de dados
- Timestamps automáticos