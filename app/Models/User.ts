import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Chat from './Chat'
import Message from './Message'
import Notification from './Notification'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public password: string

  @column()
  public name: string

  @column.dateTime()
  public lastLogin: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // Relacionamentos
  @hasMany(() => Chat, {
    foreignKey: 'id_host'
  })
  public hostedChats: HasMany<typeof Chat>

  @hasMany(() => Chat, {
    foreignKey: 'participant'
  })
  public participatingChats: HasMany<typeof Chat>

  @hasMany(() => Message, {
    foreignKey: 'sentBy'
  })
  public sentMessages: HasMany<typeof Message>

  @hasMany(() => Message, {
    foreignKey: 'sentTo'
  })
  public receivedMessages: HasMany<typeof Message>

  @hasMany(() => Notification, {
    foreignKey: 'id_user'
  })
  public notifications: HasMany<typeof Notification>
}
