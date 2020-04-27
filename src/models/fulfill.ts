import * as Knex from 'knex';

export class FullfillModel {

  getProducts(db: Knex, type) {
    let sql = db('wm_generics as g')
      .select('g.generic_id', 'bg.name as generic_name', 'bh.hospname as hospital_name', 'g.qty', 'gp.min', 'gp.max',
        'gp.safety_stock', db.raw('(gp.max-g.qty+gp.safety_stock) as fill_qty'),
        db.raw('(gp.max-g.qty+gp.safety_stock) as recommend_fill_qty'),
        db.raw('(g.qty*100/gp.max) as qty_order'))
      .join('b_generic_plannings as gp', (v) => {
        v.on('g.generic_id', 'gp.generic_id');
        v.on('g.hospital_id', 'gp.hospital_id');
      })
      .join('b_generics as bg', 'bg.id', 'g.generic_id')
      .join('b_hospitals as bh', 'bh.id', 'g.hospital_id')
      .where('bg.type', type)
      .orderByRaw('g.qty*100/gp.max');
    // console.log(sql.toString());
    return sql;
  }

  getListSurgicalMasks(db: Knex) {
    return db('wm_fulfill_surgical_masks')
    .orderBy('id', 'DESC')
  }

  getHospNode(db: Knex) {
    return db('h_node_drugs AS hn')
      .select('bh.*')
      .join('b_hospitals AS bh', 'bh.id', 'hn.hospital_id')
  }

  getHospital(db: Knex, hospitalTypeCode) {
    return db('views_supplies_hospitals AS v')
      .select('v.*', 'h.hospname', 'h.province_name',
        db.raw(`(( ( - 1 * DATEDIFF( s.date, now( ) ) ) * IFNULL( v.month_usage_qty, 0 ) ) + v.qty) - IFNULL( v.month_usage_qty / 4, 0 ) as week1`),
        db.raw(`(( ( - 1 * DATEDIFF( s.date, now( ) ) ) * IFNULL( v.month_usage_qty, 0 ) ) + v.qty) - IFNULL( v.month_usage_qty / 4, 0 ) * 2 as week2`),
        db.raw(`(( ( - 1 * DATEDIFF( s.date, now( ) ) ) * IFNULL( v.month_usage_qty, 0 ) ) + v.qty) - IFNULL( v.month_usage_qty / 4, 0 ) * 3 as week3`),
        db.raw(`(( ( - 1 * DATEDIFF( s.date, now( ) ) ) * IFNULL( v.month_usage_qty, 0 ) ) + v.qty) - IFNULL( v.month_usage_qty / 4, 0 ) * 4 as week4`),
        db.raw(`( ( - 1 * DATEDIFF( s.date, now( ) ) ) * v.month_usage_qty ) + v.qty AS datecal`))
      .join('b_hospitals AS h', 'h.id', 'v.hospital_id')
      .join('wm_supplies AS s', 's.id', 'v.wm_supplie_id')
      .whereIn('h.hosptype_code', hospitalTypeCode)
      .where('v.generic_id', 17)
      .whereNotNull('v.qty')
      .having(db.raw('week1 < 0'))
      .orderBy('h.hosptype_code', 'h.province_name');
  }

  getDrugMinMax(db: Knex, hospitalId) {
    return db('b_generics AS bg')
      .select('bg.id as generic_id', 'bgp.max', 'bgp.min', 'bgp.safety_stock', 'bgp.hospital_id', 'bg.name as generic_name', 'bu.name as unit_name')
      .joinRaw(`LEFT JOIN b_generic_plannings AS bgp ON bgp.generic_id = bg.id AND bgp.hospital_id = ?`, hospitalId)
      .join('b_units AS bu', 'bu.id', 'bg.unit_id')
      .where('bg.type', 'DRUG')
  }

  removeMinMax(db: Knex, hospId) {
    return db('b_generic_plannings')
      .delete().where('hospital_id', hospId)
  }

  saveMinMax(db: Knex, data) {
    return db('b_generic_plannings')
      .insert(data)
  }


}