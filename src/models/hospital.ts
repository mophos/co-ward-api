import * as Knex from 'knex';

export class HospitalModel {


  getHospTypes(db: Knex) {
    return db('chospital_types')
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

  getHospByTypeTotal(db: Knex, q, sub_ministry_code, ministry_code, hosptype_code) {
    let sql = db('l_hospitals')
      .where((v) => {
        v.where('hospname', 'like', '%' + q + '%')
        v.orWhere('hospcode', 'like', '%' + q + '%')
      })
    if (sub_ministry_code)
      sql.where('sub_ministry_code', sub_ministry_code);
    if (ministry_code)
      sql.where('ministry_code', ministry_code);
    if (hosptype_code)
      sql.where('hosptype_code', hosptype_code);
    return sql;
  }

}
