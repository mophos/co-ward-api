import * as Knex from 'knex';
import { join } from 'bluebird';

export class CovidCaseModel {

  getCase(db: Knex, hospitalId, query = null) {
    const _query = `%${query}%`;
    const sub = db('p_covid_cases AS c')
      .select('c.id AS covid_case_id',
        'pt.id AS patient_id',
        'c.date_admit',
        'c.date_discharge',
        'c.an', 'c.status',
        'pt.person_id',
        'c.is_deleted')
      .join('p_patients as pt', 'pt.id', 'c.patient_id')
      .where('pt.hospital_id', hospitalId)
      .groupBy('pt.id').as('c');

    // .select('c.id as covid_case_id', 'c.an', 'c.confirm_date', 'c.status', 'c.date_admit', 'c.date_discharge', 'pt.hn', 'pt.person_id', 'p.*', 't.name as title_name')
    const sql = db('p_patients as pt')
      .select('c.covid_case_id', 'pt.hn', 'c.date_admit', 'c.date_discharge', 'c.person_id', 'c.status', 'p.first_name', 'p.last_name', 't.name as title_name')
      .join(sub, 'c.patient_id', 'pt.id')
      .join('p_persons as p', 'pt.person_id', 'p.id')
      .leftJoin('um_titles as t', 'p.title_id', 't.id')
      .where('pt.hospital_id', hospitalId)
      .where('c.is_deleted', 'N')
    // .where('c.status','ADMIT')
    // .whereIn('c.id', id)


    sql.orderBy('c.date_admit', 'DESC');

    if (query) {
      sql.where((w) => {
        w.where('pt.hn', 'like', _query)
          .orWhere('p.first_name', 'like', _query)
          .orWhere('p.last_name', 'like', _query)
          .orWhere('c.status', 'like', _query)

      })
    }

    console.log(sql.toString());
    return sql;

    // .groupBy('pt.id')
  }

  getCovidCasesAmount(db: Knex, hospitalId: number, bedId: number) {
    let sql = db('p_covid_cases as c')
      .count('* as used_qty')
      .leftJoin('p_covid_case_details as cd', (j) => {
        j.on('cd.covid_case_id', 'c.id')
        j.on('cd.bed_id', db.raw(`${bedId}`))
      })
      .leftJoin('p_patients as p', 'p.id', 'c.patient_id')
      .where('c.is_deleted', 'N')
      .where('c.status', 'ADMIT')
      .where('p.hospital_id', hospitalId)
    // console.log(sql.toString());

    return sql
  }

  getCaseMustDischarge(db: Knex, statusId: number, date: string, isBedtype = false) {
    let sql = db('p_covid_case_details as covid_case_details')
      .leftJoin('p_covid_cases as covid_cases', 'covid_cases.id', 'covid_case_details.covid_case_id')
      .where('covid_case_details.status', 'ADMIT')
      .update('covid_case_details.status', 'DISCHARGE')

    if (!isBedtype) {
      sql.where('covid_case_details.gcs_id', statusId)
        .where('covid_cases.date_admit', '<', date)
    }

    if (isBedtype) {
      sql.where('covid_case_details.bed_id', statusId)
        .where('covid_cases.date_admit', '<', date)
    }

    return sql
  }

  getListHosp(db: Knex, hospitalId) {
    return db('wm_requisitions as r')
      .select('r.*', 'h1.hospname')
      .join('b_hospitals as h1', 'h1.id', 'r.hospital_id_client')
      .where('hospital_id_node', hospitalId)
      .where('r.is_approved', 'N')
      .where('r.is_deleted', 'N')
      .groupBy('hospital_id_client')
  }

  getListHospDetail(db: Knex, hospitalIdClient, type) {
    return db('wm_requisitions as r')
      .select('r.*')
      .where('hospital_id_client', hospitalIdClient)
      .whereIn('type', type)
      .where('r.is_deleted', 'N')
      .where('r.is_approved', 'N')
  }

  getListHospDetailClient(db: Knex, hospitalIdClient) {
    return db('wm_requisitions as r')
      .select('r.*')
      // .join('wm_requisition_details as rd', 'rd.requisition_id', 'r.id')
      .where('r.hospital_id_client', hospitalIdClient)
      .where('r.is_deleted', 'N')
  }

  getListDrug(db: Knex, reqId) {
    return db('wm_requisitions as r')
      .select('r.*', 'rd.*', 'g.*', 'u.name as unit_name')
      .join('wm_requisition_details as rd', 'rd.requisition_id', 'r.id')
      .join('b_generics as g', 'g.id', 'rd.generic_id')
      .join('b_units as u', 'u.id', 'g.unit_id')
      .where('r.id', reqId)
      .where('r.is_deleted', 'N')
  }

