import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Chat from './Chat'
import Message from './Message'
import Notification from './Notification'
import Participant from './Participant'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public password: string

  @column()
  public name: string

  @column()
  public bio: string

  @column()
  public profile_picture: string

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

  // Relacionamento many-to-many com Chats através de Participant
  @manyToMany(() => Chat, {
    pivotTable: 'participants',
    localKey: 'id',
    pivotForeignKey: 'id_user',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'id_chat'
  })
  public participatingChats: ManyToMany<typeof Chat>

  // Relacionamento com a tabela pivot
  @hasMany(() => Participant, {
    foreignKey: 'id_user'
  })
  public participantRecords: HasMany<typeof Participant>
}
