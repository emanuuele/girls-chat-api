import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Message from './Message'
import Notification from './Notification'

export default class Chat extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public id_host: number

  @column()
  public last_message: string

  @column.dateTime()
  public last_message_at: DateTime

  @column()
  public participant: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // Relacionamentos
  @belongsTo(() => User, {
    foreignKey: 'id_host'
  })
  public host: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'participant'
  })
  public participantUser: BelongsTo<typeof User>

  @hasMany(() => Message, {
    foreignKey: 'id_chat'
  })
  public messages: HasMany<typeof Message>

  @hasMany(() => Notification, {
    foreignKey: 'id_chat'
  })
  public notifications: HasMany<typeof Notification>
}
