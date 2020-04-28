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
      .join('wm_fulfill_supplies_detail_items as wfsdi', 'wfsdi.fulfill_supplies_detail_id', 'wfsd.id')
      .join('b_generics AS bg', 'bg.id', 'wfsdi.generic_id')
      .join('b_units as bu', 'bu.id', 'bg.unit_id')
      .where('wfsd.fulfill_supplies_id', id)
      .where('wfsd.hospital_id', hospitalId)
      .groupBy('wfsdi.generic_id')
  }


}