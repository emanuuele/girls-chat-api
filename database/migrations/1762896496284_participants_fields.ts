import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ParticipantsFields extends BaseSchema {
  protected tableName = 'chats'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('participant')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('participant').unsigned()
      table.foreign('participant').references('id').inTable('users')
    })
  }
}
