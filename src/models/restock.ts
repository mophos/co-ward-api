import * as Knex from 'knex';

export class RestockModel {

  getRestock(db: Knex, limit = 100, offset = 0) {
    return db('wm_restocks')
      .where('is_deleted', 'N')
      .where('is_approved', 'N')
      .limit(limit).offset(offset);
  }

  getRestockTotal(db: Knex) {
    return db('wm_restocks').count('* as count').as('count').where('is_deleted', 'N').where('is_approved', 'N');
  }

  getRestockApproved(db: Knex, limit = 100, offset = 0) {
    return db('wm_restocks')
      .where('is_deleted', 'N')
      .where('is_approved', 'Y')
      .limit(limit).offset(offset);
  }

  getRestockTotalApproved(db: Knex) {
    return db('wm_restocks').count('* as count').as('count').where('is_deleted', 'N').where('is_approved', 'Y');
  }

  getRestockDetail(db: Knex, restockId) {
    return db('wm_restock_details as rd')
      .select('rd.id as restock_detail_id', 's.hospcode', 's.hospname')
      .join('l_hospitals as s', 'rd.hospcode', 's.hospcode')
      .where('rd.restock_id', restockId);
  }

  getRestockDetails(db: Knex, restockId) {
    return db('wm_restock_details as rd')
      .select('rd.id as restock_detail_id', 's.hospcode', db.raw('CONCAT(r.code,s.hospcode) as con_no'))
      .join('l_hospitals as s', 'rd.hospcode', 's.hospcode')
      .join('wm_restocks as r', 'r.id', 'rd.restock_id')
      .where('rd.restock_id', restockId)
  }

  getRestockDetailTotal(db: Knex, restockId) {
    return db('wm_restock_details').count('* as count').where('restock_id', restockId)
  }

  insertRestock(db: Knex, data = {}) {
    return db('wm_restocks')
      .insert(data)
  }

  deleteRestock(db: Knex, id) {
    return db('wm_restocks')
      .delete()
      .where('id', id)
  }

  insertRestockDetail(db: Knex, data = {}) {
    return db('wm_restock_details')
      .insert(data)
  }

  insertRestockDetailItem(db: Knex, data = [{}]) {
    return db('wm_restock_detail_items')
      .insert(data)
  }

  deleteRestockDetailItem(db: Knex, id) {
    return db('wm_restock_detail_items')
      .delete()
      .where('restock_detail_id', id)
  }

  removeRestock(db: Knex, id, userId) {
    return db('wm_restocks')
      .update('is_deleted', 'Y')
      .update('updated_by', userId)
      .update('update_date', db.fn.now())
      .where('id', id);
  }

  getSuppliesRestockByBalance(db: Knex, hospcode = undefined) {
    let sql = db('view_supplies_min_max_all')
    if (hospcode)
      sql.whereIn('hospcode', hospcode);
    return sql
  }

  getSuppliesRestockByHosp(db: Knex, sub_ministry_code = undefined, ministry_code = undefined, hosptype_code = undefined) {
    let sql = db('l_hospitals')
    if (sub_ministry_code)
      sql.where('sub_ministry_code', sub_ministry_code);
    if (ministry_code)
      sql.where('ministry_code', ministry_code);
    if (hosptype_code)
      sql.where('hosptype_code', hosptype_code);
    return sql
  }

  getSupplies(db: Knex, code) {
    return db('wm_supplies')
      .where('code', code)
  }

  getSuppliesHos(db: Knex) {
    return db('mm_supplies')
  }

  remove(db: Knex, id) {
    return db('wm_restock_detail_items').delete().whereIn('restock_detail_id', id);
  }
  removeTemp(db: Knex) {
    return db('wm_restock_detail_items_temp').delete();
  }

  insert(db: Knex, data) {
    return db('wm_restock_detail_items_temp').insert(data);
  }

  update(db: Knex) {
    let sql = `insert wm_restock_detail_items (supplies_id,qty,restock_detail_id,updated_entry)
      select s.id,r.qty,r.restock_detail_id,now() from wm_restock_detail_items_temp as r
      join mm_supplies as s on r.supplies_code = s.code`
    return db.raw(sql);
  }

  getListHospital(db: Knex, restockId, typesId) {
    return db('wm_restock_details as rd')
      .select('rd.*', 'c.hospname')
      .join('l_hospitals as c', 'c.hospcode', 'rd.hospcode')
      .where('rd.restock_id', restockId)
      .where('c.hosptype_id', typesId)
  }

  getListSupplies(db: Knex, restockDetailId) {
    return db('wm_restock_detail_items as rdi')
      .select('rdi.*', 's.code', 's.name', 's.unit_name')
      .join('mm_supplies as s', 's.id', 'rdi.supplies_id')
      .where('rdi.restock_detail_id', restockDetailId)
  }

  getRestockInfo(db: Knex, restockId) {
    return db('wm_restocks')
      .where('id', restockId);
  }
  getStatusTracking(db: Knex, restockId) {
    //     SELECT h.hospcode,h.hospname,r.created_at,p.tracking,p.co_no,p.status_code,p.status_name,status_update 
    // from wm_restock_details as rd
    // join wm_restocks as r on rd.restock_id = r.id
    // join wm_pays as p on rd.id = p.restock_detail_id 
    // join l_hospitals as h on p.hospcode = h.hospcode
    // limit 10

    return db('wm_restock_details as rd')
      .select('h.hospcode', 'h.hospname', 'r.created_at', 'p.tracking', 'p.co_no', 'p.status_code', 'p.status_name', 'status_update')
      .join('wm_restocks as r', 'rd.restock_id', 'r.id')
      .join('wm_pays as p', 'rd.id', 'p.restock_detail_id')
      .join('l_hospitals as h', 'p.hospcode', 'h.hospcode')
      .where('rd.restock_id', restockId);
  }

  getRestockDetailItem(db: Knex, restockDetailId) {
    return db('wm_restock_detail_items as rdi')
      .select('rdi.*', 's.name as supplies_name', 's.unit_name as supplies_unit', 's.code as supplies_code')
      .join('mm_supplies as s', 'rdi.supplies_id', 's.id')
      .where('rdi.restock_detail_id', restockDetailId);
  }

  getSumSuppliesFromRestockId(db: Knex, restockId) {
    return db('wm_restock_details as rd')
      .select('rdi.supplies_id', 's.code as supplies_code', 'rd.hospcode')
      .sum('rdi.qty as qty')
      .join('wm_restock_detail_items as rdi', 'rd.id', 'rdi.restock_detail_id')
      .join('mm_supplies as s', 's.id', 'rdi.supplies_id')
      .where('rd.restock_id', restockId)
      .groupBy('supplies_id')
  }

  getBalanceFromTHPD(db: Knex) {
    return db('balance_thpd');
  }

  getRestockDetailItems(db: Knex, restockDetailId) {
    return db('wm_restock_detail_items as rdi')
      .select('rdi.*', 's.name as supplies_name', 's.unit_name as supplies_unit', 's.code as supplies_code')
      .join('mm_supplies as s', 'rdi.supplies_id', 's.id')
      .whereIn('rdi.restock_detail_id', restockDetailId);
  }
}