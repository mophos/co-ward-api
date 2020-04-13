import * as Knex from 'knex';

export class BedModel {

  getBedStock(db: Knex, hospitalId: any) {
    return db('wm_beds as bs')
      .select('bs.*', 't.name', 'u.fname', 'u.lname')
      .leftJoin('um_users as u', 'u.id', 'bs.create_by')
      .leftJoin('um_titles as t', 't.id', 'u.title_id')
      .where('bs.hospital_id', hospitalId)
      .orderBy('bs.create_date', 'ASC')
  }

  getBedStockDetails(db: Knex, id: any, hospitalId) {
    return db('wm_bed_details as  bsd')
      .select('bsd.*', 'b.name','bh.qty as qty_total')
      .join('b_beds as b', 'b.id', 'bsd.bed_id')
      .leftJoin('b_bed_hospitals as bh', (v) => {
        v.on('b.id', 'bh.bed_id')
        v.on('bh.hospital_id', db.raw(`${hospitalId}`));
      })
      .where('bsd.wm_bed_id', id);
  }

  getBeds(db: Knex, hospitalId: any) {
    return db('b_beds as b')
      .select('b.id as bed_id', 'b.name', 'bh.qty as qty_total')
      .leftJoin('b_bed_hospitals as bh', (v) => {
        v.on('b.id', 'bh.bed_id')
        v.on('bh.hospital_id', db.raw(`${hospitalId}`));
      })
  }

  getRemainHosp(db: Knex) {
    return db('mm_requisition_supplies_center_generics as rg')
      .select('l.hospname', 'mgs.name as generic_name', 'mgs.unit_name', 'rg.*')
      .join('mm_generic_supplies as mgs', 'mgs.id', 'rg.generic_id')
      .join('l_hospitals as l', 'l.hospcode', 'rg.hospcode');
  }

  saveBed(db: Knex, data) {
    return db('wm_beds')
      .insert(data, 'id');
  }

  saveHead(db: Knex, data) {
    return db('wm_bed_historys')
      .insert(data, 'id');
  }

  saveDetail(db: Knex, data) {
    return db('wm_bed_details')
      .insert(data);
  }

  updateBeds(db: Knex, id: any, data: any) {
    return db('wm_beds').update(data).where('id', id);
  }

  updateBedDetail(db: Knex, id: any, data: any) {
    return db('wm_bed_details').update(data).where('id', id);
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