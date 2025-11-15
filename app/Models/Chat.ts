import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Message from './Message'
import Notification from './Notification'
import Participant from './Participant'

export default class Chat extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public id_host: number

  @column()
  public last_message: string

  @column.dateTime()
  public last_message_at: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // Relacionamentos
  @belongsTo(() => User, {
    foreignKey: 'id_host'
  })
  public host: BelongsTo<typeof User>

  @hasMany(() => Message, {
    foreignKey: 'id_chat'
  })
  public messages: HasMany<typeof Message>

  @hasMany(() => Notification, {
    foreignKey: 'id_chat'
  })
  public notifications: HasMany<typeof Notification>

  // Relacionamento many-to-many com Users através de Participant
  @manyToMany(() => User, {
    pivotTable: 'participants',
    localKey: 'id',
    pivotForeignKey: 'id_chat',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'id_user'
  })
  public participants: ManyToMany<typeof User>

  // Relacionamento com a tabela pivot
  @hasMany(() => Participant, {
    foreignKey: 'id_chat'
  })
  public participantRecords: HasMany<typeof Participant>
}
