import * as Knex from 'knex';

export class CovidCaseModel {

  getCase(db: Knex, hospitalId) {
    return db('p_covid_cases as c')
      .select('c.id as covid_case_id', 'c.status', 'c.date_admit', 'pt.hn', 'pt.person_id', 'p.*', 't.name as title_name')
      .join('p_patients as pt', 'c.patient_id', 'pt.id')
      .join('p_persons as p', 'pt.person_id', 'p.id')
      .leftJoin('um_titles as t', 'p.title_id', 't.id')
      .where('pt.hospital_id', hospitalId)
  }

  getListHosp(db: Knex, hospitalId) {
    return db('wm_requisitions as r')
      .select('r.*', 'h1.hospname')
      .join('b_hospitals as h1', 'h1.id', 'r.hospital_id_client')
      .where('hospital_id_node', hospitalId)
      .where('r.is_approved', 'N')
      .groupBy('hospital_id_client')
  }

  getListHospDetail(db: Knex, hospitalIdClient, type) {
    return db('wm_requisitions as r')
      .select('r.*')
      // .join('wm_requisition_details as rd', 'rd.requisition_id', 'r.id')
      .where('hospital_id_client', hospitalIdClient)
      .whereIn('type', type)
      .where('is_approved', 'N')
  }

  getListHospDetailClient(db: Knex, hospitalIdClient) {
    return db('wm_requisitions as r')
      .select('r.*')
      // .join('wm_requisition_details as rd', 'rd.requisition_id', 'r.id')
      .where('hospital_id_client', hospitalIdClient)

    // .where('is_approved', 'N')
  }

  getListDrug(db: Knex, reqId) {
    return db('wm_requisitions as r')
      .select('r.*', 'rd.*', 'g.*', 'u.name as unit_name')
      .join('wm_requisition_details as rd', 'rd.requisition_id', 'r.id')
      .join('b_generics as g', 'g.id', 'rd.generic_id')
      .join('b_units as u', 'u.id', 'g.unit_id')
      .where('r.id', reqId)
  }

  getListApproved(db: Knex, hospitalId) {
    return db('wm_requisitions as r')
      .select('r.*', 'h1.hospname as hospital_name_node', 'h2.hospname as hospital_name_client')
      .join('b_hospitals as h1', 'h1.id', 'r.hospital_id_node')
      .join('b_hospitals as h2', 'h2.id', 'r.hospital_id_client')
      .where('hospital_id_node', hospitalId)
  }

  getListApprovedDetail(db: Knex, id) {
    return db('wm_requisition_details as r')
      .select('r.*', 'g.name as generic_name', 'u.name as unit_name')
      .join('b_generics as g', 'g.id', 'r.generic_id')
      .leftJoin('b_units as u', 'u.id', 'g.unit_id')
      .where('r.requisition_id', id)
  }

  getCasePresent(db: Knex, hospitalId, query) {
    return db('p_covid_cases as c')
      .select('c.id as covid_case_id', 'c.status', 'c.date_admit', 'pt.hn', 'pt.person_id', 'p.*', 't.name as title_name',
        'cd.bed_id', 'cd.gcs_id', 'cd.medical_supplie_id', db.raw(`DATE_FORMAT(cd.create_date, "%Y-%m-%d") as create_date`),
        db.raw(`(select generic_id from p_covid_case_detail_items where covid_case_detail_id = ccd.covid_case_detail_id and (generic_id = 1 or generic_id = 2) limit 1) as set1,
      (select generic_id from p_covid_case_detail_items where covid_case_detail_id = ccd.covid_case_detail_id and (generic_id = 3 or generic_id = 4) limit 1) as set2,
      (select generic_id from p_covid_case_detail_items where covid_case_detail_id = ccd.covid_case_detail_id and generic_id = 7  limit 1) as set3,
      (select generic_id from p_covid_case_detail_items where covid_case_detail_id = ccd.covid_case_detail_id and generic_id = 8  limit 1) as set4`))
      .join('p_patients as pt', 'c.patient_id', 'pt.id')
      .join('p_persons as p', 'pt.person_id', 'p.id')
      .leftJoin('um_titles as t', 'p.title_id', 't.id')
      .joinRaw(`left join ( select max(ccd.id) as covid_case_detail_id,cc.patient_id from p_covid_case_details as ccd
    join p_covid_cases as cc on cc.id = ccd.covid_case_id
    group by cc.patient_id ) as ccd on c.patient_id = ccd.patient_id
    left join p_covid_case_details as cd on ccd.covid_case_detail_id = cd.id`)
      // .leftJoin('p_covid_case_details as cd','ccs.covid_case_detail_id','cd.id')
      .where('pt.hospital_id', hospitalId)
      .where('c.status', 'ADMIT')
      .where((v) => {
        v.where('pt.hn', 'like', '%' + query + '%')
        v.orWhere('p.first_name', 'like', '%' + query + '%')
        v.orWhere('p.last_name', 'like', '%' + query + '%')
      });
  }

