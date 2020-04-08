import * as Knex from 'knex';

export class HospitalModel {


  getHospTypes(db: Knex) {
    return db('l_hospital_minitry_types')
  }

  getHospByType(db: Knex, offset, limit, q, hosptypeId) {
    let sql = db('l_hospitals')
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
    let sql = db('l_hospitals')
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

  updateHospital(db: Knex, id: any, data = {}) {
    return db('l_hospitals')
      .update(data)
      .where('id', id);
  }

  insertHospital(db: Knex, data = {}) {
    return db('l_hospitals')
      .insert(data);
  }

  deleteHospital(db: Knex, id: any) {
    return db('l_hospitals')
      .update('is_deleted', 'Y')
      .where('id', id);
  }

  checkHospCode(db: Knex, code: any) {
    return db('l_hospitals').where('hospcode', code);
  }

}
