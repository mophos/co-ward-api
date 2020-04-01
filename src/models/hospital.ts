import * as Knex from 'knex';

export class HospitalModel {


  getHospTypes(db: Knex) {
    return db('l_hospital_minitry_types')
  }

  getHospByType(db: Knex, offset, limit, q, hosptypeId) {
    let sql = db('l_hospitals')
      .where((v) => {
        v.where('hospname', 'like', '%' + q + '%')
        v.orWhere('hospcode', 'like', '%' + q + '%')
      })
    sql.where('hosptype_id', hosptypeId)
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
    sql.where('hosptype_id', hosptypeId)
    return sql
  }

}
