import * as Knex from 'knex';

export class BedModel {

  getBeds(db: Knex) {
    return db('mm_beds');
  }

  getBalanceBeds(db: Knex, hospcode: any) {
    return db('wm_current_beds as cb')
      .join('mm_beds as b', 'b.id', 'cb.bed_id')
      .where('cb.hospcode', hospcode)
  }

  saveHead(db: Knex, data) {
    return db('wm_bed_historys')
      .insert(data, 'id');
  }

  saveDetail(db: Knex, data) {
    return db('wm_bed_history_details')
      .insert(data);
  }

  saveCurrent(db: Knex, data) {
    return db('wm_current_beds')
      .insert(data);
  }

  del(db: Knex, hospcode: any) {
    return db('wm_current_beds')
      .delete().where('hospcode', hospcode);
  }

  checkBed(db: Knex, provinceCode = null) {
    let sql = db('l_hospitals as ch')
      .select('ch.hospcode', 'ch.hospname', 'ch.zone_code', 'ch.province_code', 'ch.province_name', 'cb.created_at ')
      .leftJoin('wm_current_beds as cb', 'ch.hospcode', 'cb.hospcode')
      .whereNotIn('ch.hosptype_id', ['1', '2']);
    if (provinceCode) {
      sql.where('ch.province_code', provinceCode)
    }
    return sql
  }
}