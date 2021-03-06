import * as Knex from 'knex';

export class HospitalModel {


  getMinistryType(db: Knex) {
    return db('b_hospital_ministry_types')
  }

  getMinistry(db: Knex) {
    return db('b_hospital_ministry')
  }


  getSubMinistry(db: Knex) {
    return db('b_hospital_subministry')
  }


  getHospitalType(db: Knex) {
    return db('b_hospital_types')
  }

  getHospTypes(db: Knex) {
    return null;
  }


  getHospitalByHospCode (db: Knex, hospcode: string) {
    return db('b_hospitals').select('*').where('hospcode', hospcode).where('is_deleted', 'N')
  }

  getHospByType(db: Knex, offset, limit, q, hosptypeId) {
    let sql = db('b_hospitals')
      .where('is_deleted', 'N')
      .where((v) => {
        v.where('hospname', 'like', '%' + q + '%')
        v.orWhere('hospcode', 'like', '%' + q + '%')
      })
    if (hosptypeId) {
      sql.where('hosptype_id', hosptypeId)
    }
    sql.limit(limit)
      .offset(offset);
    return sql
  }

  getHospByTypeTotal(db: Knex, q, hosptypeId) {
    let sql = db('b_hospitals')
      .count('* as count')
      .where((v) => {
        v.where('hospname', 'like', '%' + q + '%')
        v.orWhere('hospcode', 'like', '%' + q + '%')
      })
    if (hosptypeId) {
      sql.where('hosptype_id', hosptypeId)
    }
    return sql
  }

  updateHospital(db: Knex, id: any, data = {}, userId) {
    return db('b_hospitals')
      .update(data)
      .update('updated_by', userId)
      .update('update_date', db.fn.now())
      .where('id', id);
  }

  insertHospital(db: Knex, data = {}) {
    return db('b_hospitals')
      .insert(data);
  }

  deleteHospital(db: Knex, id: any, userId) {
    return db('b_hospitals')
      .update('is_deleted', 'Y')
      .update('updated_by', userId)
      .update('update_date', db.fn.now())
      .where('id', id);
  }

  checkHospCode(db: Knex, code: any) {
    return db('b_hospitals').where('hospcode', code);
  }

  getNextInsertId(db: Knex) {
    return db('b_hospitals as b').select('b.id as id').orderBy('b.id', 'DESC').limit(1);
  }

  getHospitalCounter(db: Knex, label: string) {
    return db('hospital_create_counter').select('*').orderBy('id', 'DESC').where('label', label);
  }
  
  addHospitelCounter(db: Knex, label: string) {
    return db('hospital_create_counter').increment('count',1).where('label', label);
  }

  getZone(db: Knex, provinceCode) {
    return db('b_province').where('code', provinceCode);
  }

}
