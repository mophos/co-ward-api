import * as Knex from 'knex';

export class RestocCollectionkModel {

  getRestockCollection(db: Knex, limit = 100, offset = 0) {
    return db('view_restock_collection').limit(limit).offset(offset)
  }

  getRestockCollectionTotal(db: Knex) {
    return db('view_restock_collection').count('id as count')
  }

}