  getInfo(db: Knex, hospitalId, covidCaseId) {
    return db('p_covid_cases as c')
      .select('c.id as covid_case_id', 'c.status', 'c.date_admit', 'pt.hn', 'p.*', 't.name as title_name')
      .join('p_patients as pt', 'c.patient_id', 'pt.id')
      .join('p_persons as p', 'pt.person_id', 'p.id')
      .leftJoin('um_titles as t', 'p.title_id', 't.id')
      .where('c.id', covidCaseId)
      .where('pt.hospital_id', hospitalId)
  }


  getHistory(db: Knex, personId) {
    return db('p_covid_cases as c')
      .select('c.id as covid_case_id', 'c.status', 'c.date_admit', 'h.hospname')
      .join('p_patients as pt', 'c.patient_id', 'pt.id')
      .join('p_persons as p', 'pt.person_id', 'p.id')
      .join('b_hospitals as h', 'pt.hospital_id', 'h.id')
      .where('pt.person_id', personId)
  }

  checkCidSameHospital(db: Knex, hospitalId, cid) {
    return db('p_patients as pt')
      .join('p_persons as p', 'pt.person_id', 'p.id')
      .join('p_covid_cases as c', 'c.patient_id', 'pt.id')
      .where('pt.hospital_id', hospitalId)
      .where('c.status', 'ADMIT')
      .where('p.cid', cid)
  }

  checkCidAllHospital(db: Knex, hospitalId, cid) {
    return db('p_patients as pt')
      .select('h.hospname', 'p.*', 'pt.hn', 'va.*', 'c.name as country_name')
      .join('p_persons as p', 'pt.person_id', 'p.id')
      .join('b_hospitals as h', 'h.id', 'pt.hospital_id')
      .leftJoin('view_address as va', (v) => {
        v.on('va.ampur_code', 'p.ampur_code')
        v.on('va.tambon_code', 'p.tambon_code')
        v.on('va.province_code', 'p.province_code')
      })
      .leftJoin('b_countries as c', 'c.id', 'p.country_code')
      .whereNot('pt.hospital_id', hospitalId)
      .where('p.cid', cid)
  }

  checkPassportSameHospital(db: Knex, hospitalId, passport) {
    return db('p_patients as pt')
      .join('p_persons as p', 'pt.person_id', 'p.id')
      .where('pt.hospital_id', hospitalId)
      .where('p.passport', passport)
  }

  checkPassportAllHospital(db: Knex, passport) {
    return db('p_patients as pt')
      .join('p_persons as p', 'pt.person_id', 'p.id')
      .where('p.passport', passport)
  }

  saveCovidCase(db: Knex, data) {
    return db('p_covid_cases')
      .insert(data);
  }
  saveCovidCaseDetail(db: Knex, data) {
    return db('p_covid_case_details')
      .insert(data);
  }
  saveCovidCaseDetailItem(db: Knex, data) {
    return db('p_covid_case_detail_items')
      .insert(data);
  }

  savePerson(db: Knex, data) {
    return db('p_persons')
      .insert(data);
  }

  savePatient(db: Knex, data) {
    return db('p_patients')
      .insert(data);
  }

  // findNode(db: Knex, hospitalId) {
  //   return db('h_node_details as nd')
  //     .select('n.hospital_id')
  //     .join('h_nodes as n', 'n.id', 'nd.node_id')
  //     .where('nd.hospital_id', hospitalId)
  // }

  findNodeDrugs(db: Knex, hospitalId) {
    return db('h_node_drug_details as nd')
      .select('n.hospital_id')
      .join('h_node_drugs as n', 'n.id', 'nd.node_id')
      .where('nd.hospital_id', hospitalId)
  }