  getListApproved(db: Knex, hospitalId) {
    return db('wm_requisitions as r')
      .select('r.*', 'h1.hospname as hospital_name_node', 'h2.hospname as hospital_name_client')
      .join('b_hospitals as h1', 'h1.id', 'r.hospital_id_node')
      .join('b_hospitals as h2', 'h2.id', 'r.hospital_id_client')
      .where('r.is_deleted', 'N')
      .where('hospital_id_node', hospitalId)
  }

  getListApprovedDetail(db: Knex, id) {
    return db('wm_requisition_details as r')
      .select('r.*', 'g.name as generic_name', 'u.name as unit_name')
      .join('b_generics as g', 'g.id', 'r.generic_id')
      .leftJoin('b_units as u', 'u.id', 'g.unit_id')
      .where('r.requisition_id', id)
  }

  getCasePresent(db: Knex, hospitalId, query, gcsSearchId, bedSearchId) {
    const _query = `${query}%`;
    // const last = db('views_covid_case')
    //   .max('updated_entry as updated_entry_last')
    //   .whereRaw('covid_case_id=cd.covid_case_id')
    //   .whereNotNull('updated_entry')
    //   .as('updated_entry')

    const sql = db('p_covid_cases as c')
      .select('cd.updated_entry', 'c.id as covid_case_id', 'c.status', 'c.date_admit', 'pt.hn', 'pt.person_id', 'cd.id as covid_case_details_id', 'p.*', 't.name as title_name',
        'cd.bed_id', 'cd.gcs_id', 'cd.medical_supplie_id', db.raw(`ifnull(cd.create_date, null) as create_date`), db.raw(`ifnull(cccd.updated_entry, cd.create_date) as updated_date`),
        db.raw(`ifnull(cd.entry_date, null) as entry_date`),
        //   db.raw(`(select generic_id from p_covid_case_detail_items where covid_case_detail_id = ccd.covid_case_detail_id and (generic_id = 1 or generic_id = 2) limit 1) as set1,
        // (select generic_id from p_covid_case_detail_items where covid_case_detail_id = ccd.covid_case_detail_id and (generic_id = 3 or generic_id = 4) limit 1) as set2,
        // (select generic_id from p_covid_case_detail_items where covid_case_detail_id = ccd.covid_case_detail_id and generic_id = 7  limit 1) as set3,
        // (select generic_id from p_covid_case_detail_items where covid_case_detail_id = ccd.covid_case_detail_id and generic_id = 8  limit 1) as set4`)
        db.raw(`null as set1,null as set2,null as set3`), 'cdi.generic_id as set4'
      )
      .join('p_patients as pt', 'c.patient_id', 'pt.id')
      .join('p_persons as p', 'pt.person_id', 'p.id')
      .leftJoin('um_titles as t', 'p.title_id', 't.id')
      .leftJoin('p_covid_case_detail_last as ccd', 'ccd.covid_case_id', 'c.id')
      .leftJoin('p_covid_case_details as cd', 'ccd.covid_case_detail_id', 'cd.id')
      .joinRaw('  left join p_covid_case_detail_items as cdi on cdi.covid_case_detail_id = cd.id and cdi.generic_id = 8')
      .leftJoin('p_covid_case_detail_last_from_user as cccu', 'cccu.covid_case_id', 'c.id')
      .leftJoin('p_covid_case_details as cccd', 'cccu.covid_case_detail_id', 'cccd.id')
      // .leftJoin('view_generic_case_item as vg', 'vg.covid_case_detail_id', 'cd.id')
      .where('pt.hospital_id', hospitalId)
      .where('c.status', 'ADMIT')
      .where('c.is_deleted', 'N');
    if (gcsSearchId) {
      sql.where('cd.gcs_id', gcsSearchId);
    }
    if (bedSearchId) {
      sql.where('cd.bed_id', bedSearchId);
    }
    if (query) {
      sql.where((v) => {
        v.where('pt.hn', 'like', _query)
        v.orWhere('p.first_name', 'like', _query)
        v.orWhere('p.last_name', 'like', _query)
      });
    }
    // console.log(sql.toString());
    return sql;
  }

  getDrugsFromCovidCaseDetailId(db: Knex, covidCaseDetailId) {
    const sql = db('b_generics as g')
      .select('g.id', 'g.name', db.raw(`if(pdi.id is null,false,true) as is_check`))
      .leftJoin('p_covid_case_detail_items as pdi', (w: any) => {
        w.on('pdi.generic_id', 'g.id')
        w.on('pdi.covid_case_detail_id', db.raw(`${covidCaseDetailId}`))
      })
      .where('g.is_deleted', 'N')
      .where('g.is_actived', 'Y')
      .where('g.type', 'DRUG')
      .where('g.sub_type', 'COVID')
    // console.log(sql.toString());
    return sql;

  }

