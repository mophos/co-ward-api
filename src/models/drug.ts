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

  getDrugStock(db: Knex, hospcode: any) {
    return db('wm_drug_stocks as ds')
      .select('ds.*', 't.name', 'u.fname', 'u.lname')
      .leftJoin('um_users as u', 'u.id', 'ds.created_by')
      .leftJoin('um_titles as t', 't.id', 'u.title_id')
      .where('ds.hospcode', hospcode)
      .orderBy('ds.created_at')
  }

  getDrugStockDetails(db: Knex, id: any) {
    return db('wm_drug_stock_details as  dsd')
      .select('dsd.*', 'mg.code', 'mg.name', 'mg.unit_name')
      .join('mm_generics as mg', 'mg.id', 'dsd.bed_id')
      .where('dsd.bed_stock_id', id);
  }

}