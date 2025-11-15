# Testes de Unidade - Girls Chat API

Este documento explica como executar e criar testes de unidade para os services da aplicação.

## Estrutura de Testes

```
tests/
├── unit/
│   ├── chats_service.spec.ts     # Testes para ChatsService
│   ├── messages_service.spec.ts  # Testes para MessagesService
│   └── user_service.spec.ts      # Testes para UserService
├── functional/
│   └── hello_world.spec.ts       # Testes funcionais/integração
└── bootstrap.ts                  # Configuração dos testes
```

## Como Executar os Testes

### Executar todos os testes
```bash
node ace test
```

### Executar apenas testes de unidade
```bash
node ace test --suite unit
```

### Executar apenas testes funcionais
```bash
node ace test --suite functional
```

### Executar um arquivo específico
```bash
node ace test tests/unit/chats_service.spec.ts
```

### Executar com modo watch (re-executa quando arquivos mudam)
```bash
node ace test --watch
```

## Cobertura dos Testes

### ChatsService
- ✅ Criar novo chat entre usuários
- ✅ Validar chat duplicado
- ✅ Validar parâmetros obrigatórios
- ✅ Buscar chats de um usuário
- ✅ Buscar chat específico com mensagens
- ✅ Tratamento de erros

### MessagesService
- ✅ Buscar mensagens por chat
- ✅ Criar nova mensagem
- ✅ Criar mensagem e chat automaticamente
- ✅ Validar campos obrigatórios
- ✅ Atualizar status de visualização
- ✅ Tratamento de erros

### UserService
- ✅ Criar novo usuário
- ✅ Validar email duplicado
- ✅ Validar campos obrigatórios
- ✅ Validar formato de email
- ✅ Login com email e senha
- ✅ Atualizar dados do usuário
- ✅ Buscar usuários (exceto um específico)
- ✅ Tratamento de erros

## Padrões de Teste

### Setup e Teardown
Cada grupo de teste usa transações de banco de dados para isolamento:
```typescript
group.each.setup(async () => {
  await Database.beginGlobalTransaction()
  // Criar dados de teste
})

group.each.teardown(async () => {
  await Database.rollbackGlobalTransaction()
})
```

### Estrutura de Teste
```typescript
test('deve [ação esperada]', async ({ assert }) => {
  // Arrange - Preparar dados
  const userData = { ... }
  
  // Act - Executar ação
  const result = await service.method(userData)
  
  // Assert - Verificar resultado
  assert.exists(result.id)
  assert.equal(result.name, userData.name)
})
```

### Teste de Erros
```typescript
test('deve falhar quando [condição de erro]', async ({ assert }) => {
  try {
    await service.methodThatShouldFail('')
    assert.fail('Deveria ter lançado erro')
  } catch (error) {
    assert.include(error.message, 'Mensagem de erro esperada')
  }
})
```

## Mocks e Stubs

Para testes mais complexos, você pode usar mocks:
```typescript
import { test } from '@japa/runner'
import sinon from 'sinon'

test('deve usar mock', async ({ assert }) => {
  const stub = sinon.stub(ExternalService, 'method').returns('mocked result')
  
  const result = await service.methodThatUsesExternalService()
  
  assert.equal(result, 'mocked result')
  stub.restore()
})
```

## Comandos Úteis

```bash
# Executar testes com saída detalhada
node ace test --verbose

# Executar testes e parar no primeiro erro
node ace test --bail

# Executar apenas testes que falharam anteriormente
node ace test --failed

# Gerar relatório de cobertura (se configurado)
node ace test --coverage
```

## Dicas

1. **Isolamento**: Cada teste deve ser independente
2. **Nomenclatura**: Use nomes descritivos que expliquem o que está sendo testado
3. **Arrange-Act-Assert**: Siga este padrão para organizar seus testes
4. **Edge Cases**: Teste cenários de erro e casos extremos
5. **Performance**: Mantenha os testes rápidos usando transações de banco

## Adicionando Novos Testes

1. Crie um arquivo `.spec.ts` na pasta apropriada
2. Importe as dependências necessárias
3. Configure o grupo de teste com setup/teardown
4. Escreva testes individuais seguindo os padrões
5. Execute os testes para verificar se passam

## Configuração do Banco de Teste

Os testes usam o mesmo banco configurado em `.env`. Para usar um banco específico para testes, crie um arquivo `.env.testing` com configurações separadas.
