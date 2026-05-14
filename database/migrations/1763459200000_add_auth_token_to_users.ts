import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddAuthTokenToUsers extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('auth_token').nullable()
      table.string('device_id').nullable().unique()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('auth_token')
      table.dropColumn('device_id')
    })
  }
}
