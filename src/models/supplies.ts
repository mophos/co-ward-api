import * as Knex from 'knex';

export class SuppliesModel {

  getSupplies(db: Knex, limit = 100, offset = 0, q = '') {
    return db('supplies')
      .where((v)=>{
        v.where('name', 'like', '%' + q + '%')
        v.orWhere('code', 'like', '%' + q + '%')
      })
      .limit(limit)
      .offset(offset)

  }

  getSuppliesTotal(db: Knex, q = '') {
    return db('supplies')
      .where((v)=>{
        v.where('name', 'like', '%' + q + '%')
        v.orWhere('code', 'like', '%' + q + '%')
      });
  }

  
  getSuppliesById(db: Knex, id: number) {
    return db('supplies')
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
      .delete()
      .where('id', id);
  }

}