  getInfo(db: Knex, hospitalId, covidCaseId) {
    return db('p_covid_cases as c')
      .select('c.id as covid_case_id', 'c.an', 'c.status', 'c.date_admit', 'c.confirm_date', 'pt.person_id', 'pt.id as patient_id', 'pt.hn', 'p.*', 't.name as title_name',
        'pv.name_th as province_name', 'd.name_th as ampur_name', 'sd.name_th as tambon_name', 'bc.name as country_name')
      .join('p_patients as pt', 'c.patient_id', 'pt.id')
      .join('p_persons as p', 'pt.person_id', 'p.id')
      .leftJoin('um_titles as t', 'p.title_id', 't.id')
      .leftJoin('b_countries as bc', 'bc.id', 'p.country_code')
      .leftJoin('b_province as pv', 'pv.code', 'p.province_code')
      .leftJoin('b_district as d', (v) => {
        v.on('d.province_code', 'p.province_code')
        v.on('d.code', 'p.ampur_code')
      })
      .leftJoin('b_subdistrict as sd', (v) => {
        v.on('sd.province_code', 'p.province_code')
        v.on('sd.ampur_code', 'p.ampur_code')
        v.on('sd.code', 'p.tambon_code')
      })
      .where('c.id', covidCaseId)
      .where('pt.hospital_id', hospitalId)
  }

  getAmountOfBedByHospitalId(db: Knex, hospitalId: any) {
    let sql = db('b_bed_hospitals as bh')
      .select('covid_qty', 'qty', 'b.name', 'bh.bed_id')
      .leftJoin('b_beds as b', 'b.id', 'bh.bed_id')
      .where('bh.hospital_id', hospitalId)

    return sql
  }

  // getAmountOfBedByHospitalId(db: Knex, hospitalId: any, bedId: string, date: string) {
  //   let sql = db('wm_bed_details as bd')
  //     .select('bd.covid_qty', 'bd.qty', 'bd.spare_qty', 'bb.name', 'b.date', 'bd.bed_id' )
  //     .leftJoin('wm_beds as b', 'b.id', 'bd.wm_bed_id')
  //     .leftJoin('b_beds as bb', 'bb.id', 'bd.bed_id')
  //     .where('b.hospital_id', hospitalId)
  //     .where('bd.bed_id', bedId)
  //     .where((v) => {
  //       v.where('b.date', '<', date)
  //       v.orWhere('b.date', date)
  //     })
  //     .orderBy('b.date', 'DESC')

  //   return sql
  // }

  getHistory(db: Knex, personId) {
    return db('p_covid_cases as c')
      .select('c.id as covid_case_id', 'c.confirm_date', 'c.status', 'c.date_admit', 'h.hospname', 'c.an', 'c.date_discharge')
      .join('p_patients as pt', 'c.patient_id', 'pt.id')
      .join('p_persons as p', 'pt.person_id', 'p.id')
      .join('b_hospitals as h', 'pt.hospital_id', 'h.id')
      .where('pt.person_id', personId)
      .where('c.is_deleted', 'N')
      .orderBy('c.date_admit')
  }

  getHistoryCID(db: Knex, cid) {
    return db('p_covid_cases as c')
      .select('c.id as covid_case_id', 'c.confirm_date', 'c.status', 'c.date_admit', 'h.hospname', 'c.an', 'c.date_discharge', 'c.reason')
      .join('p_patients as pt', 'c.patient_id', 'pt.id')
      .join('p_persons as p', 'pt.person_id', 'p.id')
      .join('b_hospitals as h', 'pt.hospital_id', 'h.id')
      .where('c.is_deleted', 'N')
      .where((v) => {
        v.where('p.cid', cid)
        v.orWhere('p.passport', cid)
      })
      .orderBy('c.date_admit');
  }

  getDetails(db: Knex, covidCaseId) {
    return db('p_covid_case_details AS pc')
      .select('pc.id', 'pc.gcs_id', 'pc.bed_id', 'pc.medical_supplie_id', 'bg.name as gcs_name', 'bb.name as bed_name', 'bm.name as medical_supplie_name', 'pc.status', 'pc.entry_date', 'uu.fname', 'uu.lname', 'c.date_discharge')
      .join('p_covid_cases as c', 'c.id', 'pc.covid_case_id')
      .leftJoin('b_gcs as bg', 'bg.id', 'pc.gcs_id')
      .leftJoin('b_beds as bb', 'bb.id', 'pc.bed_id')
      .leftJoin('b_medical_supplies as bm', 'bm.id', 'pc.medical_supplie_id')
      .leftJoin('um_users as uu', 'uu.id', 'pc.create_by')
      .where('pc.covid_case_id', covidCaseId)
      .orderBy('pc.id')
  }

