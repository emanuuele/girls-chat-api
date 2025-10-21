import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AdicionarCamposNotificacoes extends BaseSchema {
  protected tableName = 'notifications'

  public async up () {
   this.schema.alterTable(this.tableName, (table) => {
      table.integer('id_chat').unsigned().after('id')
      table.integer('id_user').unsigned().after('id_chat')
      table.text('text').after('id_user')
      table.boolean('seen').defaultTo(false).after('text')

      // Foreign keys
      table.foreign('id_chat').references('id').inTable('chats')
      table.foreign('id_user').references('id').inTable('users')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