  findNodeSupplies(db: Knex, hospitalId) {
    return db('h_node_supplies_details as nd')
      .select('n.hospital_id')
      .join('h_node_supplies as n', 'n.id', 'nd.node_id')
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

  getQtySupplues(db: Knex, gcsId, hospitalType) {
    return db('b_generic_gcs_qty as g')
      .where('type', hospitalType)
      .where('gcs_id', gcsId)
  }

  getBeds(db: Knex, hospitalId, hospitalType) {
    return db('b_beds AS bb')
      .select('bb.id', 'bb.name', 'bh.hospital_id', 'bh.qty', 'bh.covid_qty', 'vbs.usage_qty')
      .leftJoin('b_bed_hospitals as bh', (v) => {
        v.on('bb.id', 'bh.bed_id')
        v.on('bh.hospital_id', db.raw(`${hospitalId}`));
      })
      .leftJoin('view_bed_sum_hospitals as vbs', (v) => {
        v.on('vbs.bed_id', 'bb.id')
        v.on('vbs.hospital_id', db.raw(`${hospitalId}`));
      })
      .where((v) => {
        v.where('bb.is_hospital', hospitalType == 'HOSPITAL' ? 'Y' : 'N')
        v.orWhere('bb.is_hospitel', hospitalType == 'HOSPITEL' ? 'Y' : 'N')
      })
      .where('bb.is_deleted', 'N')
  }

  getGcs(db, hospitalId, hospitalType) {
    return db('b_gcs AS bg')
      .leftJoin('view_gcs_sum_hospitals as bh', (v) => {
        v.on('bg.id', 'bh.gcs_id')
        v.on('bh.hospital_id', db.raw(`${hospitalId}`));
      })
      .where((v) => {
        v.where('bg.is_hospital', hospitalType == 'HOSPITAL' ? 'Y' : 'N')
        v.orWhere('bg.is_hospitel', hospitalType == 'HOSPITEL' ? 'Y' : 'N')
      })
      .where('bg.is_deleted', 'N')
  }

  getMedicalSupplies(db, hospitalId) {
    return db('b_medical_supplies AS bms')
      .select('bms.id', 'bms.name', 'bmh.hospital_id', 'bmh.qty', 'bmh.covid_qty', 'vms.qty as usage_qty')
      .leftJoin('b_medical_supplie_hospitals as bmh', 'bmh.medical_supplie_id', 'bms.id')
      .joinRaw(`LEFT JOIN view_medical_supplie_sum_hospitals AS vms ON vms.medical_supplie_id = bms.id AND vms.hospital_id = '?'`, hospitalId)
      .where('bmh.hospital_id', hospitalId)
      .where('bms.is_deleted', 'N')
  }

  getVentilators(db, hospitalId) {
    return db('b_medical_supplies AS bms')
      .select('bms.id', 'bms.name', 'bmh.hospital_id', 'bmh.qty', 'bmh.covid_qty', 'vms.qty as usage_qty')
      .leftJoin('b_medical_supplie_hospitals as bmh', (v) => {
        v.on('bmh.medical_supplie_id', 'bms.id')
        v.on('bmh.hospital_id', db.raw(`${hospitalId}`));
      })
      .leftJoin('view_medical_supplie_sum_hospitals as vms', (v) => {
        v.on('vms.medical_supplie_id', 'bms.id')
        v.on('vms.hospital_id', db.raw(`${hospitalId}`));
      })
      .where('bms.pay_type', 'COVID')
      .where('bms.is_deleted', 'N')
  }

  getRequisitionStock(db: Knex, id, hospitalId) {
    return db('b_generics AS bg')
      .select('u.name as unit_name', 'bg.*', 'wg.id as wm_id', db.raw('sum( ifnull(wrd.qty, 0 ) ) as requisition_qty, ifnull(wg.qty, 0 ) as stock_qty'))
      .join('wm_requisition_details as wrd', 'wrd.generic_id', 'bg.id')
      .leftJoin('wm_generics as wg', (v) => {
        v.on('wg.generic_id', 'bg.id').andOn('wg.hospital_id', hospitalId)
      })
      .leftJoin('b_units as u', 'u.id', 'bg.unit_id')
      .whereIn('wrd.requisition_id', id)
      .groupBy('bg.id')
  }

  updateStockQty(db: Knex, id, qty) {
    return db('wm_generics').update('qty', qty)
      .where('id', id);
  }

  updateReq(db: Knex, id) {
    return db('wm_requisitions').update('is_approved', 'Y')
      .whereIn('id', id);
  }

  countRequisitionhospital(db: Knex, id) {
    return db('wm_requisitions')
      .count('* as count')
      .where('hospital_id_client', id)
  }

  updateDischarge(db: Knex, id, data) {
    return db('p_covid_cases').update(data)
      .where('id', id);
  }
}