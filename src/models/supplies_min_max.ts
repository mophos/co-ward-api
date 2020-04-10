import * as Knex from 'knex';

export class SuppliesMinMaxModel {
  getSuppliesMinMax(db: Knex, hospcode: any) {
    return db('view_supplies_min_max_all as smm')
      // .select('smm.*','s.code','s.name','s.unit_name')
      // .join('mm_supplies as s', 's.id', 'smm.supplies_id')
      .where('smm.hospcode', hospcode)
  }

  getGenericSupplie(db: Knex) {
    return db('mm_generic_supplies as g')
      .where('g.is_deleted', 'N')
      .where('g.is_actived', 'Y')
  }

  getGenericSupplieHospcode(db: Knex, hospcode: any) {
    return db('mm_requisition_supplies_center_generics as g')
      .join('mm_generic_supplies as mg', 'mg.id', 'g.generic_id')
      .where('g.hospcode', hospcode)
  }

  getSuppliesMinMaxBytype(db: Knex, sub_ministry_code, ministry_code, hosptype_code) {
    let sql = db(db('mm_supplies as s').select('s.*', 'h.hospcode', 'h.sub_ministry_code', 'h.ministry_code', 'h.hosptype_code').join(db.raw('l_hospitals as h')).as('s'))
      .select('s.*', 'smm.id as supplies_min_max_id', 'smm.min', 'smm.max')

    sql.leftJoin('wm_supplies_min_max as smm', (v) => {
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
    return db('wm_supplies_min_max')
      .delete()
      .where('hospcode', hospcode);
  }

  insertSuppliesMinMax(db: Knex, data = {}) {
    return db('wm_supplies_min_max')
      .insert(data);
  }

  saveMinMaxReq(db: Knex, data: any) {
    return db('mm_requisition_supplies_center_generics')
      .insert(data);
  }

  delMinMax(db: Knex, hospcode: any) {
    return db('mm_requisition_supplies_center_generics')
      .del().where('hospcode', hospcode);
  }
}
