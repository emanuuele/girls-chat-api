import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Chat from './Chat'
import User from './User'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public id_chat: number

  @column()
  public id_user: number

  @column()
  public text: string

  @column()
  public seen: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // Relacionamentos
  @belongsTo(() => Chat, {
    foreignKey: 'id_chat'
  })
  public chat: BelongsTo<typeof Chat>

  @belongsTo(() => User, {
    foreignKey: 'id_user'
  })
  public user: BelongsTo<typeof User>
}