  checkCidSameHospital(db: Knex, hospitalId, cid) {
    return db('p_patients as pt')
      .join('p_persons as p', 'pt.person_id', 'p.id')
      .join('p_covid_cases as c', 'c.patient_id', 'pt.id')
      .where('pt.hospital_id', hospitalId)
      .where('c.status', 'ADMIT')
      .where('c.is_deleted', 'N')
      .where('p.cid', cid)
  }

  checkCidAllHospital(db: Knex, hospitalId, cid) {
    return db('p_patients as pt')
      .select('h.hospname', 'p.*', 'va.tambon_name', 'va.ampur_name', 'va.province_name', 'c.name as country_name', 'cc.id as covid_case_id', 'cc.status')
      .join('p_persons as p', 'pt.person_id', 'p.id')
      .join('p_covid_cases as cc', 'cc.patient_id', 'pt.id')
      .join('b_hospitals as h', 'h.id', 'pt.hospital_id')
      .leftJoin('view_address as va', (v) => {
        v.on('va.ampur_code', 'p.ampur_code')
        v.on('va.tambon_code', 'p.tambon_code')
        v.on('va.province_code', 'p.province_code')
      })
      .leftJoin('b_countries as c', 'c.id', 'p.country_code')
      .whereNot('pt.hospital_id', hospitalId)
      .where('cc.is_deleted', 'N')
      .where('p.cid', cid)
  }

  checkPassportSameHospital(db: Knex, hospitalId, passport) {
    return db('p_patients as pt')
      .join('p_persons as p', 'pt.person_id', 'p.id')
      .join('p_covid_cases as c', 'c.patient_id', 'pt.id')
      .where('pt.hospital_id', hospitalId)
      .where('c.status', 'ADMIT')
      .where('c.is_deleted', 'N')
      .where('p.passport', passport)
  }

  checkPassportAllHospital(db: Knex, hospitalId, passport) {
    return db('p_patients as pt')
      .select('h.hospname', 'p.*', 'va.tambon_name', 'va.ampur_name', 'va.province_name', 'c.name as country_name', 'cc.id as covid_case_id')
      .join('p_persons as p', 'pt.person_id', 'p.id')
      .join('p_covid_cases as cc', 'cc.patient_id', 'pt.id')
      .join('b_hospitals as h', 'h.id', 'pt.hospital_id')
      .leftJoin('view_address as va', (v) => {
        v.on('va.ampur_code', 'p.ampur_code')
        v.on('va.tambon_code', 'p.tambon_code')
        v.on('va.province_code', 'p.province_code')
      })
      .leftJoin('b_countries as c', 'c.id', 'p.country_code')
      .whereNot('pt.hospital_id', hospitalId)
      .where('cc.status', 'ADMIT')
      .where('cc.is_deleted', 'N')
      .where('p.passport', passport)
  }

  saveCovidCase(db: Knex, data) {
    return db('p_covid_cases')
      .insert(data)
  }

  saveIcds(db: Knex, data) {
    return db('p_icd10').insert(data);
  }

  updateCovidCase(db: Knex, id, data) {
    return db('p_covid_cases')
      .where('id', id)
      .whereRaw('date_entry=CURRENT_DATE()')
      .update(data)
      .update('updated_entry', db.fn.now())

  }

  updateAnCovidCase(db: Knex, id, an) {
    return db('p_covid_cases')
      .where('id', id)
      .update('updated_entry', db.fn.now())
      .update('an', an)

  }

  updateCovidCaseAllow(db: Knex, id, data) {
    return db('p_covid_cases')
      .where('id', id)
      .update('updated_entry', db.fn.now())
      .update(data)
  }

  saveCovidCaseOldDetail(db: Knex, data) {
    let sql = `
    INSERT INTO p_covid_case_details
    (covid_case_id, entry_date,status,updated_entry)
    VALUES(?,?,?,now())
    ON DUPLICATE KEY UPDATE
     updated_date=now(),updated_entry=now()`;
    return db.raw(sql, [data.covid_case_id, data.entry_date, data.status])
  }

  saveCovidCaseDetail(db: Knex, data) {
    // console.log(data);

    let sql = `
    INSERT INTO p_covid_case_details
    (covid_case_id, gcs_id, bed_id, medical_supplie_id, entry_date,status,created_by,updated_entry)
    VALUES(?,?,?,?,?,?,?,now())
    ON DUPLICATE KEY UPDATE
    gcs_id=? , bed_id=? , medical_supplie_id=?, updated_date=now(),status=?,updated_by = ?,updated_entry=now()`;
    return db.raw(sql, [data.covid_case_id, data.gcs_id, data.bed_id, data.medical_supplie_id, data.entry_date, data.status, data.create_by,
    data.gcs_id, data.bed_id, data.medical_supplie_id, data.status, data.create_by])
  }

