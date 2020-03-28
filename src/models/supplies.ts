import * as Knex from 'knex';

export class SuppliesModel {

  getSupplies(db: Knex) {
    return db('supplies');
  }

  getSuppliesById(db: Knex, id: number) {
    return db('supplies')
      .where(id);
  }

  updateSupplies(db: Knex, id: number, data = {}) {
    return db('supplies')
      .update(data)
      .where(id);
  }

  insertSupplies(db: Knex, data = {}) {
    return db('supplies')
      .insert(data);
  }

  deleteSupplies(db: Knex, id: number) {
    return db('supplies')
      .delete()
      .where(id);
  }

}