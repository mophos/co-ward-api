import * as Knex from 'knex';

export class ApproveSuppliesModel {


  getListHosp(db: Knex, hospitalId) {
    return db('wm_requisitions as r')
      .select('r.*', 'h1.hospname')
      .join('b_hospitals as h1', 'h1.id', 'r.hospital_id_client')
      .where('hospital_id_node', hospitalId)
      .where('r.type', 'SUPPLIES')
      .where('r.is_approved', 'N')
      .groupBy('hospital_id_client')
  }

  getListHospDetail(db: Knex, hospitalIdClient, type) {
    return db('wm_requisitions as r')
      .select('r.*')
      .where('hospital_id_client', hospitalIdClient)
      .where('r.type', 'SUPPLIES')
      .where('is_approved', 'N')
  }

  getListHospDetailClient(db: Knex, hospitalIdClient) {
    return db('wm_requisitions as r')
      .select('r.*')
      .where('r.type', 'SUPPLIES')
      .where('hospital_id_client', hospitalIdClient)
  }

  getListDrug(db: Knex, reqId) {
    return db('wm_requisitions as r')
      .select('r.*', 'rd.*', 'g.*', 'u.name as unit_name')
      .join('wm_requisition_details as rd', 'rd.requisition_id', 'r.id')
      .join('b_generics as g', 'g.id', 'rd.generic_id')
      .join('b_units as u', 'u.id', 'g.unit_id')
      .where('r.id', reqId)
      .where('r.type', 'SUPPLIES')
  }

  getListApproved(db: Knex, hospitalId) {
    return db('wm_requisitions as r')
      .select('r.*', 'h1.hospname as hospital_name_node', 'h2.hospname as hospital_name_client')
      .join('b_hospitals as h1', 'h1.id', 'r.hospital_id_node')
      .join('b_hospitals as h2', 'h2.id', 'r.hospital_id_client')
      .where('hospital_id_node', hospitalId)
      .where('r.type', 'SUPPLIES')
  }

  getListApprovedDetail(db: Knex, id) {
    return db('wm_requisition_details as r')
      .select('r.*', 'g.name as generic_name', 'u.name as unit_name')
      .join('b_generics as g', 'g.id', 'r.generic_id')
      .leftJoin('b_units as u', 'u.id', 'g.unit_id')
      .where('r.requisition_id', id)
  }


  findNodeDrugs(db: Knex, hospitalId) {
    return db('h_node_drug_details as nd')
      .select('n.hospital_id')
      .join('h_node_drugs as n', 'n.id', 'nd.node_id')
      .where('nd.hospital_id', hospitalId)
  }

  saveRequisition(db: Knex, data) {
    return db('wm_requisitions')
      .insert(data, 'id');
  }
  saveRequisitionDetail(db: Knex, data) {
    return db('wm_requisition_details')
      .insert(data);
  }

}