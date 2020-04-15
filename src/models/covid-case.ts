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

  getListHospDetail(db: Knex, hospitalIdClient) {
    return db('wm_requisitions as r')
      .select('r.*')
      // .join('wm_requisition_details as rd', 'rd.requisition_id', 'r.id')
      .where('hospital_id_client', hospitalIdClient)
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

  getCasePresent(db: Knex, hospitalId) {
    return db('p_covid_cases as c')
      .select('c.id as covid_case_id', 'c.status', 'c.date_admit', 'pt.hn', 'pt.person_id', 'p.*', 't.name as title_name',
        'cd.bed_id', 'cd.gcs_id', 'cd.respirator_id', db.raw(`DATE_FORMAT(cd.create_date, "%Y-%m-%d") as create_date`),
        db.raw(`(select generic_id from p_covid_case_detail_items where covid_case_detail_id = ccd.covid_case_detail_id and (generic_id = 1 or generic_id = 2) limit 1) as set1,
      (select generic_id from p_covid_case_detail_items where covid_case_detail_id = ccd.covid_case_detail_id and (generic_id = 3 or generic_id = 5) limit 1) as set2,
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
      .where('c.status', 'ADMIT');
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
      .where('pt.hospital_id', hospitalId)
      .where('p.cid', cid)
  }

  checkCidAllHospital(db: Knex, cid) {
    return db('p_patients as pt')
      .join('p_persons as p', 'pt.person_id', 'p.id')
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

  findNode(db: Knex, hospitalId) {
    return db('h_node_details as nd')
      .select('n.hospital_id')
      .join('h_nodes as n', 'n.id', 'nd.node_id')
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

  getBeds(db: Knex, hospitalId) {
    return db('view_beds as b')
      .where('b.hospital_id', hospitalId)
  }

  getGcs(db, hospitalId) {
    return db.raw(`select g.id,g.name,ifnull(gg.count,0) as count from b_gcs as g 
    left join (
    select ccd.gcs_id,count(*) as count from p_covid_case_details as ccd 
    join (SELECT c.id,p.hospital_id from p_covid_cases as c 
    join p_patients as p on c.patient_id = p.id 
    where c.status = 'ADMIT') as cc on ccd.covid_case_id = cc.id
    where cc.hospital_id = ?
    GROUP BY ccd.gcs_id) as gg on g.id = gg.gcs_id`, [hospitalId]);
  }

  getRespirators(db, hospitalId) {
    return db.raw(`select g.id,g.name,ifnull(gg.count,0) as count from b_respirators as g 
    left join (
    select ccd.respirator_id,count(*) as count from p_covid_case_details as ccd 
    join (SELECT c.id,p.hospital_id from p_covid_cases as c 
    join p_patients as p on c.patient_id = p.id 
    where c.status = 'ADMIT') as cc on ccd.covid_case_id = cc.id
    where cc.hospital_id = ?
    GROUP BY ccd.respirator_id) as gg on g.id = gg.respirator_id`, [hospitalId]);
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

  updateDischarge(db: Knex, id, data) {
    return db('p_covid_cases').update(data)
      .where('id', id);
  }
}