import * as Knex from 'knex';

export class SuppliesMinMaxModel {
  getSuppliesMinMax(db: Knex, hospcode: any) {
    return db('supplies as s')
      .select('s.*', 'smm.id as supplies_min_max_id', 'smm.min', 'smm.max')
      .leftJoin('supplies_min_max as smm', (v) => {
        v.on('smm.supplies_id', 's.id')
        v.on('smm.hospcode', db.raw(hospcode))
      })
  }

  getSuppliesMinMaxBytype(db: Knex, sub_ministry_code, ministry_code, hosptype_code) {
    let sql = db(db('supplies as s').select('s.*', 'h.hospcode', 'h.sub_ministry_code', 'h.ministry_code','h.hosptype_code').join(db.raw('chospital as h')).as('s'))
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
