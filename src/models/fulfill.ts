import * as Knex from 'knex';

export class FullfillModel {

  getProducts(db: Knex, type) {
    let sql = db('wm_generics as g')
      .select('g.generic_id', 'bg.name as generic_name', 'g.hospital_id', 'bh.hospname as hospital_name', 'g.qty', 'gp.min', 'gp.max',
        'gp.safety_stock', db.raw('(gp.max-(g.qty+ifnull(vf.qty,0))+gp.safety_stock) as fill_qty'),
        db.raw('(gp.max-(g.qty+ifnull(vf.qty,0))+gp.safety_stock) as recommend_fill_qty'),
        db.raw('((g.qty+ifnull(vf.qty,0))*100/gp.max) as qty_order'), db.raw(`ifnull(vf.qty,0) as reserve_qty`))
      .join('b_generic_plannings as gp', (v) => {
        v.on('g.generic_id', 'gp.generic_id');
        v.on('g.hospital_id', 'gp.hospital_id');
      })
      .join('b_generics as bg', 'bg.id', 'g.generic_id')
      .join('b_hospitals as bh', 'bh.id', 'g.hospital_id')
      .leftJoin('view_fulfill_reserves as vf', (v) => {
        v.on('vf.generic_id', 'g.generic_id')
        v.on('vf.hospital_id', 'g.hospital_id')
      })
      .where('bg.type', type)
      .orderByRaw('(g.qty+ifnull(vf.qty,0))*100/gp.max')
      .havingRaw('fill_qty > 0')
    // console.log(sql.toString());
    return sql;
  }

  getFulFill(db: Knex) {
    return db('wm_fulfill_drugs as fd')
      .select('fd.*', 'u.fname', 'u.lname')
      .join('um_users as u', 'u.id', 'fd.created_by')
  }

  getFulFillDetailItems(db: Knex,ids) {
    return db('wm_fulfill_drug_details as fdd')
      .select('fd.*', 'u.fname', 'u.lname')
      .join('wm_fulfill_drug_detail_items as fddi', 'fddi.fulfull_drug_detail_id', 'fd.created_by')
  }

  approved(db: Knex, data: []) {
    return db('wm_fulfill_drugs as fd')
      .update('is_approved', 'Y')
      .whereIn('id', data);
  }

  getHospNode(db: Knex) {
    return db('h_node_drugs AS hn')
      .select('bh.*')
      .join('b_hospitals AS bh', 'bh.id', 'hn.hospital_id')
  }

  getDrugMinMax(db: Knex, hospitalId) {
    return db('b_generics AS bg')
      .select('bg.id as generic_id', 'bgp.max', 'bgp.min', 'bgp.safety_stock', 'bgp.hospital_id', 'bg.name as generic_name', 'bu.name as unit_name')
      .joinRaw(`LEFT JOIN b_generic_plannings AS bgp ON bgp.generic_id = bg.id AND bgp.hospital_id = ?`, hospitalId)
      .join('b_units AS bu', 'bu.id', 'bg.unit_id')
      .where('bg.type', 'DRUG')
      .where('bg.is_actived', 'Y')
  }

  removeMinMax(db: Knex, hospId) {
    return db('b_generic_plannings')
      .delete().where('hospital_id', hospId)
  }

  saveMinMax(db: Knex, data) {
    return db('b_generic_plannings')
      .insert(data)
  }

  saveFulFillDrug(db: Knex, data) {
    return db('wm_fulfill_drugs')
      .insert(data);
  }

  saveFulFillDrugDetail(db: Knex, data) {
    return db('wm_fulfill_drug_details')
      .insert(data);
  }
  saveFulFillDrugDetailItem(db: Knex, data) {
    return db('wm_fulfill_drug_detail_items')
      .insert(data);
  }
}