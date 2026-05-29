# 🎬 Roteiro de Reels - GirlsChat API Integration

> **Série completa:** 13 reels de ~50 segundos cada | **Duração total:** ~10 minutos

---

## 📋 Índice

1. [Bloco 1: Fluxo Geral](#bloco-1-fluxo-geral)
2. [Bloco 2: Camada de Autenticação](#bloco-2-camada-de-autenticação)
3. [Bloco 3: WebSocket](#bloco-3-websocket)
4. [Bloco 4: Regra de Negócio](#bloco-4-regra-de-negócio)
5. [Dicas de Produção](#dicas-de-produção)

---

# 🎯 BLOCO 1: FLUXO GERAL

## Reel 1.1 - "Visão Geral da Integração"
**Duração:** 50s | **Tipo:** Conceitual + Demo

### Timing

| Tempo | Ação | Detalhes |
|-------|------|----------|
| 0:00-0:05 | **Cena 1: App GirlsChat** | Abrir GirlsChat mobile, mostrar lista de chats funcionando |
| 0:05-0:10 | **Transição** | Efeito de transição suave |
| 0:10-0:15 | **Cena 2: Portfólio** | Mostrar portfólio aberto com widget de chat |
| 0:15-0:30 | **Cena 3: Fluxo Visual** | Diagrama/animação mostrando: Mobile → API → Portfolio |
| 0:30-0:45 | **Cena 4: Resultado** | Enviar mensagem de um lado, receber no outro |
| 0:45-0:50 | **Conclusão** | Texto final: "Tudo em tempo real! 🚀" |

### Roteiro (Voice-over)
```
"Oi! Bem-vindo à série sobre integração do GirlsChat com meu portfólio.
Aqui você vai ver como os dados fluem de um app mobile para meu site,
tudo em tempo real, usando API e WebSocket.
Vamos começar!"
```

### On-Screen Text
- 0:00: "GirlsChat Mobile App" (branco/amarelo)
- 0:10: "Portfolio Integration" (branco/amarelo)
- 0:15: "Real-time Communication" (em cima da seta)
- 0:45: "✅ Tudo em tempo real! 🚀"

### Dica de Gravação
- Use split screen se possível (50/50)
- Ou grava mobile em primeiro plano, portfólio ao fundo
- Use cursor para destacar interações

---

## Reel 1.2 - "Mobile → Mobile (GirlsChat)"
**Duração:** 50s | **Tipo:** Demo pura

### Timing

| Tempo | Ação | Detalhes |
|-------|------|----------|
| 0:00-0:05 | **Introdução** | Texto: "Teste de comunicação nativa" |
| 0:05-0:10 | **Setup** | Mostrar dois celulares lado a lado |
| 0:10-0:35 | **Troca de mensagens** | User A envia → User B recebe (2-3 mensagens) |
| 0:35-0:45 | **Highlight** | Câmera focando na velocidade (em tempo real) |
| 0:45-0:50 | **Conclusão** | Texto: "Base para integração funciona!" |

### Mensagens para enviar
```
User A (Celular 1):
- "Oi! Tudo bem?" → User B recebe em ~0.5s
- "Como vai a integração?" → User B recebe

User B (Celular 2):
- "Tudo perfeito! 😊" → User A recebe em ~0.5s
- "Bora testar com o portfólio!" → User A recebe
```

### On-Screen Text
- 0:00: "📱 Comunicação nativa GirlsChat"
- 0:10: "User A → User B" (esquerda)
- 0:20: "⚡ Tempo real!" (no meio)
- 0:45: "✅ Base funcionando!"

### Dica de Gravação
- Mostra 2 screens (pode ser filmando 2 celulares ou apps em abas)
- Coloca velocidade 0.75x para parecer mais cinematic
- Usa sons de "ping" quando mensagem chega

---

## Reel 1.3 - "Portfólio → Mobile (Primeiro envio)"
**Duração:** 50s | **Tipo:** Demo + Satisfação

### Timing

| Tempo | Ação | Detalhes |
|-------|------|----------|
| 0:00-0:05 | **Introdução** | Texto: "Integração em ação!" |
| 0:05-0:10 | **Setup** | Split screen: Portfólio + Mobile GirlsChat |
| 0:10-0:30 | **Ação** | Clicar widget no portfólio → digitar mensagem → enviar |
| 0:30-0:45 | **Resultado** | Mensagem aparece no mobile (com efeito visual) |
| 0:45-0:50 | **Celebração** | Animação ou check mark verde |

### Mensagem para enviar
```
"Olá! Mensagem do portfólio 📱"
```

### On-Screen Text
- 0:00: "🎯 Primeira mensagem do portfólio!"
- 0:10: "Portfolio" (lado direito)
- 0:10: "Mobile" (lado esquerdo)
- 0:30: "Enviando..." (animation)
- 0:45: "✅ Integração funcionando!"

### Voice-over
```
"Agora vamos testar enviar uma mensagem do portfólio.
Clico no widget, digito minha mensagem e envio.
Watch this!"
```

### Dica de Gravação
- Use cursor mouse com destaque
- Zoom-in quando mensagem aparece no mobile
- Som de "whoosh" quando transita entre telas
- Slowmo (0.5x) no momento que mensagem aparece

---

# 🔐 BLOCO 2: CAMADA DE AUTENTICAÇÃO

## Reel 2.1 - "Criação de Usuário Anônimo"
**Duração:** 50s | **Tipo:** Técnico (Código + Conceito)

### Timing

| Tempo | Ação | Detalhes |
|-------|------|----------|
| 0:00-0:05 | **Título** | "Criação de Usuário Anônimo" |
| 0:05-0:15 | **Código** | Mostrar função `getOrCreateUserToken()` do AuthService |
| 0:15-0:35 | **Explicação Visual** | Animação do fluxo de criação |
| 0:35-0:45 | **Resultado** | Banco de dados mostrando novo usuário |
| 0:45-0:50 | **Conclusão** | Texto: "Usuário anônimo criado! 👤" |

### Código para Destacar
```typescript
const anonymousName = `User_${Math.random().toString(36).substr(2, 5)}`
const anonymousEmail = `${anonymousName.toLowerCase()}@portfolio-chat.local`
const anonymousPassword = randomBytes(16).toString('hex')

const user = await User.create({
  name: anonymousName,
  email: anonymousEmail,
  password: anonymousPassword,
  device_id: deviceId,
  auth_token: randomBytes(32).toString('hex')
})
```

### On-Screen Text & Annotations
```
0:05 - Arquivo: AuthService.ts
0:10 - Destaque 1: Geração de nome anônimo
       "User_a7b3c" ← random único

0:15 - Destaque 2: Email local
       "@portfolio-chat.local"

0:20 - Destaque 3: Device ID
       "device_1716990000_xyz123abc"
       Voice-over: "Identifica o dispositivo do usuário"

0:30 - Animation: User sendo criado no banco
       "Criando usuário..." (loading)
       
0:40 - Mostrar banco de dados:
       | id | name | device_id | email |
       | 1  | User_a7b3c | device_... | user_a7b3c@... |
```

### Voice-over
```
"Quando alguém acessa o portfólio pela primeira vez,
a gente precisa criar um usuário anônimo.
Geramos um nome único, um email local e um device ID
que identifica o dispositivo.
Tudo isso é criado no banco de dados!"
```

### Dica de Gravação
- Use VS Code com tema escuro
- Aumentar font size do código (24pt+)
- Adicionar highlights (Yellow highlight) nas linhas importantes
- Animar o banco de dados com SQL INSERT

---

## Reel 2.2 - "Geração do Token de Autenticação"
**Duração:** 50s | **Tipo:** Técnico (Código + Conceito)

### Timing

| Tempo | Ação | Detalhes |
|-------|------|----------|
| 0:00-0:05 | **Título** | "Token de Autenticação" |
| 0:05-0:15 | **Código** | Mostrar linha de geração de token |
| 0:15-0:30 | **Explicação Visual** | Animação: bytes → hex string |
| 0:30-0:40 | **Benefício** | Texto sobre segurança |
| 0:40-0:50 | **Conclusão** | "Token gerado com sucesso! 🔐" |

### Código para Destacar
```typescript
// Dentro de getOrCreateUserToken()
user.auth_token = randomBytes(32).toString('hex')
await user.save()

return { user, token: user.auth_token }
```

### On-Screen Text & Annotations
```
0:05 - Código destacado:
       randomBytes(32).toString('hex')
       
0:10 - Explicação:
       "randomBytes(32)" = 32 bytes aleatórios
       ".toString('hex')" = Converte para hexadecimal
       
0:15 - Animation mostrando conversão:
       [Random bytes] → 64 caracteres hex
       Exemplo: "a7f3e2c1d9b4f8e6..." (truncado)
       
0:25 - Voice-over:
       "Um token é uma string criptografada única"
       
0:30 - Texto:
       "32 bytes = 64 caracteres hexadecimais
        Praticamente impossível de adivinhar! 🔒"
        
0:40 - Token sendo salvo no banco
       UPDATE users SET auth_token = '...' WHERE id = 1
       
0:45 - Token retornando para o frontend
       Response: { token: "a7f3e2c1d9b4..." }
```

### Voice-over
```
"Agora geramos um token único e seguro.
Usamos 32 bytes aleatórios convertidos para hexadecimal.
Isso cria uma string de 64 caracteres praticamente impossível de adivinhar.
Este token protege todas as requisições do portfólio!"
```

### Dica de Gravação
- Mostrar o token sendo gerado no console.log
- Animar os 32 bytes vindo de um random pool
- Mostrar o token sendo armazenado no banco
- Use cor verde para token válido

---

## Reel 2.3 - "Validação do Token no Backend"
**Duração:** 50s | **Tipo:** Técnico + Demo

### Timing

| Tempo | Ação | Detalhes |
|-------|------|----------|
| 0:00-0:05 | **Contexto** | "Validação de Token" |
| 0:05-0:15 | **Fluxo** | Mostrar requisição chegando com token |
| 0:15-0:35 | **Código** | Função `validateToken()` |
| 0:35-0:45 | **Resultado** | ✅ Usuário autenticado ou ❌ Erro |
| 0:45-0:50 | **Conclusão** | "Só autorizado quem tem token válido!" |

### Código para Destacar
```typescript
// AuthService.ts - validateToken()
public async validateToken(token: string): Promise<User> {
  try {
    const user = await User.query()
      .where('auth_token', token)
      .first()

    if (!user) {
      throw new Error('Token inválido')
    }

    return user
  } catch (error) {
    throw new Error(`Erro ao validar token: ${error.message}`)
  }
}
```

### On-Screen Text & Annotations
```
0:00 - Título: "🔐 Validação de Token"

0:05 - Fluxo visual:
       [Request HTTP] 
       ↓
       Headers: { Authorization: 'Bearer a7f3e2c1d9...' }
       
0:10 - Middleware interceptando:
       "Middleware de Autenticação"
       ↓
       "Extrai token do header"
       
0:15 - Código destaca:
       const user = await User.query()
         .where('auth_token', token)
       
0:20 - Voice-over:
       "Procuramos no banco qual usuário tem este token"
       
0:25 - Animação banco de dados:
       SELECT * FROM users WHERE auth_token = '...'
       ↓
       Encontrou! User { id: 1, name: 'User_a7b3c' }
       
0:35 - Resultado SUCCESS:
       ✅ Usuário autenticado!
       (tela verde com check mark)
       
0:40 - Alternativo - Resultado FAIL:
       ❌ Token inválido!
       (tela vermelha com X)
       Texto: "Erro 401: Unauthorized"
       
0:50 - Conclusão:
       "Agora sabemos quem está enviando!"
```

### Voice-over
```
"Quando uma requisição chega, o middleware intercepta.
Extrai o token do header da requisição.
Depois procura no banco: qual usuário tem este token?
Se achar, libera! Se não achar, retorna erro 401.
Assim garantimos que só quem tem token válido consegue enviar mensagens!"
```

### Dica de Gravação
- Mostrar request real (ex: Postman ou curl)
- Header destacado em amarelo/verde
- Animar query do banco
- Verde para sucesso, vermelho para erro
- Mostrar o console.log do resultado

---

# 📡 BLOCO 3: WEBSOCKET

## Reel 3.1 - "Inicialização do WebSocket"
**Duração:** 50s | **Tipo:** Técnico (Código + Conceito)

### Timing

| Tempo | Ação | Detalhes |
|-------|------|----------|
| 0:00-0:05 | **Introdução** | "Camada de Comunicação em Tempo Real" |
| 0:05-0:15 | **Conceito** | O que é WebSocket? |
| 0:15-0:35 | **Código** | Função `boot()` do IoSocketServer |
| 0:35-0:45 | **Configuração** | CORS e Transports |
| 0:45-0:50 | **Conclusão** | "Pronto para ouvir e emitir eventos! 📡" |

### Código para Destacar
```typescript
// IoSocketServer.ts
public boot() {
  if (this.booted) return
  
  this.booted = true
  this.io = new SocketIoServer(Server.instance!, {
    cors: {
      origin: [
        "http://localhost:3000",
        "https://portfolio-three-sigma.vercel.app",
        "*",
      ],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  })
}
```

### On-Screen Text & Annotations
```
0:00 - Título: "📡 WebSocket - Comunicação Real-time"

0:05 - Conceito explicado:
       "HTTP é like: Você pergunta, servidor responde.
        WebSocket é like: Conexão aberta, ambos podem falar!"
       (Animação mostrando diferença)

0:10 - Arquivo: IoSocketServer.ts
       Voice-over: "Aqui inicializamos o Socket.IO"

0:15 - Código: new SocketIoServer()
       Highlight: "Socket.IO livraria"
       
0:20 - CORS configuration destaque:
       "Origens permitidas:"
       ✅ localhost:3000
       ✅ portfolio-three-sigma.vercel.app
       ✅ * (todas)

0:25 - Voice-over:
       "A gente configura de onde pode conectar"
       
0:30 - Transports destaque:
       ['websocket', 'polling']
       Explicação:
       - websocket: Preferido, conexão aberta
       - polling: Fallback, HTTP cada X segundos

0:40 - Animação conexão:
       [Client] ←→ (conexão persistente) ←→ [Server]
       Seta piscando para representar conexão ativa
       
0:50 - Conclusão:
       "A gente está pronto para receber e enviar eventos!"
```

### Voice-over
```
"WebSocket é diferente de HTTP normal.
Em HTTP você faz uma pergunta e espera resposta.
Em WebSocket mantém uma conexão aberta!
Aqui no código, inicializamos o Socket.IO.
Configuramos as origens permitidas - de onde pode conectar.
E escolhemos os transportes: websocket preferido, polling como fallback.
Pronto para comunicação em tempo real!"
```

### Dica de Gravação
- Mostrar vs de HTTP normal vs WebSocket (diagrama)
- Código com font 26pt+
- Animação de conexão bidirecional
- Som de "ding" quando conexão ativa
- Use cores: azul para client, verde para server

---

## Reel 3.2 - "Emitir Mensagens em Tempo Real"
**Duração:** 50s | **Tipo:** Técnico (Código)

### Timing

| Tempo | Ação | Detalhes |
|-------|------|----------|
| 0:00-0:05 | **Introdução** | "Como emitir mensagens?" |
| 0:05-0:15 | **Função** | Mostrar `emitNewMessage()` |
| 0:15-0:30 | **Explicação** | O que cada parte faz |
| 0:30-0:45 | **Demonstração** | Evento sendo disparado |
| 0:45-0:50 | **Conclusão** | "Evento disparado para todos! 🎯" |

### Código para Destacar
```typescript
// IoSocketServer.ts
public emitNewMessage(chatId: number, message: Message) {
  if (this.io) {
    this.io.emit(`new-message-${chatId}`, { 
      id: message.id, 
      text: message.text, 
      sentBy: message.sentBy, 
      sentTo: message.sentTo, 
      createdAt: message.createdAt 
    });
    console.log(`Nova mensagem emitida para o chat ${chatId}`)
  }
}
```

### On-Screen Text & Annotations
```
0:00 - Título: "Emitir eventos em tempo real"

0:05 - Função destacada: emitNewMessage()
       Voice-over: "Esta função dispara um evento quando nova mensagem chega"

0:10 - Linha 1: `this.io.emit()`
       Highlight: emit = disparar evento para todos ouvindo
       
0:12 - Linha 2: `new-message-${chatId}`
       Explicação on-screen:
       "Nome do evento é dinâmico baseado no chat"
       Exemplo: new-message-1, new-message-2, etc
       
0:15 - Dados do evento:
       { id, text, sentBy, sentTo, createdAt }
       Voice-over: "Estes são os dados que viajam pelo evento"

0:20 - Animação mostrando evento saindo:
       [Servidor]
       ↓ emit('new-message-1', {...})
       ↓
       [Client 1] [Client 2] [Client 3]
       Todos conectados no chat 1 recebem!

0:30 - Console.log destacado:
       console.log(`Nova mensagem emitida para o chat ${chatId}`)
       Mostrar output no console:
       "Nova mensagem emitida para o chat 1"
       
0:40 - Resumo visual:
       "1 mensagem criada = 1 evento = Múltiplos clientes"
       
0:50 - Conclusão:
       "Sem delay! Instantâneo! 🚀"
```

### Voice-over
```
"Aqui está a função que emite eventos.
Quando uma mensagem é criada, chamamos emitNewMessage.
O nome do evento é dinâmico: new-message-{chatId}.
Assim cada chat tem seu próprio evento.
Os dados da mensagem são empacotados e enviados.
Todos os clientes conectados naquele chat recebem instantaneamente!"
```

### Dica de Gravação
- Código com destaque em diferentes cores
- Animação arrows mostrando fluxo
- Terminal mostrando console.log em tempo real
- Múltiplos clientes recebendo (3+ janelas)
- Efeito de "broadcast" (ondas saindo)

---

## Reel 3.3 - "Listeners no Frontend"
**Duração:** 50s | **Tipo:** Técnico (Pseudocódigo/Conceito)

### Timing

| Tempo | Ação | Detalhes |
|-------|------|----------|
| 0:00-0:05 | **Contexto** | "Frontend precisa OUVIR!" |
| 0:05-0:15 | **Socket.on()** | Como registrar um listener |
| 0:15-0:30 | **Fluxo** | Evento chega → função executada |
| 0:30-0:45 | **Atualização UI** | Chat atualiza na tela |
| 0:45-0:50 | **Conclusão** | "Sem refresh! Sem reload! 🚀" |

### Código para Destacar
```typescript
// Pseudocódigo Frontend (React/Vue/JavaScript)
useEffect(() => {
  socket.on(`new-message-${chatId}`, (message) => {
    // Mensagem recebida!
    updateChatMessages([...messages, message])
    // Anima na tela
    playNotificationSound()
  })
}, [chatId])
```

### On-Screen Text & Annotations
```
0:00 - Título: "🎧 Listeners - Ouvindo eventos"

0:05 - Código: socket.on()
       Highlight: on = registrar um listener
       Voice-over: "Socket.on significa 'fique ouvindo este evento'"

0:10 - Nome do evento:
       `new-message-${chatId}`
       Mesmo nome do que backend emite!
       
0:15 - Callback function:
       (message) => { ... }
       Explicação: "Quando evento chega, esta função roda"

0:20 - O que acontece dentro:
       1. updateChatMessages([...messages, message])
       2. Re-render da UI
       3. Mensagem aparece na tela
       
       Animação mostrando cada passo

0:30 - UI Update:
       Mostrar chat antes e depois
       [Chat vazio] → [Nova mensagem aparece]
       Com animação de "fade in"

0:40 - Som opcional:
       playNotificationSound()
       Som de "ding" ou notificação

0:45 - Comparação:
       "SEM listener: Página continua velha
        COM listener: Atualiza em tempo real"

0:50 - Conclusão:
       "Sem refresh! Sem reload! 
        Tudo automático! 🚀"
```

### Voice-over
```
"No frontend, a gente precisa ouvir esses eventos.
Usamos socket.on() para registrar um listener.
Especificamos qual evento queremos ouvir.
Quando o evento chega, uma função é executada.
Essa função atualiza o estado do chat.
A interface re-renderiza com a nova mensagem.
Tudo automático, em tempo real, sem refresh!"
```

### Dica de Gravação
- Mostrar browser DevTools com Network ativa
- WebSocket frame chegando em tempo real
- Chat UI atualizando live
- Split screen: código + browser
- Slow-mo (0.5x) quando mensagem aparece
- Som de notificação quando recebe

---

# ⚙️ BLOCO 4: REGRA DE NEGÓCIO

## Reel 4.1 - "Fluxo Nativo: Mobile → Mobile"
**Duração:** 50s | **Tipo:** Demo + Conceitual

### Timing

| Tempo | Ação | Detalhes |
|-------|------|----------|
| 0:00-0:05 | **Contexto** | "Dois usuários do GirlsChat conversando" |
| 0:05-0:35 | **Passo a passo** | Fluxo completo (5 passos) |
| 0:35-0:45 | **Resumo** | Diagrama visual do fluxo |
| 0:45-0:50 | **Conclusão** | "Fluxo completo funcionando! ✅" |

### Timing Detalhado dos Passos

```
0:05-0:10 (5s): PASSO 1 - User A envia
  - Mostrar app GirlsChat
  - Typing na caixa de mensagem
  - Texto: "Olá! Como vai? 😊"
  - Click enviar
  - Voice: "User A envia sua mensagem"

0:10-0:15 (5s): PASSO 2 - Validação no Backend
  - Mostrar fluxo para servidor
  - Validar dados: { text, sentBy, sentTo }
  - Highlight: "Checando se ambos usuários existem"
  - Ícone ✅ aparece

0:15-0:22 (7s): PASSO 3 - Criar no Banco
  - Query SQL INSERT:
    INSERT INTO messages (text, sent_by, sent_to, created_at)
    VALUES ('Olá! Como vai?', user_a_id, user_b_id, now())
  - Animação mostrando insert
  - Message ID retornado: id: 42

0:22-0:30 (8s): PASSO 4 - WebSocket Emit
  - Backend disparando evento
  - Mostrar: this.io.emit('new-message-{chatId}', {...})
  - Ondas saindo do servidor (efeito broadcast)
  - Texto: "Disparando evento..."

0:30-0:40 (10s): PASSO 5 - User B Recebe
  - Mobile B recebendo evento
  - Socket listener ativando
  - Mensagem aparecendo no chat com animação
  - Voice: "User B recebe instantaneamente!"

0:40-0:45 (5s): Resumo Visual
  - Diagrama completo em pequeno:
    A → Validação → Banco → WebSocket → B
  - Cada seta piscando em sequência

0:45-0:50 (5s): Conclusão
  - Mostrar ambas mensagens no chat
  - Texto: "Fluxo nativo funcionando! ✅"
  - Voice: "Assim funciona a comunicação nativa!"
```

### On-Screen Text
```
0:00: "📱 Fluxo Nativo: Mobile → Mobile"
0:05: "🔹 Passo 1: User A envia"
0:10: "🔹 Passo 2: Validação backend"
0:15: "🔹 Passo 3: Criar no banco de dados"
0:22: "🔹 Passo 4: WebSocket emit"
0:30: "🔹 Passo 5: User B recebe"
0:45: "Fluxo completo: A → Validação → DB → WS → B"
0:50: "✅ Comunicação nativa funcionando!"
```

### Voice-over
```
"Agora vamos ver o fluxo completo quando dois usuários do GirlsChat conversam.
User A envia uma mensagem. Isso chega no servidor.
Backend valida: existe User A? Existe User B? Tudo certo?
Se tudo ok, cria um registro de mensagem no banco de dados.
Com a mensagem criada, emitimos um evento WebSocket.
Esse evento avisa a todos os clientes conectados no chat.
User B recebe instantaneamente no seu celular.
Fluxo completo em menos de 1 segundo!"
```

### Dica de Gravação
- Use 2 celulares reais ou 2 emuladores
- Mostra números/IDs: User A = 1, User B = 2
- Banco de dados em tempo real (pode ser DB visual)
- WebSocket event no console
- Slow-motion (0.75x) para destacar velocidade

---

## Reel 4.2 - "Fluxo Integrado: Portfólio → Mobile"
**Duração:** 50s | **Tipo:** Demo + Conceitual

### Timing

| Tempo | Ação | Detalhes |
|-------|------|----------|
| 0:00-0:05 | **Diferença** | "Agora do portfólio para mobile" |
| 0:05-0:35 | **Passo a passo** | Fluxo completo com autenticação |
| 0:35-0:45 | **Destaque** | Token de autenticação |
| 0:45-0:50 | **Conclusão** | "Seguro e integrado! 🔐" |

### Timing Detalhado dos Passos

```
0:05-0:10 (5s): PASSO 1 - Portfólio envia requisição
  - Mostrar widget no portfólio
  - Caixa de texto com mensagem
  - Click enviar
  - HTTP POST sendo feito
  - Voice: "Portfólio envia requisição HTTP"

0:10-0:15 (5s): PASSO 2 - Middleware autentica
  - Mostrar header da requisição:
    Authorization: Bearer {token}
  - Highlight em amarelo
  - Texto: "Token no header"

0:15-0:22 (7s): PASSO 3 - Valida Token
  - Mostrar query:
    SELECT * FROM users WHERE auth_token = '...'
  - Encontrar usuário anônimo
  - ✅ Token válido!
  - Voice: "Validando token... OK!"

0:22-0:30 (8s): PASSO 4 - Cria Message
  - Mostrar dados sendo salvos:
    { text, sentBy: user_id, sentTo: 55 }
  - 55 = ID do suporte/host
  - INSERT no banco
  - Message ID retornado

0:30-0:40 (10s): PASSO 5 - WebSocket + Mobile recebe
  - Same como fluxo nativo
  - Evento disparado
  - Mobile recebendo
  - Chat atualiza
  - Voice: "Mensagem chega no mobile!"

0:40-0:45 (5s): Destaque Segurança
  - Mostrar fluxo de token:
    "Token = Segurança"
    ✅ Só autorizado envia
    ❌ Sem token = error 401

0:45-0:50 (5s): Conclusão
  - Mensagem no chat
  - Texto: "Fluxo integrado + Seguro! 🔐"
```

### On-Screen Text
```
0:00: "🎯 Fluxo Integrado: Portfólio → Mobile"
0:05: "🔹 Passo 1: Portfólio envia POST"
0:10: "🔹 Passo 2: Token no header"
0:15: "🔹 Passo 3: Validar token"
0:22: "🔹 Passo 4: Criar message"
0:30: "🔹 Passo 5: Mobile recebe via WS"
0:40: "🔐 Autenticação garante segurança"
0:50: "✅ Integrado + Seguro!"
```

### Voice-over
```
"Quando o portfólio envia uma mensagem, é diferente.
Vem como HTTP POST, com token no header.
O middleware intercepta, extrai o token.
Valida no banco: este token existe? Qual usuário é?
Se tudo ok, cria a mensagem com sentBy = user_id, sentTo = 55 (suporte).
Depois emite o evento WebSocket igual.
Mobile recebe instantaneamente.
A diferença é a autenticação por token que garante segurança.
Só quem tem token válido consegue enviar!"
```

### Dica de Gravação
- Mostrar Postman ou curl com requisição
- Token em destaque (copiar na tela)
- Banco de dados mostrando novo user gerado
- Animação de fluxo de dados
- Comparação visual: Mobile vs Portfólio (icones diferentes)

---

## Reel 4.3 - "Conhecendo PortfolioChatController"
**Duração:** 50s | **Tipo:** Técnico (Código + Visão Geral)

### Timing

| Tempo | Ação | Detalhes |
|-------|------|----------|
| 0:00-0:05 | **Introdução** | "A classe que conecta tudo" |
| 0:05-0:35 | **Três métodos** | init(), messages(), send() |
| 0:35-0:45 | **Fluxo** | Como se conectam |
| 0:45-0:50 | **Conclusão** | "Toda integração aqui! 💡" |

### Timing Detalhado dos Métodos

```
0:05-0:12 (7s): MÉTODO 1 - init()
  - Mostrar arquivo: PortfolioChatController.ts
  - Destacar função init()
  - Pseudocódigo on-screen:
    init() {
      deviceId = gerar ou usar existente
      user = getOrCreateUserToken(deviceId)
      chat = buscar ou criar
      return { token, deviceId, chatId, user }
    }
  - Voice: "Inicializa o chat, cria usuário anônimo"

0:12-0:22 (10s): MÉTODO 2 - messages()
  - Destacar função messages()
  - Pseudocódigo on-screen:
    messages(chatId) {
      validar usuário autenticado
      buscar chat pelo ID
      buscar todas as mensagens
      return mensagens
    }
  - Voice: "Busca as mensagens do chat"
  - Mostrar response com array de mensagens

0:22-0:32 (10s): MÉTODO 3 - send()
  - Destacar função send()
  - Pseudocódigo on-screen:
    send({ text, chatId }) {
      validar token
      validar texto
      criar Message no banco
      emit WebSocket
      return { success: true, message }
    }
  - Voice: "Envia a mensagem e emite evento"

0:32-0:40 (8s): CONEXÃO ENTRE MÉTODOS
  - Diagrama visual:
    init() → cria chat + user + token
      ↓
    messages() → busca mensagens existentes
      ↓
    send() → cria nova mensagem → atualiza UI
  - Animação mostrando fluxo

0:40-0:45 (5s): ESTATÍSTICAS
  - Mostrar no-screen:
    "Linhas de código: ~150
     Métodos: 3
     Integração: 100%"

0:45-0:50 (5s): CONCLUSÃO
  - Texto: "Três métodos, infinitas possibilidades! 💡"
  - Voice: "Toda a integração acontece aqui!"
```

### On-Screen Text
```
0:00: "🎯 PortfolioChatController"
0:05: "📍 Arquivo: app/Controllers/Http/PortfolioChatController.ts"
0:07: "🔹 Método 1: init()"
      "Inicializa chat + usuário + token"
0:12: "🔹 Método 2: messages()"
      "Busca mensagens do chat"
0:22: "🔹 Método 3: send()"
      "Cria + emite nova mensagem"
0:32: "Fluxo: init → messages → send"
0:45: "✅ Toda integração aqui!"
```

### Código para Mostrar (snippets)

**MÉTODO 1 - init()**
```typescript
public async init({ request, response }: HttpContextContract) {
  let deviceId = request.input('deviceId')
  if (!deviceId) {
    deviceId = this.authService.generateDeviceId()
  }
  
  const { user, token } = await this.authService.getOrCreateUserToken(deviceId)
  
  let chat = await Chat.query().where('id_host', user.id).first()
  if (!chat) {
    chat = await Chat.create({ id_host: user.id })
    await Participant.create({ id_chat: chat.id, id_user: user.id })
    await Participant.create({ id_chat: chat.id, id_user: 55 })
  }
  
  return response.json({ token, deviceId, chatId: chat.id, user })
}
```

**MÉTODO 2 - messages()**
```typescript
public async messages({ request, response, params }: HttpContextContract) {
  const user = (request as any).user
  const chatId = params.chatId
  
  const chat = await Chat.query().where('id', chatId).first()
  if (!chat) {
    return response.json({ success: true, messages: [] })
  }
  
  const chatWithMessages = await this.chatsService.showChat(chat.id.toString(), user.id.toString())
  
  return response.json({ success: true, messages: chatWithMessages })
}
```

**MÉTODO 3 - send()**
```typescript
public async send({ request, response }: HttpContextContract) {
  const user = (request as any).user
  const { text, chatId } = request.body()
  
  let chat = await Chat.query().where('id', chatId).first()
  
  const message = await Message.create({
    id_chat: chat.id,
    text,
    sentBy: user.id,
    sentTo: 55,
    seen: false
  })
  
  await message.load('sender')
  Ws.emitNewMessage(chat.id, message)
  
  return response.json({ success: true, message })
}
```

### Voice-over
```
"Aqui está a classe PortfolioChatController.
Ela tem três métodos principais que conectam tudo.

Método init(): Inicializa o chat.
Recebe um deviceId, cria usuário anônimo, gera token, cria o chat.

Método messages(): Busca mensagens.
Valida o usuário, busca o chat, retorna todas as mensagens.

Método send(): Envia mensagens.
Valida o token, validar o texto, cria Message no banco, emite WebSocket.

Esses três métodos trabalham juntos.
init() prepara tudo no começo.
messages() popular o chat com histórico.
send() cria novas mensagens em tempo real.

Toda a integração do portfólio com GirlsChat acontece nesta classe!"
```

### Dica de Gravação
- VS Code com PortfolioChatController.ts aberto
- Font 24pt+ para código
- Use breadcrumbs (file path) destacado
- Cada método em uma cor diferente (syntax highlight)
- Zoom-in em partes importantes do código
- Diagrama ASCII ou Figma mostrando conexão entre métodos
- Mostrar arquivo no file tree (highlight na esquerda)

---

## Reel 4.4 (BONUS) - "Tratamento de Erros"
**Duração:** 50s | **Tipo:** Técnico + Prático

### Timing

| Tempo | Ação | Detalhes |
|-------|------|----------|
| 0:00-0:05 | **Contexto** | "Nem tudo sempre funciona..." |
| 0:05-0:35 | **Cenários** | 4 tipos de erro tratados |
| 0:35-0:45 | **Response** | Como API responde |
| 0:45-0:50 | **Conclusão** | "API defensiva! 🛡️" |

### Timing Detalhado dos Erros

```
0:05-0:12 (7s): ERRO 1 - Token Inválido
  - Cenário: Usuário sem token ou token expirado
  - Request visual com token errado
  - Response na tela:
    {
      "success": false,
      "message": "Token inválido"
    }
  - Status: 401 Unauthorized
  - Ícone: ❌ (vermelho)

0:12-0:19 (7s): ERRO 2 - Chat Não Encontrado
  - Cenário: chatId que não existe
  - Voice: "Chat ID inválido"
  - Response:
    {
      "success": true,
      "chatId": null,
      "messages": []
    }
  - Graceful fail: retorna lista vazia
  - Ícone: ⚠️ (amarelo)

0:19-0:26 (7s): ERRO 3 - Mensagem Sem Texto
  - Cenário: text vazio ou undefined
  - Validação on-screen:
    if (!text) throw Error('Texto é obrigatório')
  - Response:
    {
      "success": false,
      "message": "Texto é obrigatório"
    }
  - Status: 400 Bad Request
  - Ícone: ❌ (vermelho)

0:26-0:33 (7s): ERRO 4 - Usuário Não Autenticado
  - Cenário: Request sem middleware passar
  - Validação:
    if (!user) throw Error('Usuário não autenticado')
  - Response:
    {
      "success": false,
      "message": "Usuário não autenticado"
    }
  - Status: 401 Unauthorized
  - Ícone: ❌ (vermelho)

0:33-0:42 (9s): TRATAMENTO CENTRALIZADO
  - Mostrar try/catch em cada método
  - Pseudocódigo:
    try {
      // lógica do método
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: error.message
      })
    }
  - Voice: "Todo erro é capturado e retornado de forma clara"

0:42-0:50 (8s): RESUMO
  - Tabela visual:
    | Erro | Status | Response |
    |------|--------|----------|
    | Token inválido | 401 | false |
    | Chat não encontrado | 200 | [] |
    | Texto obrigatório | 400 | false |
    | Não autenticado | 401 | false |
  - Texto: "API defensiva! 🛡️"
```

### On-Screen Text
```
0:00: "🛡️ Tratamento de Erros"
0:05: "❌ Erro 1: Token Inválido (401)"
0:12: "⚠️ Erro 2: Chat Não Encontrado (200 - graceful)"
0:19: "❌ Erro 3: Texto Obrigatório (400)"
0:26: "❌ Erro 4: Não Autenticado (401)"
0:33: "try/catch em todo lugar"
0:42: "Resposta sempre clara"
0:50: "🛡️ API Defensiva!"
```

### Voice-over
```
"Nem tudo sempre funciona. Precisamos tratar erros.

Erro 1: Token inválido. Se o token não existe no banco, retornamos 401.

Erro 2: Chat não encontrado. Se chat não existe, retornamos lista vazia em vez de erro.

Erro 3: Texto obrigatório. Se texto está vazio, retornamos 400 Bad Request.

Erro 4: Usuário não autenticado. Se middleware não passou o usuário, retornamos 401.

Em todos os métodos, usamos try/catch.
Se algo der erro, capturamos e retornamos resposta clara.
Sempre com success: false e uma mensagem explicativa.

Isso faz a API ser defensiva e confiável!"
```

### Dica de Gravação
- Mostrar real error responses (Postman ou browser DevTools)
- Color-code os erros: vermelho para 4xx/5xx
- Mostrar console do backend com error logs
- Tabela resumida no final
- Som diferente para cada tipo de erro

---

# 🎥 DICAS DE PRODUÇÃO

## Geral
- ✅ **Duração:** Cada reel 45-60 segundos max
- ✅ **Pacing:** Rápido mas compreensível
- ✅ **Audio:** Voice-over claro + music/efeitos sonoros
- ✅ **Visuais:** Código destacado, animações suaves

## Código
- **Font size:** Mínimo 24pt, ideal 28pt+
- **Line height:** Aumentar para legibilidade
- **Tema:** Dark mode (Dracula, Nord ou One Dark)
- **Syntax highlighting:** Diferente cores para keywords/strings/variables
- **Highlights:** Usar yellow/orange para destacar linhas importantes

## Gravação
- **Câmera:** Celular em 4K se possível, landscape
- **Iluminação:** Natural ou ring light
- **Áudio:** Microfone de qualidade, sem ruído de fundo
- **Screen recording:** OBS Studio ou Camtasia

## Edição
- **Efeitos:** Transições 0.3-0.5s (não muito, não pouco)
- **Zoom:** Quando toca em algo importante
- **Slow-mo:** 0.5x-0.75x quando algo chega em tempo real
- **Cores:** Consistente com branding
- **Subtítulos:** Em português, sincronizado com voice-over

## Performance do Vídeo
- **Cor de fundo:** Gradiente ou cor escura (não preto puro)
- **Texto:** Branco ou amarelo (bom contraste)
- **Ícones:** Usar emoji ou icons simples
- **Captions:** Importante para engajamento

## YouTube/Reels Meta Specs
- **Resolução:** 1080p (1920x1080) para horizontal ou 1080x1920 para vertical
- **Frame rate:** 30fps ou 60fps
- **Bitrate:** 5-8 Mbps
- **Formato:** MP4 H.264
- **Áudio:** AAC 128kbps

---

# 📝 CHECKLIST PRÉ-GRAVAÇÃO

- [ ] Reler roteiro 3x antes de gravar
- [ ] Preparar código/screenshots em ordem
- [ ] VS Code pronto com font aumentada
- [ ] Terminal limpo e pronto
- [ ] Browser com DevTools aberto (network tab)
- [ ] GirlsChat mobile funcionando
- [ ] Portfólio funcionando
- [ ] Áudio testado (sem ruído de fundo)
- [ ] Iluminação adequada
- [ ] Background organizado/clean
- [ ] Roteiro impresso ou em segundo monitor

---

# 🎬 SEQUÊNCIA RECOMENDADA DE GRAVAÇÃO

1. Gravar **BLOCO 1** primeiro (menos técnico, contextualiza)
2. Depois **BLOCO 4.1, 4.2, 4.3** (demo em tempo real)
3. Depois **BLOCO 2** (autenticação - técnico)
4. Por fim **BLOCO 3** (WebSocket - mais complexo)
5. **BONUS 4.4** quando sobrar tempo

Essa ordem mantém momentum e evita ficar muito técnico no começo.

---

**Boa gravação! Qualquer dúvida, volta aqui! 🚀**