  saveCovidCaseDetailReq(db: Knex, data) {
    let sql = `
    INSERT INTO p_covid_case_details
    (is_requisition,covid_case_id, gcs_id, bed_id, medical_supplie_id, entry_date,status,created_by,updated_entry)
    VALUES(?,?,?,?,?,?,?,?,now())
    ON DUPLICATE KEY UPDATE
    is_requisition = ?,gcs_id=? , bed_id=? , medical_supplie_id=?, updated_date=now(),status=?,updated_by = ?,updated_entry=now()`;
    return db.raw(sql, [data.is_requisition, data.covid_case_id, data.gcs_id, data.bed_id, data.medical_supplie_id, data.entry_date, data.status, data.created_by,
    data.is_requisition, data.gcs_id, data.bed_id, data.medical_supplie_id, data.status, data.created_by])
  }

  saveCovidCaseDetailGenerate(db: Knex, data) {
    let sql = `
    INSERT INTO p_covid_case_details
    (covid_case_id, gcs_id, bed_id, medical_supplie_id, entry_date,status,create_by)
    VALUES(?,?,?,?,?,?,?)`;
    return db.raw(sql, [data.covid_case_id, data.gcs_id, data.bed_id, data.medical_supplie_id, data.entry_date, data.status, data.create_by])
  }

  saveCovidCaseDetailItem(db: Knex, data) {
    return db('p_covid_case_detail_items')
      .insert(data);
  }

  savePerson(db: Knex, data) {
    let sql = `
    INSERT INTO p_persons
    (cid, passport, title_id, first_name, middle_name, last_name, gender_id, birth_date, telephone, people_type, house_no, room_no, village, village_name, road, tambon_code, ampur_code, province_code, zipcode, current_house_no, current_room_no, current_village, current_village_name, current_road, current_tambon_code, current_ampur_code, current_province_code, current_zipcode, country_code, tambon_name, ampur_name, province_name, current_tambon_name, current_ampur_name, current_province_name)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE
    title_id=? , first_name=? , middle_name=?, last_name=?, gender_id=?, birth_date=?, telephone=?, people_type=?, house_no=?, room_no=?, village=?, village_name=?, road=?, tambon_code=?, ampur_code=?, province_code=?, zipcode=?, country_code=?, tambon_name=?, ampur_name=?, province_name=?`;
    // console.log('cid', data.cid, 'passport', data.passport, 'title_id', data.title_id, 'first_name', data.first_name, 'middle_name', data.middle_name, 'last_name', data.last_name, 'gender_id', data.gender_id, 'birth_date', data.birth_date, 'telephone', data.telephone, 'people_type', data.people_type, 'house_no', data.house_no, 'room_no', data.room_no, 'village', data.village, 'village_name', data.village_name, 'road', data.road, 'tambon_code', data.tambon_code, 'ampur_code', data.ampur_code, 'province_code', data.province_code, 'zipcode', data.zipcode, 'country_code', data.country_code, 'tambon_name', data.tambon_name, 'ampur_name', data.ampur_name, 'province_name', data.province_name);

    return db.raw(sql, [data.cid, data.passport, data.title_id, data.first_name, data.middle_name, data.last_name, data.gender_id, data.birth_date, data.telephone, data.people_type, data.house_no, data.room_no, data.village, data.village_name, data.road, data.tambon_code, data.ampur_code, data.province_code, data.zipcode, data.current_house_no, data.current_room_no, data.current_village, data.current_village_name, data.current_road, data.current_tambon_code, data.current_ampur_code, data.current_province_code, data.current_zipcode, data.country_code, data.tambon_name, data.ampur_name, data.province_name, data.current_tambon_name, data.current_ampur_name, data.current_province_name, data.title_id, data.first_name, data.middle_name, data.last_name, data.gender_id, data.birth_date, data.telephone, data.people_type, data.house_no, data.room_no, data.village, data.village_name, data.road, data.tambon_code, data.ampur_code, data.province_code, data.zipcode, data.country_code, data.tambon_name, data.ampur_name, data.province_name]);
  }

  updateCaseStatus(db: Knex, id) {
    return db('p_covid_cases')
      .update('case_status', 'COVID')
      .where('id', id);
  }

  getPerson(db: Knex, id) {
    return db('p_persons')
      .where('id', id)
  }

  getPersonByCid(db: Knex, cid) {
    return db('p_persons')
      .where('cid', cid)
  }

  getPersonByName(db: Knex, firstname, lastname) {
    return db('p_persons')
      .where('first_name', firstname)
      .where('last_name', lastname)
  }

  getPatientByHN(db: Knex, hospitalId, hn) {
    return db('p_patients')
      .where('hn', hn)
      .where('hospital_id', hospitalId)
  }

  getPatientByPersonId(db: Knex, hospitalId, personId) {
    return db('p_patients')
      .where('person_id', personId)
      .where('hospital_id', hospitalId)
  }

  getPersonByPassport(db: Knex, passport) {
    return db('p_persons')
      .where('passport', passport)
  }

