import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddProfilePictureToUsers extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('profile_picture').nullable().after('bio')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('profile_picture')
    })
  }
}
