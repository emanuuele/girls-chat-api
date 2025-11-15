/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import ChatsController from 'App/Controllers/Http/ChatsController'
import MessagesController from 'App/Controllers/Http/MessagesController'
import UsersController from 'App/Controllers/Http/UsersController'

// Rota básica para testes
Route.get('/', async () => {
  return { hello: 'world' }
})

// Rota de debug para verificar usuários
Route.get('/debug/users', async () => {
  const User = (await import('App/Models/User')).default;
  const users = await User.query().select('id', 'name', 'email').limit(10);
  return { users, count: users.length };
})

const usersController = new UsersController()
const chatsController = new ChatsController()
const messagesController = new MessagesController()

Route.post('/criar-usuario', (ctx) => usersController.signUp(ctx))
Route.post('/login', (ctx) => usersController.login(ctx))
Route.get('/usuarios', (ctx) => usersController.index(ctx))
Route.put('/atualizar-usuario/:id', (ctx) => usersController.update(ctx))
Route.get('/usuario/:id', (ctx) => usersController.findById(ctx))

Route.get('/chat', (ctx) => chatsController.show(ctx))
Route.post('/criar-chat', (ctx) => chatsController.create(ctx))

Route.get('/mensagens', (ctx) => messagesController.index(ctx))
Route.post('/criar-mensagem', (ctx) => messagesController.create(ctx))
Route.put('/chat/:id/atualizar-status-visto', (ctx) => messagesController.updateSeenStatus(ctx))

Route.group(() => {
  Route.get('/chats', (ctx) => chatsController.index(ctx))
}).middleware('expoPushNotification')