  updatePerson(db: Knex, id, data) {
    return db('p_persons')
      .update(data)
      .where('id', id);
  }

  savePatient(db: Knex, data) {
    return db('p_patients')
      .insert(data);
    // let sql = `INSERT INTO p_patients
    // (hospital_id, hn, person_id)
    // VALUES(?,?,?)
    // ON DUPLICATE KEY UPDATE
    // hospital_id=?,hn=?`;
    // return db.raw(sql, [data.hospital_id, data.hn, data.person_id, data.hospital_id, data.hn]);
  }
  updatePatient(db: Knex, id, data) {
    return db('p_patients')
      .update(data)
      .where('id', id);
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
      .select('bb.id', 'bb.name', 'bh.hospital_id', 'bh.qty', 'bh.covid_qty', 'vms.qty as usage_qty')
      .leftJoin('b_bed_hospitals as bh', (v) => {
        v.on('bb.id', 'bh.bed_id')
        v.on('bh.hospital_id', db.raw(`${hospitalId}`));
      })
      .joinRaw(`LEFT JOIN (
        SELECT
          count(*) as qty,
          cd.bed_id
        FROM
          p_covid_case_detail_last AS cl
          JOIN p_covid_case_details AS cd ON cd.id = cl.covid_case_detail_id
          JOIN p_covid_cases AS c ON c.id = cl.covid_case_id
          JOIN p_patients AS pt ON pt.id = c.patient_id 
          where pt.hospital_id = ${hospitalId} and c.status = 'ADMIT' and c.is_deleted = 'N' 
          group by cd.bed_id
        ) AS vms ON vms.bed_id = bb.id`)
      .where((v) => {
        v.where('bb.is_hospital', hospitalType == 'HOSPITAL' ? 'Y' : 'N')
        v.orWhere('bb.is_hospitel', hospitalType == 'HOSPITEL' ? 'Y' : 'N')
        v.orWhere('bb.is_field', hospitalType == 'FIELD' ? 'Y' : 'N')
        v.orWhere('bb.is_ci', hospitalType == 'CI' ? 'Y' : 'N')
      })
      .where('bb.is_deleted', 'N')
  }

  getGcs(db, hospitalId, hospitalType) {
    const view = db('p_covid_case_detail_last as v')
      .select('p.hospital_id', 'cd.gcs_id')
      .count('* as qty')
      .join('p_covid_cases as c', 'c.id', 'v.covid_case_id')
      .join('p_covid_case_details as cd', 'cd.id', 'v.covid_case_detail_id')
      .join('p_patients as p', 'p.id', 'c.patient_id')
      .where('c.status', 'ADMIT')
      .where('p.hospital_id', hospitalId)
      .groupBy('cd.gcs_id').as('bh')


    return db('b_gcs AS bg')
      .leftJoin(view, 'bg.id', 'bh.gcs_id')
      .where((v) => {
        v.where('bg.is_hospital', hospitalType == 'HOSPITAL' ? 'Y' : 'N')
        v.orWhere('bg.is_hospitel', hospitalType == 'HOSPITEL' ? 'Y' : 'N')
        v.orWhere('bg.is_field', hospitalType == 'FIELD' ? 'Y' : 'N')
        v.orWhere('bg.is_ci', hospitalType == 'CI' ? 'Y' : 'N')
      })
      .where('bg.is_deleted', 'N').orderBy('bg.id', 'ASC')
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
      .joinRaw(`LEFT JOIN (
        SELECT
          count(*) as qty,
          cd.medical_supplie_id
        FROM
          p_covid_case_detail_last AS cl
          JOIN p_covid_case_details AS cd ON cd.id = cl.covid_case_detail_id
          JOIN p_covid_cases AS c ON c.id = cl.covid_case_id
          JOIN p_patients AS pt ON pt.id = c.patient_id 
          where pt.hospital_id = ${hospitalId} and c.status = 'ADMIT' and c.is_deleted = 'N' and cd.medical_supplie_id is not null
          group by cd.medical_supplie_id
        ) AS vms ON vms.medical_supplie_id = bms.id`)
      .where('bms.pay_type', 'COVID')
      .where('bms.is_deleted', 'N')
  }

  getRequisitionStock(db: Knex, id, hospitalId) {
    return db('b_generics AS bg')
      .select('u.name as unit_name', 'bg.*', 'bg.id as generic_id', 'wg.hospital_id', 'wg.id as wm_id', db.raw('sum( ifnull(wrd.qty, 0 ) ) as requisition_qty, ifnull(wg.qty, 0 ) as stock_qty'))
      .join('wm_requisition_details as wrd', 'wrd.generic_id', 'bg.id')
      .leftJoin('wm_generics as wg', (v) => {
        v.on('wg.generic_id', 'bg.id').andOn('wg.hospital_id', hospitalId)
      })
      .leftJoin('b_units as u', 'u.id', 'bg.unit_id')
      .whereIn('wrd.requisition_id', id)
      .groupBy('bg.id')
  }

