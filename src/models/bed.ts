import * as Knex from 'knex';

export class BedModel {

  getBedStock(db: Knex, hospcode: any) {
    return db('wm_bed_stocks as bs')
      .select('bs.*', 't.name', 'u.fname', 'u.lname')
      .leftJoin('um_users as u', 'u.id', 'bs.created_by')
      .leftJoin('um_titles as t', 't.id', 'u.title_id')
      .where('bs.hospcode', hospcode)
      .orderBy('bs.created_at')
  }

  getBedStockDetails(db: Knex, id: any) {
    return db('wm_bed_stock_details as  bsd')
      .select('bsd.*', 'b.code', 'b.name', 'b.unit_name')
      .join('mm_beds as b', 'b.id', 'bsd.bed_id')
      .where('bsd.bed_stock_id', id);
  }

  getBeds(db: Knex) {
    return db('mm_beds');
  }

  getBalanceBeds(db: Knex, hospcode: any) {
    return db('wm_current_beds as cb')
      .join('mm_beds as b', 'b.id', 'cb.bed_id')
      .where('cb.hospcode', hospcode)
  }

  saveBed(db: Knex, data) {
    return db('wm_bed_stocks')
      .insert(data, 'id');
  }

  saveHead(db: Knex, data) {
    return db('wm_bed_historys')
      .insert(data, 'id');
  }

  saveDetail(db: Knex, data) {
    return db('wm_bed_stock_details')
      .insert(data);
  }

  updateBeds(db: Knex, id: any, data: any) {
    return db('wm_bed_stocks').update(data).where('id', id);
  }

  updateBedDetail(db: Knex, id: any, data: any) {
    return db('wm_bed_stock_details').update(data).where('id', id);
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