import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class BioFields extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('bio').nullable().after('name')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('bio')
    })
  }
}
