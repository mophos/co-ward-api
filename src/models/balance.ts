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
    return db('wm_supplies_details as bd')
      .select('bd.*', 's.name', 's.unit_name', 's.code')
      .join('mm_supplies as s', 'bd.supplies_id', 's.id')
      .where('bd.balance_id', id);
  }

  saveHead(db: Knex, data) {
    return db('wm_supplies')
      .insert(data);
  }

  saveDetail(db: Knex, data) {
    return db('wm_supplies_details')
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
    return db('wm_supplies_details')
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
      .select('wg.*', 'bg.name as generic_name', 'bu.name as unit_name')
      .join('b_generics as bg', 'bg.id', 'wg.generic_id')
      .join('b_units as bu', 'bu.id', 'bg.unit_id')
      .where('wg.hospital_id', hosp_id)
      .limit(limit).offset(offset)
  }

  getInventoryStatusTotal(db: Knex, hosp_id) {
    return db('wm_generics as wg')
      .count('bg.id as count')
      // .select('wg.*','bg.name as generic_name', 'bu.name as unit_name')
      .join('b_generics as bg', 'bg.id', 'wg.generic_id')
      .join('b_units as bu', 'bu.id', 'bg.unit_id')
      .where('wg.hospital_id', hosp_id)
  }

  getReceives(db: Knex, hosp_id) {
    return db('wm_receives AS wr')
      .select('wr.*', 'ut.name as title_name', 'uu.fname', 'uu.lname')
      .join('um_users as uu', 'uu.id', 'wr.create_by')
      .join('um_titles as ut', 'ut.id', 'uu.title_id')
      .where('wr.hospital_id', hosp_id)
  }

  getReceivesDetail(db: Knex, id) {
    return db('b_generics AS bg')
      .select('bg.id', 'bg.name', 'wrd.qty', 'bu.name AS unit_name', 'wrd.wm_receive_id')
      .joinRaw(`left join wm_receives_details as wrd ON wrd.generic_id = bg.id AND wrd.wm_receive_id = ?`, id)
      .join('b_units as bu', 'bu.id', 'bg.unit_id')
      .where('bg.is_actived', 'Y')
  }

  getReceivesGenerics(db: Knex) {
    return db('b_generics AS bg ')
      .select('bg.id', 'bg.name', 'bu.name AS unit_name')
      .join('b_units as bu', 'bu.id', 'bg.unit_id')
      .where('bg.is_actived', 'Y')
  }

  saveHeadReceives(db: Knex, data) {
    let sql = `
          INSERT INTO wm_receives
          (entry_date, create_by,hospital_id)
          VALUES(?, ?,?)
          ON DUPLICATE KEY UPDATE
          update_by=?,update_date=now()`;
    return db.raw(sql, [data.entry_date, data.created_by, data.hospital_id, data.created_by])
  }

  getId(db: Knex, data) {
    return db('wm_receives')
      .where('entry_date', data.entry_date)
      .where('hospital_id', data.hospital_id)
      .where('create_by', data.create_by)
  }

  saveDetailReceives(db: Knex, data) {
    let sqls = [];
    data.forEach(v => {
      let sql = `
          INSERT INTO wm_receives_details
          (wm_receive_id, generic_id,qty)
          VALUES(${v.wm_receive_id},${v.generic_id},${v.qty})
          ON DUPLICATE KEY UPDATE
          qty=${v.qty}
        `;
      sqls.push(sql);
    });
    let queries = sqls.join(';');
    return db.raw(queries);
  }

  updateFulfill(db: Knex, type, id) {
    if (type === 'DRUG') {
      return db('wm_fulfill_drugs').update('is_received', 'Y').where('id', id);
    } else if (type === 'SUPPLIES') {
      return db('wm_fulfill_supplies').update('is_received', 'Y').where('id', id);
    } else if (type === 'SURGICALMASK') {
      return db('wm_fulfill_surgical_masks').update('is_received', 'Y').where('id', id);
    }
  }

  insertWmGenerics(db: Knex, data) {
    let sqls = [];
    data.forEach(v => {
      let sql = `
          INSERT INTO wm_generics
          (hospital_id, generic_id,qty)
          VALUES(${v.hospital_id},${v.generic_id},${v.qty})
          ON DUPLICATE KEY UPDATE
          qty=qty+${v.qty}
        `;
      sqls.push(sql);
    });
    let queries = sqls.join(';');
    return db.raw(queries);
  }

}