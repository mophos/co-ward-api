import * as Knex from 'knex';

export class RestockModel {

  getRestock(db: Knex, limit = 100, offset = 0) {
    return db('restock').limit(limit).offset(offset);
  }

  getRestockTotal(db: Knex) {
    return db('restock').count().as('count');
  }

  getRestockDetail(db: Knex, restockId) {
    return db('restock').where('id', restockId)
  }

  getRestockDetailTotal(db: Knex, restockId) {
    return db('restock').count().as('count').where('id', restockId)
  }

  insertRestock(db: Knex, data = {}) {
    return db('restock')
    .insert(data)
  }

  deleteRestock(db: Knex, id) {
    return db('restock')
    .delete()
    .where('id', id)
  }

  insertRestockDetail(db: Knex, data = [{}]) {
    return db('restock_detail')
    .insert(data)
  }
}
