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

  getFulFillDetailDrugs(db: Knex, fulfillDrugId) {
    return db('wm_fulfill_drug_details as fdd')
      .join('wm_fulfill_drug_detail_items as fddi', 'fdd.id', 'fddi.fulfill_drug_detail_id')
      .where('fdd.fulfill_drug_id', fulfillDrugId)
  }

  getFulFillDetailSupplies(db: Knex, fulfillSuppliseId) {
    return db('wm_fulfill_supplies_details as fdd')
      .join('wm_fulfill_supplies_detail_items as fddi', 'fdd.id', 'fddi.fulfill_supplies_detail_id')
      .where('fdd.fulfill_supplies_id', fulfillSuppliseId)
  }


}