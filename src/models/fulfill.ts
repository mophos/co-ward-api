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

  getListSurgicalMasks(db: Knex) {
    return db('wm_fulfill_surgical_masks')
      .orderBy('id', 'DESC')
  }

  getFulFillDrugs(db: Knex) {
    return db('wm_fulfill_drugs as fd')
      .select('fd.*', 'u.fname', 'u.lname')
      .join('um_users as u', 'u.id', 'fd.created_by')
      .orderBy('id', 'DESC')
  }
  getFulFillSupplies(db: Knex) {
    return db('wm_fulfill_supplies as fd')
      .select('fd.*', 'u.fname', 'u.lname')
      .join('um_users as u', 'u.id', 'fd.created_by')
      .orderBy('id', 'DESC')
  }

  getFulFillDrugDetailItems(db: Knex, ids) {
    let sql = db('wm_fulfill_drug_details as fdd')
      .join('wm_fulfill_drug_detail_items as fddi', 'fddi.fulfill_drug_detail_id', 'fdd.id')
      .join('wm_fulfill_drugs as fd', 'fd.id', 'fdd.fulfill_drug_id')
      .where('fd.is_approved', 'N')
      .whereIn('fdd.fulfill_drug_id', ids);
    console.log(sql.toString());
    return sql
  }

  getFulFillSuppliesDetailItems(db: Knex, ids) {
    return db('wm_fulfill_supplies_details as fdd')
      .join('wm_fulfill_supplies_detail_items as fddi', 'fddi.fulfill_supplies_detail_id', 'fdd.id')
      .join('wm_fulfill_supplies as fd', 'fd.id', 'fdd.fulfill_supplies_id')
      .where('fd.is_approved', 'N')
      .whereIn('fdd.fulfill_supplies_id', ids);

  }

  approved(db: Knex, data: [], userId) {
    return db('wm_fulfill_drugs as fd')
      .update({
        'is_approved': 'Y',
        'approved_by': userId,
        'approved_date': db.raw('now()')
      })
      .whereIn('id', data);
  }

  getHospNode(db: Knex) {
    return db('h_node_drugs AS hn')
      .select('bh.*')
      .join('b_hospitals AS bh', 'bh.id', 'hn.hospital_id')
  }

  getHospital(db: Knex, hospitalTypeCode) {
    return db('views_supplies_hospitals AS v')
      .select('v.*', 'h.hospname', 'h.hospcode', 'h.province_name',
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

  drugSumDetails(db: Knex, id) {
    return db('wm_fulfill_drugs AS wf')
      .sum('wfdd.qty as qty')
      .select('bg.name as generic_name', 'bu.name as unit_name')
      .join('wm_fulfill_drug_details AS wfd', 'wfd.fulfill_drug_id', 'wf.id')
      .join('wm_fulfill_drug_detail_items AS wfdd', 'wfdd.fulfill_drug_detail_id', 'wfd.id')
      .join('b_generics as bg', 'bg.id', 'wfdd.generic_id')
      .join('b_units as bu', 'bu.id', 'bg.unit_id')
      .where('wf.id', id)
      .groupBy('wfdd.generic_id')
  }
  saveFulFillSupplies(db: Knex, data) {
    return db('wm_fulfill_supplies')
      .insert(data);
  }

  saveFulFillSuppliesDetail(db: Knex, data) {
    return db('wm_fulfill_supplies_details')
      .insert(data);
  }
  saveFulFillSuppliesDetailItem(db: Knex, data) {
    return db('wm_fulfill_supplies_detail_items')
      .insert(data);
  }

  saveQTY(db: Knex, data) {
    let sqls = [];
    data.forEach(v => {
      let sql = `
          INSERT INTO wm_generics
          (hospital_id, generic_id,qty)
          VALUES('${v.hospital_id}', '${v.generic_id}',${v.qty})
          ON DUPLICATE KEY UPDATE
          qty=qty+${v.qty}
        `;
      sqls.push(sql);
    });
    let queries = sqls.join(';');
    return db.raw(queries);
  }

  getFulFillDrugItems(db: Knex, drug, ids) {
    let sql = db('wm_fulfill_drug_details as fdd')
      .select('h.hospname')
      .join('wm_fulfill_drug_detail_items as fddi', 'fddi.fulfill_drug_detail_id', 'fdd.id')
      .join('wm_fulfill_drugs as fd', 'fd.id', 'fdd.fulfill_drug_id')
      .join('b_hospitals as h', 'h.id', 'fdd.hospital_id')
      .where('fd.is_approved', 'N')
      .whereIn('fdd.fulfill_drug_id', ids)
      .groupBy('h.id');

    for (const items of drug) {
      sql.select(db.raw(`sum(case when fddi.generic_id = ? then fddi.qty else 0 end) as ?`, [items.id, items.name]))
    }
    return sql
  }

  saveHeadSurgicalMask(db: Knex, data: any) {
    return db('wm_fulfill_surgical_masks').insert(data);
  }

  saveDetailSurgicalMask(db: Knex, data: any) {
    return db('wm_fulfill_surgical_mask_details').insert(data);
  }

  saveItemSurgicalMask(db: Knex, data: any) {
    return db('wm_fulfill_surgical_mask_detail_items').insert(data);
  }


  getFulFillSupplesItems(db: Knex, supplies, ids) {
    let sql = db('wm_fulfill_supplies_details as fdd')
      .select('h.hospname')
      .join('wm_fulfill_supplies_detail_items as fddi', 'fddi.fulfill_supplies_detail_id', 'fdd.id')
      .join('wm_fulfill_supplies as fd', 'fd.id', 'fdd.fulfill_supplies_id')
      .join('b_hospitals as h', 'h.id', 'fdd.hospital_id')
      .where('fd.is_approved', 'N')
      .whereIn('fdd.fulfill_supplies_id', ids)
      .groupBy('h.id');

    for (const items of supplies) {
      sql.select(db.raw(`sum(case when fddi.generic_id = ? then fddi.qty else 0 end) as ?`, [items.id, items.name]))
    }
    return sql
  }

}