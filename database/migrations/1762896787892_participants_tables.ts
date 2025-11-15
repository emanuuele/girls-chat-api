import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ParticipantsTables extends BaseSchema {
  protected tableName = 'participants'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('id_chat').unsigned().notNullable()
      table.integer('id_user').unsigned().notNullable()
      
      // Foreign keys
      table.foreign('id_chat').references('id').inTable('chats').onDelete('CASCADE')
      table.foreign('id_user').references('id').inTable('users').onDelete('CASCADE')
      
      // Unique constraint para evitar duplicatas
      table.unique(['id_chat', 'id_user'])
      
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
