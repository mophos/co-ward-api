import * as Knex from 'knex';

export class BalanceModel {

  getSupplies(db: Knex, hospcode) {
    let sql = db('mm_supplies AS ms')
      .select('ms.*', 'wcs.usage_rate_day')
      .leftJoin('wm_supplies_min_max AS wsmm', function () {
        this.on('wsmm.supplies_id', 'ms.id').andOn('wsmm.hospcode', db.raw(hospcode))
      })
      .leftJoin('wm_current_supplies AS wcs', function () {
        this.on(' wcs.supplies_id ', 'ms.id').andOn('wcs.hospcode', db.raw(hospcode))
      })
      .where((v) => {
        v.where('wsmm.is_active', 'Y')
        v.orWhere('wsmm.is_active', null)
      })
      .where('ms.is_deleted', 'N')
      .where('ms.is_actived', 'Y')
      console.log(sql.toString());
      
      return sql;
      
  }

  getBalance(db: Knex, hospcode) {
    return db('wm_supplies as b')
      .select('b.*', 's.fname as fullname')
      .join('um_users as s', 'b.created_by', 's.id')
      .where('b.hospcode', hospcode)
      .orderBy('id', 'DESC')
  }

  getBalanceDetail(db: Knex, id) {
    return db('wm_supplie_details as bd')
      .select('bd.*', 's.name', 's.unit_name', 's.code')
      .join('mm_supplies as s', 'bd.supplies_id', 's.id')
      .where('bd.balance_id', id);
  }

  saveHead(db: Knex, data) {
    return db('wm_supplies')
      .insert(data);
  }

  saveDetail(db: Knex, data) {
    return db('wm_supplie_details')
      .insert(data);
  }

  removeCurrent(db: Knex, hospcode) {
    return db('wm_current_supplies')
      .delete()
      .where('hospcode', hospcode);
  }
  saveCurrent(db: Knex, data) {
    return db('wm_current_supplies')
      .insert(data);
  }

  updateLog(db: Knex, data, ) {
    return db('balance_logs')
      .insert(data);
  }

  update(db: Knex, id, qty) {
    return db('wm_supplie_details')
      .update('qty', qty)
      .where('id', id);
  }

  updateHead(db: Knex, id, userId) {
    return db('wm_supplies')
      .update('updated_by', userId)
      .where('id', id);
  }

  getInventoryStatus(db: Knex, limit = 100, offset = 0, hosp_id) {
    return db('wm_generics as wg')
    .select('wg.*','bg.name as generic_name', 'bu.name as unit_name')
    .join('b_generics as bg','bg.id', 'wg.generic_id')
    .join('b_units as bu', 'bu.id', 'bg.unit_id')
    .where('wg.hospital_id', hosp_id)
    .limit(limit).offset(offset)
  }

  getInventoryStatusTotal(db: Knex, hosp_id) {
    return db('wm_generics as wg')
    .count('bg.id as count')
    // .select('wg.*','bg.name as generic_name', 'bu.name as unit_name')
    .join('b_generics as bg','bg.id', 'wg.generic_id')
    .join('b_units as bu', 'bu.id', 'bg.unit_id')
    .where('wg.hospital_id', hosp_id)
  }
}