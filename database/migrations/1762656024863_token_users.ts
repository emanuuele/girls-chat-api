import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class TokenUsers extends BaseSchema {
  protected tableName = 'token_users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('id_user')
      table.string('expo_token')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.foreign('id_user').references('id').inTable('users')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
