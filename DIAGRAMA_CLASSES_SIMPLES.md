# Diagrama de Classes Simplificado - Girls Chat API

```mermaid
flowchart TD
    %% MODELS
    A[User] --> B[Chat]
    A --> C[Message] 
    A --> D[Notification]
    B --> C
    B --> D

    %% CONTROLLERS
    E[UsersController] --> F[UserService]
    G[ChatsController] --> H[ChatsService]
    I[MessagesController] --> J[MessagesService]

    %% SERVICES TO MODELS
    F --> A
    H --> B
    J --> C
    J --> H

    %% UTILITIES
    K[ValidationUtils]
    L[IoSocketServer]
    F --> K

    %% Styling
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#ffebee
    style G fill:#ffebee
    style I fill:#ffebee
    style F fill:#f1f8e9
    style H fill:#f1f8e9
    style J fill:#f1f8e9
```

## Estrutura Principal das Classes

```mermaid
graph TB
    subgraph MODELS["📊 MODELS (Entidades)"]
        User["👤 User<br/>- id, email, password, name<br/>- lastLogin, createdAt, updatedAt"]
        Chat["💬 Chat<br/>- id, id_host, participant<br/>- last_message, last_message_at"]
        Message["📝 Message<br/>- id, id_chat, text, seen<br/>- sentBy, sentTo, createdAt"]
        Notification["🔔 Notification<br/>- id, id_chat, id_user<br/>- text, seen, createdAt"]
    end

    subgraph CONTROLLERS["🎮 CONTROLLERS (Apresentação)"]
        UC["UsersController<br/>- login(), signUp()<br/>- index(), update()"]
        CC["ChatsController<br/>- index(), show()<br/>- create()"]
        MC["MessagesController<br/>- index(), create()<br/>- updateSeenStatus()"]
    end

    subgraph SERVICES["⚙️ SERVICES (Negócios)"]
        US["UserService<br/>- getUserByEmailAndPassword()<br/>- createUser(), updateUser()<br/>- getAllUsersExcept()"]
        CS["ChatsService<br/>- getUserChats(), showChat()<br/>- createChat(), updateLastMessage()"]
        MS["MessagesService<br/>- getMessagesByChatID()<br/>- createMessage()<br/>- updateMessageSeenStatus()"]
    end

    subgraph UTILITIES["🔧 UTILITIES"]
        VU["ValidationUtils<br/>- isValidEmail()"]
        IO["IoSocketServer<br/>- io: SocketIoServer<br/>- boot()"]
    end

    %% Relacionamentos dos Models
    User -->|"1:N host"| Chat
    User -->|"1:N participant"| Chat
    Chat -->|"1:N"| Message
    Chat -->|"1:N"| Notification
    User -->|"1:N sender"| Message
    User -->|"1:N receiver"| Message
    User -->|"1:N"| Notification

    %% Dependências Controller -> Service
    UC --> US
    CC --> CS
    MC --> MS

    %% Dependências Service -> Model
    US --> User
    CS --> Chat
    MS --> Message
    MS --> CS

    %% Dependências Utilities
    US --> VU

    %% Estilos
    classDef modelStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef controllerStyle fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef serviceStyle fill:#f1f8e9,stroke:#2e7d32,stroke-width:2px
    classDef utilityStyle fill:#fff3e0,stroke:#ef6c00,stroke-width:2px

    class User,Chat,Message,Notification modelStyle
    class UC,CC,MC controllerStyle
    class US,CS,MS serviceStyle
    class VU,IO utilityStyle
```

## Resumo dos Relacionamentos

| Model | Relacionamentos |
|-------|----------------|
| **User** | • Hospeda vários Chats (1:N)<br/>• Participa de vários Chats (1:N)<br/>• Envia/Recebe Mensagens (1:N)<br/>• Possui Notificações (1:N) |
| **Chat** | • Pertence a 2 Users (N:1)<br/>• Contém Mensagens (1:N)<br/>• Gera Notificações (1:N) |
| **Message** | • Pertence a 1 Chat (N:1)<br/>• Enviada por 1 User (N:1)<br/>• Recebida por 1 User (N:1) |
| **Notification** | • Pertence a 1 Chat (N:1)<br/>• Destinada a 1 User (N:1) |

## Fluxo de Dados

```mermaid
sequenceDiagram
    participant C as Client
    participant Ctrl as Controller
    participant Svc as Service
    participant M as Model
    participant DB as Database

    C->>Ctrl: HTTP Request
    Ctrl->>Svc: Business Logic Call
    Svc->>M: Data Operation
    M->>DB: SQL Query
    DB-->>M: Result Set
    M-->>Svc: Entity Object
    Svc-->>Ctrl: Processed Data
    Ctrl-->>C: JSON Response
```
