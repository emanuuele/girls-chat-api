import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Messages extends BaseSchema {
  protected tableName = 'messages'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('id_chat').unsigned()
      table.text('text')
      table.boolean('seen').defaultTo(false)
      table.integer('sentBy').unsigned()
      table.integer('sentTo').unsigned() 
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      
      // Foreign keys
      table.foreign('id_chat').references('id').inTable('chats')
      table.foreign('sentBy').references('id').inTable('users')
      table.foreign('sentTo').references('id').inTable('users')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
