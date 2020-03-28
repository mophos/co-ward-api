import * as Knex from 'knex';

export class HospitalModel {


  getHospTypes(db: Knex) {
    return db.raw(`SELECT DISTINCT 
    if(sub_ministry_code is null,ministry_name,if(sub_ministry_code='21002',hosptype_name,sub_ministry_name)) as name,
    hosptype_code,
    ministry_code,
    sub_ministry_code
    from chospital `)
  }

  getHospByType(db: Knex, offset, limit, q, sub_ministry_code, ministry_code, hosptype_code) {
    let sql = db('chospital')
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
    sql.limit(limit)
      .offset(offset);
    return sql
  }
  
  getHospByTypeTotal(db: Knex, q, sub_ministry_code, ministry_code, hosptype_code) {
    let sql = db('chospital')
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
