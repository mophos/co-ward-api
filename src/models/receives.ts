import * as Knex from 'knex';

export class ReceivesModel {

  getFulFill(db: Knex, hospitalId) {
    return db.select('wm_fulfill_drugs.*', db.raw(`'DRUG' as type`)).from('wm_fulfill_drug_details')
      .join('wm_fulfill_drugs', 'wm_fulfill_drug_details.fulfill_drug_id', 'wm_fulfill_drugs.id')
      .where('hospital_id', hospitalId).where('is_approved', 'Y')
      .unionAll(function () {
        this.select('wm_fulfill_supplies.*', db.raw(`'SUPPLIES' as type`))
          .from('wm_fulfill_supplies_details')
          .join('wm_fulfill_supplies', 'wm_fulfill_supplies_details.fulfill_supplies_id', 'wm_fulfill_supplies.id')
          .where('hospital_id', hospitalId).where('is_approved', 'Y');
      })
      .unionAll(function () {
        this.select('r.*', db.raw(`'SURGICALMASK' as type`))
          .from('wm_fulfill_surgical_mask_details as rd')
          .join('wm_fulfill_surgical_masks as r', 'rd.fulfill_surgical_mask_id', 'r.id')
          .where('rd.hospital_id', hospitalId).where('is_approved', 'Y');
      })
  }

  getFulFillDetailDrugs(db: Knex, id, hospitalId) {
    return db('wm_fulfill_drug_details AS wfd')
      .sum('wfdd.qty as qty')
      .select('bg.name as generic_name', 'bu.name as unit_name')
      .join('wm_fulfill_drug_detail_items AS wfdd', 'wfdd.fulfill_drug_detail_id', 'wfd.id')
      .join('b_generics AS bg', 'bg.id', 'wfdd.generic_id')
      .join('b_units as bu', 'bu.id', 'bg.unit_id')
      .where('wfd.fulfill_drug_id', id)
      .where('wfd.hospital_id', hospitalId)
      .groupBy('wfdd.generic_id')
  }

  getFulFillDetailSupplies(db: Knex, id, hospitalId) {
    return db('wm_fulfill_supplies_details as wfsd')
      .sum('wfsdi.qty as qty')
      .select('bg.name as generic_name', 'bu.name as unit_name')
      .join('wm_fulfill_supplies_detail_items as wfsd', 'wfsdi.fulfill_supplies_detail_id', 'wfsd.id')
      .join('b_generics AS bg', 'bg.id', 'wfsdi.generic_id')
      .join('b_units as bu', 'bu.id', 'bg.unit_id')
      .where('wfsd.fulfill_supplies_id', id)
      .where('wfsd.hospital_id', hospitalId)
      .groupBy('wfsdi.generic_id')
  }

  getFulFillDetailSurgicalMask(db: Knex, id, hospitalId) {
    return db('wm_fulfill_surgical_mask_details as wfsmd')
      .sum('wfsmdi.qty as qty')
      .select('bg.name as generic_name', 'bu.name as unit_name')
      .join('wm_fulfill_surgical_mask_detail_items as wfsmdi', 'wfsmdi.fulfill_surgical_mask_detail_id', 'wfsmd.id')
      .join('b_generics AS bg', 'bg.id', 'wfsmdi.generic_id')
      .join('b_units as bu', 'bu.id', 'bg.unit_id')
      .where('wfsmd.fulfill_surgical_mask_id', id)
      .where('wfsmd.hospital_id', hospitalId)
      .groupBy('wfsmdi.generic_id')
  }


}