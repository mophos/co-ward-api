import * as Knex from 'knex';

export class BalanceModel {



  getSupplies(db: Knex, hospcode) {
    return db('mm_supplies AS ms')
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
      .where('is_deleted', 'N')
      .where('is_actived', 'Y')
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
      .select('bd.*', 's.name', 's.unit', 's.code')
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


}