  increaseStockQty(db: Knex, data) {
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

  decreaseStockQty(db: Knex, data) {
    let sqls = [];
    data.forEach(v => {
      let sql = `
          INSERT INTO wm_generics
          (hospital_id, generic_id,qty,update_date,created_by)
          VALUES('${v.hospital_id}', '${v.generic_id}',${v.qty}, now(),${v.created_by})
          ON DUPLICATE KEY UPDATE
          qty=qty-${v.qty},update_date=now(),updated_by=${v.created_by}
        `;
      sqls.push(sql);
    });
    let queries = sqls.join(';');
    return db.raw(queries);
  }

  updateReq(db: Knex, id, approveDate, userId) {
    return db('wm_requisitions')
      .update({
        'is_approved': 'Y',
        'approve_date': approveDate
      })
      .update('updated_by', userId)
      .update('update_date', db.fn.now())
      .whereIn('id', id);
  }

  countRequisitionhospitalDrugs(db: Knex, id) {
    return db('wm_requisitions')
      .count('* as count')
      .where('hospital_id_client', id)
      .where('type', 'DRUG')
  }
  countRequisitionhospitalSupplies(db: Knex, id) {
    return db('wm_requisitions')
      .count('* as count')
      .where('hospital_id_client', id)
      .where('type', 'SUPPLIES')
  }

  updateDischarge(db: Knex, id, data) {
    return db('p_covid_cases')
      .update(data)
      .update('updated_entry', db.fn.now())
      .where('id', id);
  }

  updateDischargeDetail(db: Knex, id, data) {
    return db('p_covid_case_details').update(data)
      .update('updated_entry', db.fn.now())
      .where('id', id);
  }

  isDeleted(db: Knex, id) {
    let sql = db('p_covid_cases')
      .update('is_deleted', 'Y')
      .update('updated_entry', db.fn.now())
      .where('id', id)
      .whereRaw('date_entry=CURRENT_DATE()');
    return sql;

  }

  removeCovidCaseDetailItem(db: Knex, id) {
    return db('p_covid_case_detail_items')
      .delete()
      .where('covid_case_detail_id', id)
  }

  selectCovidCaseDetailItem(db: Knex, id) {
    return db('p_covid_case_detail_items')
      .where('covid_case_detail_id', id)
  }

  updateCovidCaseDetailItem(db: Knex, oldId, newId) {
    return db('p_covid_case_detail_items')
      .update('covid_case_detail_id', newId)
      .where('covid_case_detail_id', oldId)
  }

  getCovidCaseDetailId(db: Knex, id, date) {
    return db('p_covid_case_details')
      .select('id')
      .where('covid_case_id', id)
      .where('entry_date', '>', date)
  }

  removeCovidCaseDetail(db: Knex, id) {
    return db('p_covid_case_details')
      .delete()
      .where('id', id)
  }

  removeRequisition(db: Knex, id) {
    return db('wm_requisitions')
      .update('is_deleted', 'Y')
      .where('covid_case_detail_id', id)
      .where('is_approved', 'N')
  }

  listOldPatient(db: Knex, hospitalId) {
    const sql = `SELECT covid_case_id FROM view_covid_case WHERE gcs_id IS NULL GROUP BY covid_case_id`;
    const sqls = `select id from view_date_diff `;

    return db('p_covid_case_detail_last as cl')
      .select('p.hn', 'pc.an', 'pp.first_name', 'pp.last_name', 'p.id as patient_id', 'pc.id as covid_case_id', 'pc.date_admit', 'pc.date_discharge')
      .join('p_covid_cases as pc', 'pc.id', 'cl.covid_case_id')
      .join('p_patients as p', 'p.id', 'pc.patient_id')
      .join('p_persons as pp', 'pp.id', 'p.person_id')
      .where('p.hospital_id', hospitalId)
      .where('pc.is_deleted', 'N')
      .where((v) => {
        v.whereRaw(`pc.id in (${sql})`)
        v.orWhereRaw(`pc.id in (${sqls})`)
      }).orderBy('pc.id');
  }

  oldPatientDetail(db: Knex, covidCaseId) {
    return db('p_covid_cases as c')
      .leftJoin('p_covid_case_details as pd', 'pd.covid_case_id', 'c.id')
      .where('c.id', covidCaseId)
  }

  getLastStatus(db: Knex, covidCaseId) {
    return db('p_covid_case_details as cd').where('covid_case_id', covidCaseId).orderBy('id', 'DESC').limit(1);
  }

  getSplitDates(db: Knex, covidCaseId) {
    return db('p_covid_case_details as cd').where('covid_case_id', covidCaseId);
  }

  getCasePresentNotUpdate(db: Knex, hospitalId, date, gcsSearchId, bedSearchId) {
    const sql = db('p_covid_cases as c')
      .select('c.id as covid_case_id', 'c.status', 'cd.id as covid_case_details_id',
        'cd.bed_id', 'cd.gcs_id', 'cd.medical_supplie_id', db.raw(`ifnull(cd.create_date, null) as create_date`),
        db.raw(`ifnull(cd.entry_date, null) as entry_date`)
      )
      .join('p_patients as pt', 'c.patient_id', 'pt.id')
      .leftJoin('p_covid_case_detail_last as ccd', 'ccd.covid_case_id', 'c.id')
      .leftJoin('p_covid_case_details as cd', 'ccd.covid_case_detail_id', 'cd.id')
      .where('pt.hospital_id', hospitalId)
      .where('c.status', 'ADMIT')
      .where('c.is_deleted', 'N')
      .where('cd.entry_date', '<', date)
    if (gcsSearchId) {
      sql.where('cd.gcs_id', gcsSearchId);
    }
    if (bedSearchId) {
      sql.where('cd.bed_id', bedSearchId);
    }
    console.log(sql.toString());
    return sql;
  }

  checkAN(db: Knex, patientId, an) {
    return db('p_covid_cases as c')
      .where('patient_id', patientId)
      .where('an', an)
  }

  checkANFromHN(db: Knex, hospitalId, hn, an) {
    return db('p_covid_cases as c')
      .join('p_patients as pt', 'pt.id', 'c.patient_id')
      .where('pt.hospital_id', hospitalId)
      .where('pt.hn', hn)
      .where('c..is_deleted', 'N')
      .where('c.an', an)
  }
  getMaxCovidCaseDetail(db: Knex, covidCaseId) {
    return db('p_covid_case_details')
      .where('covid_case_id', covidCaseId)
      .orderBy('id', 'desc')
      .limit(1);
  }

  getSendPhr(db: Knex) {
    return db('view_wait_send_phr');
  }

  updateIsSendPhr(db: Knex, caseId) {
    return db('p_covid_cases')
      .update('is_send_phr', 'Y')
      .whereIn('id', caseId);
  }

  getAutoDC(db: Knex) {
    return db('sys_auto_discharge')
  }

  getDataForDC(db: Knex, gcsId, bedId, day) {
    const sql = db('p_covid_cases as c')
      .select('cl.covid_case_id', 'cl.covid_case_detail_id', 'cd.medical_supplie_id', 'cd.bed_id', 'cd.gcs_id')
      .join('p_covid_case_detail_last as cl', 'cl.covid_case_id', 'c.id')
      .join('p_covid_case_details as cd', 'cd.id', 'cl.covid_case_detail_id')
      .where('c.is_deleted', 'N')
      .where('c.status', 'ADMIT')
      .where('cd.gcs_id', gcsId)
      .where('cd.bed_id', bedId)
      // .limit(10)
      .whereRaw(`DATEDIFF( now(),c.date_admit ) > ?`, day)
    // console.log(sql.toString());
    return sql;
  }

  getDataForDC1(db: Knex) {
    const sql = db('p_covid_cases as c')
      .select('c.id as covid_case_id')
      .count('* as c')
      .join('p_covid_case_details as cd', 'cd.covid_case_id', 'c.id')
      // .join('p_covid_case_detail_last as cl','cl.covid_case_id','c.id')
      // .join('p_covid_case_details as cd2','cd2.id','cl.covid_case_detail_id')
      // .join('b_gcs as g','g.id','cd2.gcs_id')
      .where('c.is_deleted', 'N')
      .where('c.status', 'ADMIT')
      .groupBy('c.id')
      .having('c', '>=', 10)
    // .having('g.discharge_day','>','c')
    console.log(sql.toString());
    return sql;
  }

  getDataForDC2(db: Knex, covidCaseId) {
    return db('p_covid_case_details as cd')
      .select('cd.covid_case_id', 'g.discharge_day')
      .count('* as c')
      .max('cd.entry_date as entry_date')
      .join('b_gcs as g', 'g.id', 'cd.gcs_id')
      .where('cd.covid_case_id', covidCaseId)
      .groupBy('cd.gcs_id')
      .orderBy('entry_date', 'DESC')
  }

  getDataForDC3(db: Knex, covidCaseId) {
    return db('p_covid_case_detail_last as cl')
      .join('p_covid_case_details as cd', 'cd.id', 'cl.covid_case_detail_id')
      .select('cl.covid_case_id', 'cd.id', 'cd.gcs_id', 'cd.bed_id', 'cd.medical_supplie_id')
      .where('cl.covid_case_id', covidCaseId)
  }

  getCovidInfo(db: Knex, covidCaseId) {
    return db('p_covid_cases')
      .where('id', covidCaseId)
  }
}
