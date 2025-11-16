# Comandos Essenciais AdonisJS v5

## 📊 **MIGRATIONS**

### Criar Migrations
```bash
# Criar nova migration
node ace make:migration create_users_table
node ace make:migration add_email_to_users
node ace make:migration alter_users_table

# Criar migration com nome personalizado
node ace make:migration nome_da_migration
```

### Executar Migrations
```bash
# Executar todas as migrations pendentes
node ace migration:run

# Executar migrations com força (ignora warnings)
node ace migration:run --force

# Ver status das migrations
node ace migration:status

# Rollback última migration
node ace migration:rollback

# Rollback até um batch específico
node ace migration:rollback --batch=1

# Rollback todas as migrations
node ace migration:rollback --batch=0

# Refresh - rollback all + migrate
node ace migration:refresh

# Reset - rollback all
node ace migration:reset
```

## 🏗️ **MODELS**

### Criar Models
```bash
# Criar model simples
node ace make:model User
node ace make:model Product
node ace make:model Order

# Criar model com migration
node ace make:model Post --migration
node ace make:model Category -m

# Criar model com controller
node ace make:model Article --controller
node ace make:model Book -c

# Criar model completo (migration + controller)
node ace make:model Project --migration --controller
node ace make:model Task -m -c
```

## 🎮 **CONTROLLERS**

### Criar Controllers
```bash
# Controller simples
node ace make:controller UsersController
node ace make:controller ProductsController

# Controller com resource methods (index, create, store, show, edit, update, destroy)
node ace make:controller PostsController --resource
node ace make:controller ArticlesController -r

# Controller com métodos específicos
node ace make:controller AuthController
```

### Estrutura de Controller Resource
```typescript
// Métodos criados automaticamente com --resource
export default class PostsController {
  public async index({}: HttpContextContract) {}     // GET /posts
  public async create({}: HttpContextContract) {}    // GET /posts/create
  public async store({}: HttpContextContract) {}     // POST /posts
  public async show({}: HttpContextContract) {}      // GET /posts/:id
  public async edit({}: HttpContextContract) {}      // GET /posts/:id/edit
  public async update({}: HttpContextContract) {}    // PUT/PATCH /posts/:id
  public async destroy({}: HttpContextContract) {}   // DELETE /posts/:id
}
```

## 🧪 **TESTES**

### Criar Testes
```bash
# Teste funcional (integração/API)
node ace make:test functional UsersTest
node ace make:test functional CreateUser
node ace make:test functional AuthTest

# Teste unitário
node ace make:test unit UserService
node ace make:test unit ValidationHelper

# Criar com nome exato
node ace make:test functional "Authentication Flow" --exact
```

### Executar Testes
```bash
# Executar todos os testes
node ace test

# Executar suite específica
node ace test functional
node ace test unit

# Executar arquivo específico
node ace test tests/functional/users.spec.ts
node ace test tests/unit/user_service.spec.ts

# Executar com watch mode
node ace test --watch
node ace test -w

# Executar com filtros
node ace test --files tests/functional/auth.spec.ts
node ace test --tags @slow
node ace test --tests "should create user"
node ace test --groups "User registration"

# Executar com timeout personalizado
node ace test --timeout 10000

# Forçar saída após testes
node ace test --force-exit

# Executar apenas testes que falharam
node ace test --failed
```

## 🔧 **COMANDOS AUXILIARES**

### Middleware
```bash
# Criar middleware
node ace make:middleware Auth
node ace make:middleware Cors
```

### Validator
```bash
# Criar validator
node ace make:validator CreateUser
node ace make:validator UpdateProfile
```

### Provider
```bash
# Criar provider
node ace make:provider MyCustomProvider
```

### Command (CLI)
```bash
# Criar comando customizado
node ace make:command SendEmails
node ace make:command GenerateReport
```

### Seeder
```bash
# Criar seeder
node ace make:seeder User
node ace make:seeder DatabaseSeeder

# Executar seeders
node ace db:seed
node ace db:seed --files UserSeeder
```

### Factory
```bash
# Criar factory
node ace make:factory User
node ace make:factory Product
```

## 🚀 **SERVIDOR & BUILD**

### Desenvolvimento
```bash
# Iniciar servidor de desenvolvimento
node ace serve --watch
npm run dev

# Iniciar sem watch
node ace serve
```

### Build & Produção
```bash
# Build para produção
node ace build --production
npm run build

# Iniciar em produção
npm start
node server.js
```

## 📋 **COMANDOS DE INFORMAÇÃO**

### Listagem
```bash
# Listar todas as rotas
node ace list:routes

# Listar comandos disponíveis
node ace --help
node ace list:commands

# Ver informações do projeto
node ace env:get
```

### Banco de Dados
```bash
# Conectar ao banco via REPL
node ace db:wipe    # Limpar banco
node ace db:truncate # Truncar tabelas
```

## 🏃‍♂️ **FLUXO TÍPICO DE DESENVOLVIMENTO**

### 1. Criar feature completa
```bash
# 1. Criar migration
node ace make:migration create_posts_table

# 2. Criar model com controller
node ace make:model Post --controller --migration

# 3. Executar migration
node ace migration:run

# 4. Criar testes
node ace make:test functional PostsController
node ace make:test unit PostService

# 5. Executar testes
node ace test
```

### 2. Workflow com Git
```bash
# Depois de mudanças no banco
node ace migration:run
git add .
git commit -m "Add posts migration and model"

# Executar testes antes do push
node ace test
git push
```

## 🔍 **DEBUGGING & LOGS**

### Logs
```bash
# Ver logs do servidor
node ace serve --watch 2>&1 | tee server.log

# Executar com debug
DEBUG=* node ace serve
```

### Troubleshooting
```bash
# Verificar dependências
npm audit
npm audit fix

# Limpar cache
npm clean-install
rm -rf node_modules package-lock.json && npm install

# Verificar configuração
node ace env:get APP_KEY
node ace repl
```

## 📦 **COMANDOS PACKAGE.JSON TÍPICOS**

```json
{
  "scripts": {
    "dev": "node ace serve --watch",
    "build": "node ace build --production",
    "start": "node server.js",
    "test": "node ace test",
    "test:watch": "node ace test --watch",
    "lint": "eslint . --ext=.ts",
    "format": "prettier --write .",
    "migration:run": "node ace migration:run",
    "migration:rollback": "node ace migration:rollback",
    "db:seed": "node ace db:seed"
  }
}
```

---

> **💡 Dica:** Use `node ace --help` para ver todos os comandos disponíveis e `node ace <command> --help` para ver opções específicas de cada comando.
