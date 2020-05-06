import * as Knex from 'knex';

export class DrugsModel {

  getDrugs(db: Knex, limit = 100, offset = 0, q = '') {
    return db('b_generics')
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
    return db('b_generics')
      .count('* as count')
      .where((v) => {
        v.where('name', 'like', '%' + q + '%')
        v.orWhere('code', 'like', '%' + q + '%')
      })
      .where('is_deleted', 'N');
  }

  getDrugsActived(db: Knex) {
    return db('b_generics')
      .where('is_deleted', 'N')
      .where('is_actived', 'Y')
      .where('type', 'DRUG')
      .orderBy('id')
  }

  updateDrugs(db: Knex, id: any, data = {}) {
    return db('b_generics')
      .update(data)
      .update('update_date', db.fn.now())
      .where('id', id);
  }

  insertDrugs(db: Knex, data = {}) {
    return db('b_generics')
      .insert(data);
  }

  deleteDrugs(db: Knex, id: any, userId) {
    return db('b_generics')
      .update('is_deleted', 'Y')
      .update('updated_by', userId)
      .update('update_date', db.fn.now())
      .where('id', id);
  }

  getDrugStock(db: Knex, hospitalId: any) {
    return db('wm_drugs as ds')
      .select('ds.*', 't.name', 'u.fname', 'u.lname')
      .leftJoin('um_users as u', 'u.id', 'ds.create_by')
      .leftJoin('um_titles as t', 't.id', 'u.title_id')
      .where('ds.hospital_id', hospitalId)
      .orderBy('ds.create_date')
  }

  getDrugStockDetails(db: Knex, id: any) {
    return db('wm_drug_details as  dsd')
      .select('dsd.*', 'mg.name', 'u.name as unit_name')
      .join('b_generics as mg', 'mg.id', 'dsd.generic_id')
      .leftJoin('b_units as u', 'u.id', 'mg.unit_id')
      .where('dsd.wm_drug_id', id);
  }

  saveHead(db: Knex, data) {
    return db('wm_drugs')
      .insert(data, 'id');
  }
  saveDetail(db: Knex, data) {
    return db('wm_drug_details')
      .insert(data);
  }
}