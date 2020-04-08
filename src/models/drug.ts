import * as Knex from 'knex';

export class DrugsModel {

  getDrugs(db: Knex, limit = 100, offset = 0, q = '') {
    return db('mm_generics')
      .where((v) => {
        v.where('name', 'like', '%' + q + '%')
        v.orWhere('code', 'like', '%' + q + '%')
      })
      .where('is_deleted', 'N')
      .where('is_actived', 'Y')
      .limit(limit)
      .offset(offset)
  }

  getDrugsTotal(db: Knex, q = '') {
    return db('mm_generics')
      .count('* as count')
      .where((v) => {
        v.where('name', 'like', '%' + q + '%')
        v.orWhere('code', 'like', '%' + q + '%')
      })
      .where('is_deleted', 'N');
  }

  getDrugsActived(db: Knex) {
    return db('mm_generics')
      .where('is_deleted', 'N')
      .where('is_actived', 'Y')
  }

  updateDrugs(db: Knex, id: any, data = {}) {
    return db('mm_generics')
      .update(data)
      .where('id', id);
  }

  insertDrugs(db: Knex, data = {}) {
    return db('mm_generics')
      .insert(data);
  }

  deleteDrugs(db: Knex, id: any) {
    return db('mm_generics')
      .update('is_deleted', 'Y')
      .where('id', id);
  }

}