import * as Knex from 'knex';

export class RestockModel {

  getRestock(db: Knex, limit = 100, offset = 0) {
    return db('restocks').limit(limit).offset(offset);
  }

  getRestockTotal(db: Knex) {
    return db('restocks').count('* as count').as('count');
  }

  getRestockDetail(db: Knex, restockId) {
    return db('restock_details').where('restock_id', restockId)
  }

  getRestockDetailTotal(db: Knex, restockId) {
    return db('restock_details').count('* as count').where('restock_id', restockId)
  }

  insertRestock(db: Knex, data = {}) {
    return db('restocks')
      .insert(data)
  }

  deleteRestock(db: Knex, id) {
    return db('restocks')
      .delete()
      .where('id', id)
  }

  insertRestockDetail(db: Knex, data = {}) {
    return db('restock_details')
      .insert(data)
  }

  insertRestockDetailItem(db: Knex, data = [{}]) {
    return db('restock_detail_items')
      .insert(data)
  }

  deleteRestockDetailItem(db: Knex, id) {
    return db('restock_detail_items')
      .delete()
      .where('restock_detail_id', id)
  }

  getSuppliesRestockByBalance(db: Knex, hospcode = undefined) {
    let sql = db('view_forecast')
    if (hospcode)
      sql.whereIn('hospcode', hospcode);
    return sql
  }

  getSuppliesRestockByHosp(db: Knex, sub_ministry_code = undefined, ministry_code = undefined, hosptype_code = undefined) {
    let sql = db('view_forecast_hosp')
    if (sub_ministry_code)
      sql.where('sub_ministry_code', sub_ministry_code);
    if (ministry_code)
      sql.where('ministry_code', ministry_code);
    if (hosptype_code)
      sql.where('hosptype_code', hosptype_code);
    return sql
  }

  getListHospital(db: Knex, restockId, typesId) {
    return db('restock_details as rd')
      .select('rd.*','c.hospname')
      .join('chospital as c', 'c.hospcode', 'rd.hospcode')
      .where('rd.restock_id', restockId)
      .where('c.hosptype_id', typesId)
  }

  getListSupplies(db: Knex, restockDetailId){
    return db('restock_detail_items as rdi')
      .select('rdi.*','s.code','s.name','s.unit_name')
      .join('supplies as s','s.id','rdi.supplies_id')
      .where('rdi.restock_detail_id',restockDetailId)
  }

}
