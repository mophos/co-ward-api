import * as Knex from 'knex';
export class SuppliesModel {

  getSupplies(db: Knex, limit = 100, offset = 0, q = '') {
    return db('b_generics')
      .where('is_deleted', 'N')
      .where('is_actived', 'Y')
      .where('type', 'SUPPLIES')
      .where((v) => {
        v.where('name', 'like', '%' + q + '%')
      })
      .limit(limit)
      .offset(offset)
  }

  getSuppliesTotal(db: Knex, q = '') {
    return db('mm_supplies')
      .count('* as count')
      .where((v) => {
        v.where('name', 'like', '%' + q + '%')
        v.orWhere('code', 'like', '%' + q + '%')
      })
      .where('is_deleted', 'N');
  }


  getSuppliesById(db: Knex, id: any) {
    return db('mm_supplies')
      .where('is_deleted', 'N')
      .where('id', id);
  }

  updateSupplies(db: Knex, id: any, data = {}) {
    return db('mm_supplies')
      .update(data)
      .where('id', id);
  }

  insertSupplies(db: Knex, data = {}) {
    return db('mm_supplies')
      .insert(data);
  }

  deleteSupplies(db: Knex, id: any) {
    return db('mm_supplies')
      .update('is_deleted', 'Y')
      .where('id', id);
  }

  checkSupplies(db: Knex, provinceCode = null) {
    let sql = db('l_hospitals as ch')
      .select('ch.hospcode', 'ch.hospname', 'ch.zone_code', 'ch.province_code', 'ch.province_name', 'cb.created_at ')
      .leftJoin('wm_current_supplies as cb', 'ch.hospcode', 'cb.hospcode')
      .whereNotIn('ch.hosptype_id', ['1', '2']);
    if (provinceCode) {
      sql.where('ch.province_code', provinceCode)
    }

    return sql;
  }



  getSuppliesStock(db: Knex, hospitalId) {
    return db('wm_supplies as sp')
      .select('sp.*', 't.name', 'u.fname', 'u.lname')
      .leftJoin('um_users as u', 'u.id', 'sp.create_by')
      .leftJoin('um_titles as t', 't.id', 'u.title_id')
      .where('sp.hospital_id', hospitalId)
      .orderBy('sp.create_date', 'DESC')
  }

  getSuppliesStockDetails(db: Knex, id: any) {
    return db('b_generics as mg')
      .select('dsd.*', 'mg.name', 'u.name as unit_name')
      // .leftJoin('wm_supplies_details as dsd', 'mg.id', 'dsd.generic_id')
      .leftJoin('wm_supplies_details as dsd', (v) => {
        v.on('mg.id', 'dsd.generic_id')
        v.on('dsd.wm_supplie_id', db.raw(`${id}`))
      })
      .leftJoin('b_units as u', 'u.id', 'mg.unit_id')
      .where('mg.type','SUPPLIES')
      .orderBy('mg.id');
  }

  getId(db: Knex, data) {
    return db('wm_supplies')
      .where('date', data.date)
      .where('hospital_id', data.hospital_id)
      .where('create_by', data.create_by)
  }

  saveHead(db: Knex, data) {
    let sql = `
          INSERT INTO wm_supplies
          (date, create_by,hospital_id)
          VALUES(now(), ?,?)
          ON DUPLICATE KEY UPDATE
          update_by=?,update_date=now()`;
    return db.raw(sql, [data.create_by, data.hospital_id, data.create_by])

    // return db('wm_supplies')
    // .insert(data, 'id')

  }

  saveDetail(db: Knex, data) {
    let sqls = [];
    data.forEach(v => {
      let sql = `
          INSERT INTO wm_supplies_details
          (wm_supplie_id, generic_id,qty,month_usage_qty)
          VALUES(${v.wm_supplie_id},${v.generic_id},${v.qty},${v.month_usage_qty})
          ON DUPLICATE KEY UPDATE
          qty=${v.qty},month_usage_qty=${v.month_usage_qty}
        `;
      sqls.push(sql);
    });
    let queries = sqls.join(';');

    return db.raw(queries);
    // return db('wm_supplies_details')
    //   .insert(data);
  }

  getSuppliesActived(db: Knex) {
    return db('b_generics as g')
      .select('g.*', 'u.name as unit_name')
      .leftJoin('b_units as u', 'u.id', 'g.unit_id')
      .where('g.is_deleted', 'N')
      .where('g.is_actived', 'Y')
      .where('g.type', 'SUPPLIES')
      .orderBy('g.id');
  }

}