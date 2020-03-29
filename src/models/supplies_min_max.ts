import * as Knex from 'knex';

export class SuppliesMinMaxModel {
  getSuppliesMinMax(db: Knex, hospcode: any) {
    return db('supplies_min_max as smm')
      .select('smm.*','s.code','s.name','s.unit_name')
      .join('supplies as s', 's.id', 'smm.supplies_id')
      .where('smm.hospcode', hospcode)
  }

  getSuppliesMinMaxBytype(db: Knex, sub_ministry_code, ministry_code, hosptype_code) {
    let sql = db(db('supplies as s').select('s.*', 'h.hospcode', 'h.sub_ministry_code', 'h.ministry_code', 'h.hosptype_code').join(db.raw('chospital as h')).as('s'))
      .select('s.*', 'smm.id as supplies_min_max_id', 'smm.min', 'smm.max')

    sql.leftJoin('supplies_min_max as smm', (v) => {
      v.on('smm.supplies_id', 's.id')
    })
    if (sub_ministry_code)
      sql.where('sub_ministry_code', sub_ministry_code);
    if (ministry_code)
      sql.where('ministry_code', ministry_code);
    if (hosptype_code)
      sql.where('hosptype_code', hosptype_code);
    return sql
  }

  getSuppliesMinMaxByBalance(db: Knex, hospcode = undefined) {
    let sql = db('view_forecast')
    if (hospcode)
      sql.where('hospcode', hospcode);
    return sql
  }

  getSuppliesMinMaxByHosp(db: Knex, sub_ministry_code, ministry_code, hosptype_code) {
    let sql = db('view_forecast_hosp')
    if (sub_ministry_code)
      sql.where('sub_ministry_code', sub_ministry_code);
    if (ministry_code)
      sql.where('ministry_code', ministry_code);
    if (hosptype_code)
      sql.where('hosptype_code', hosptype_code);
    return sql
  }

  getSuppliesMinMaxByBalanceTotal(db: Knex, hospcode) {
    return db('view_forecast')
      .count('* as count')
      .where('hospcode', hospcode);
  }

  getSuppliesMinMaxByHospTotal(db: Knex, sub_ministry_code, ministry_code, hosptype_code) {
    let sql = db('view_forecast_hosp')
      .count('* as count')
    if (sub_ministry_code)
      sql.where('sub_ministry_code', sub_ministry_code);
    if (ministry_code)
      sql.where('ministry_code', ministry_code);
    if (hosptype_code)
      sql.where('hosptype_code', hosptype_code);
    return sql
  }

  deleteSuppliesMinMax(db: Knex, hospcode: any) {
    return db('supplies_min_max')
      .delete()
      .where('hospcode', hospcode);
  }

  insertSuppliesMinMax(db: Knex, data = {}) {
    return db('supplies_min_max')
      .insert(data);
  }
}
