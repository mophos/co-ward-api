import * as Knex from 'knex';

export class RestockModel {

  getRestock(db: Knex, limit = 100, offset = 0) {
    return db('restocks')
      .where('is_deleted', 'N')
      .where('is_approved', 'N')
      .limit(limit).offset(offset);
  }

  getRestockTotal(db: Knex) {
    return db('restocks').count('* as count').as('count').where('is_deleted', 'N').where('is_approved', 'N');
  }

  getRestockApproved(db: Knex, limit = 100, offset = 0) {
    return db('restocks')
      .where('is_deleted', 'N')
      .where('is_approved', 'Y')
      .limit(limit).offset(offset);
  }

  getRestockTotalApproved(db: Knex) {
    return db('restocks').count('* as count').as('count').where('is_deleted', 'N').where('is_approved', 'Y');
  }

  getRestockDetail(db: Knex, restockId) {
    return db('restock_details as rd')
      .select('rd.id as restock_detail_id', 's.hospcode')
      .join('chospital as s', 'rd.hospcode', 's.hospcode')
      .where('rd.restock_id', restockId);
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

  removeRestock(db: Knex, id) {
    return db('restocks')
      .update('is_deleted', 'Y')
      .where('id', id);
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
      .select('rd.*', 'c.hospname')
      .join('chospital as c', 'c.hospcode', 'rd.hospcode')
      .where('rd.restock_id', restockId)
      .where('c.hosptype_id', typesId)
  }

  getListSupplies(db: Knex, restockDetailId) {
    return db('restock_detail_items as rdi')
      .select('rdi.*', 's.code', 's.name', 's.unit_name')
      .join('mm_supplies as s', 's.id', 'rdi.supplies_id')
      .where('rdi.restock_detail_id', restockDetailId)
  }

  getRestockInfo(db: Knex, restockId) {
    return db('restocks')
      .where('id', restockId);
  }

  getRestockDetailItem(db: Knex, restockDetailId) {
    return db('restock_detail_items as rdi')
      .select('rdi.*', 's.name as supplies_name', 's.unit_name as supplies_unit', 's.code as supplies_code')
      .join('mm_supplies as s', 'rdi.supplies_id', 's.id')
      .where('rdi.restock_detail_id', restockDetailId);
  }

  getSumSuppliesFromRestockId(db: Knex, restockId) {
    return db('restock_details as rd')
      .select('rdi.supplies_id', 's.code as supplies_code')
      .sum('rdi.qty as qty')
      .join('restock_detail_items as rdi', 'rd.id', 'rdi.restock_detail_id')
      .join('mm_supplies as s', 's.id', 'rdi.supplies_id')
      .where('rd.restock_id', restockId)
      .groupBy('supplies_id')
  }

  getBalanceFromTHPD() {
    return [
      { type_code: 'N', sku_id: 1, qty: 1000 },
      { type_code: '110412020302', sku_id: 1, qty: 1000 },
      { type_code: '110412020305', sku_id: 1, qty: 1000 },
      { type_code: '110412021401', sku_id: 1, qty: 1000 },
      { type_code: '110412021402', sku_id: 1, qty: 1000 },
      { type_code: '110412021403', sku_id: 1, qty: 1000 },
      { type_code: '120405400011', sku_id: 1, qty: 1000 },
      { type_code: '120405400012', sku_id: 1, qty: 1000 },
      { type_code: '6207003', sku_id: 1, qty: 1000 },
      { type_code: '6207007', sku_id: 1, qty: 1000 },
      { type_code: '6207008', sku_id: 1, qty: 1000 },
      { type_code: '6207009', sku_id: 1, qty: 1000 },
      { type_code: '6207010', sku_id: 1, qty: 1000 },
      { type_code: '6207011', sku_id: 1, qty: 1000 },
      { type_code: '6214004', sku_id: 1, qty: 1000 },
      { type_code: '6214012', sku_id: 1, qty: 1000 },
      { type_code: '6214014', sku_id: 1, qty: 1000 },
      { type_code: '6214021', sku_id: 1, qty: 1000 },
      { type_code: '6214022', sku_id: 1, qty: 1000 },
      { type_code: '6214023', sku_id: 1, qty: 1000 },
      { type_code: '6214024', sku_id: 1, qty: 1000 },
      { type_code: '6214025', sku_id: 1, qty: 1000 },
      { type_code: '6214027', sku_id: 1, qty: 1000 },
      { type_code: '6214028', sku_id: 1, qty: 1000 },
      { type_code: '6214029', sku_id: 1, qty: 1000 },
      { type_code: '6214030', sku_id: 1, qty: 1000 },
      { type_code: '6224015', sku_id: 1, qty: 1000 },
      { type_code: '6234016', sku_id: 1, qty: 1000 },
      { type_code: '6244017', sku_id: 1, qty: 1000 },

    ];
  }
  getRestockDetailItems(db: Knex, restockDetailId) {
    return db('restock_detail_items as rdi')
      .select('rdi.*', 's.name as supplies_name', 's.unit_name as supplies_unit', 's.code as supplies_code')
      .join('mm_supplies as s', 'rdi.supplies_id', 's.id')
      .whereIn('rdi.restock_detail_id', restockDetailId);
  }
}