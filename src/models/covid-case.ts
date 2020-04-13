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

  getListApproved(db: Knex, hospitalId) {
    return db('wm_requisitions as r')
      .select('r.*', 'h1.hospname as hospital_name_node', 'h2.hospname as hospital_name_client')
      .join('b_hospitals as h1', 'h1.id', 'r.hospital_id_node')
      .join('b_hospitals as h2', 'h2.id', 'r.hospital_id_client')
      .where('hospital_id_node', hospitalId)
  }

  getListApprovedDetail(db: Knex, id) {
    return db('wm_requisition_details as r')
    .select('r.*','g.name as generic_name','u.name as unit_name')
      .join('b_generics as g', 'g.id', 'r.generic_id')
      .leftJoin('b_units as u', 'u.id', 'g.unit_id')
      .where('r.requisition_id', id)
  }

  getCasePresent(db: Knex, hospitalId) {

    return db('p_covid_cases as c')
      .select('c.id as covid_case_id', 'c.status', 'c.date_admit', 'pt.hn', 'pt.person_id', 'p.*', 't.name as title_name',
        'cd.bed_id', 'cd.gcs_id', 'cd.respirator_id', db.raw(`DATE_FORMAT(cd.create_date, "%Y-%m-%d") as create_date`))
      .join('p_patients as pt', 'c.patient_id', 'pt.id')
      .join('p_persons as p', 'pt.person_id', 'p.id')
      .leftJoin('um_titles as t', 'p.title_id', 't.id')
      .joinRaw(`left join (	select max(ccd.id) as covid_case_detail_id,cc.patient_id from p_covid_case_details as ccd
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
}