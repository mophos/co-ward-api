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

  getSuppliesRestockByBalance(db: Knex, hospcode = undefined) {
    let sql = db('view_forecast')
    if (hospcode)
      sql.where('hospcode', hospcode);
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

  getSupplies(db: Knex, code) {
    return db('supplies')
      .where('code', code)
  }

  remove(db: Knex, id) {
    return db('restock_detail_items').delete().whereIn('restock_detail_id', id);
  }
  removeTemp(db: Knex) {
    return db('restock_detail_items_temp').delete();
  }

  insert(db: Knex, data) {
    return db('restock_detail_items_temp').insert(data);
  }

  // update(db: Knex, data) {
  //   let sql = `UPDATE restock_detail_items as rdi
  //     join supplies as s on rdi.supplies_id = s.id 
  //     set rdi.qty = ${data.qty}
  //     where s.code = '${data.supplies_code}' and restock_detail_id = '${data.id}'`;
  //   return db.raw(sql);
  // }
  update(db: Knex, data) {
    let sql = `insert restock_detail_items (supplies_id,qty,restock_detail_id)
      select s.id,r.qty,r.restock_detail_id from restock_detail_items_temp as r
      join supplies as s on r.supplies_code = s.code`
    return db.raw(sql);
  }

}
