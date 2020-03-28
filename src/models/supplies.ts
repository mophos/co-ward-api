import * as Knex from 'knex';

export class SuppliesModel {

  getSupplies(db: Knex) {
    return db('supplies')
  }

  getSuppliesById(db: Knex, id: number) {
    return db('supplies')
    .where('id')
  }

}