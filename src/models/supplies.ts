import * as Knex from 'knex';

export class SuppliesModel {

  getSupplies(db: Knex, limit = 100, offset = 0, q = '') {
    return db('supplies')
      .where((v) => {
        v.where('name', 'like', '%' + q + '%')
        v.orWhere('code', 'like', '%' + q + '%')
      })
      .where('is_deleted', 'N')
      .limit(limit)
      .offset(offset)

  }

  getSuppliesTotal(db: Knex, q = '') {
    return db('supplies')
      .where((v) => {
        v.where('name', 'like', '%' + q + '%')
        v.orWhere('code', 'like', '%' + q + '%')
      })
      .where('is_deleted', 'N');
  }


  getSuppliesById(db: Knex, id: number) {
    return db('supplies')
      .where('is_deleted', 'N')
      .where('id', id);
  }

  updateSupplies(db: Knex, id: number, data = {}) {
    return db('supplies')
      .update(data)
      .where('id', id);
  }

  insertSupplies(db: Knex, data = {}) {
    return db('supplies')
      .insert(data);
  }

  deleteSupplies(db: Knex, id: number) {
    return db('supplies')
      .update('is_deleted', 'Y')
      .where('id', id);
  }

}