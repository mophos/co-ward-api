import * as Knex from 'knex';

export class SuppliesModel {

  getSupplies(db: Knex, limit = 100, offset = 0, q = '') {
    return db('mm_supplies')
      .where((v) => {
        v.where('name', 'like', '%' + q + '%')
        v.orWhere('code', 'like', '%' + q + '%')
      })
      .where('is_deleted', 'N')
      .where('is_actived', 'Y')
      .limit(limit)
      .offset(offset)
  }

  getSuppliesActived(db: Knex) {
    return db('mm_supplies')
      .where('is_deleted', 'N')
      .where('is_actived', 'Y')

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


  getSuppliesById(db: Knex, id: number) {
    return db('mm_supplies')
      .where('is_deleted', 'N')
      .where('id', id);
  }

  updateSupplies(db: Knex, id: number, data = {}) {
    return db('mm_supplies')
      .update(data)
      .where('id', id);
  }

  insertSupplies(db: Knex, data = {}) {
    return db('mm_supplies')
      .insert(data);
  }

  deleteSupplies(db: Knex, id: number) {
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
    console.log(sql.toString());
    
    return sql;
  }

}