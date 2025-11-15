import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Chat from './Chat'
import User from './User'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public id_chat: number

  @column()
  public text: string

  @column()
  public seen: boolean

  @column({ columnName: 'sentBy' })
  public sentBy: number

  @column({ columnName: 'sentTo' })
  public sentTo: number

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
    foreignKey: 'sentBy'
  })
  public sender: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'sentTo'
  })
  public receiver: BelongsTo<typeof User>
}
