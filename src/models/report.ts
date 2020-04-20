import Knex = require('knex');
import * as moment from 'moment';

export class ReportModel {

  getPatient(db: Knex, provinceCode: any, hospitalId: any, query: any = '') {
    return db('b_hospitals as h')
      .select('h.id', 'h.hospcode', 'h.hospname', 'h.hosptype_code')
      .count('p.id as count')
      .leftJoin('p_patients as p', 'p.hospital_id', 'h.id')
      .leftJoin('p_covid_cases as c', 'c.patient_id', 'p.id')
      .where('h.province_code', provinceCode)
      .whereNot('h.id', hospitalId)
      .where((v) => {
        v.where('h.hospname', 'like', '%' + query + '%')
        v.orWhere('h.hospcode', 'like', '%' + query + '%')
      })
      .groupBy('h.id')
  }

  getHospital(db: Knex, provinceCode: any, hospitalId: any) {
    return db('b_hospitals as b')
      .where('b.province_code', provinceCode)
      .whereNot('b.id', hospitalId)
  }

  getZoneHospital(db: Knex, zoneCode) {
    return db('b_hospitals as h')
      .count('p.id as count')
      .select('h.id as hospital_id', 'h.hospname', 'h.hospcode', 'h.province_name', 'p.id as patient_id')
      .join('p_patients as p', 'p.hospital_id', 'h.id')
      .join('p_covid_cases as c', 'c.patient_id', 'p.id')
      .where('h.zone_code', zoneCode)
      .where('c.status', 'ADMIT')
      .groupBy('h.id')
      .orderBy('h.province_name')
  }

  getCovidCase(db: Knex) {
    return db('p_covid_cases as p')
      .join('p_patients as pp', 'pp.id', 'p.patient_id')
      .join('p_covid_case_details as pc', 'pc.covid_case_id', 'p.id')
      .join('b_gcs as g', 'g.id', 'pc.gcs_id')
      .where('p.status', 'ADMIT')
      .groupBy('pp.id');
  }

  getSupplies(db: Knex, hospitalId: any, date: any = '') {
    return db('wm_supplies as s')
      .select('g.id as generic_id', 'g.name as generic_name', 'sd.qty', 'u.name as unit_name')
      .leftJoin('wm_supplies_details as sd', 's.id', 'sd.wm_supplie_id')
      .leftJoin('b_generics as g', 'g.id', 'sd.generic_id')
      .leftJoin('b_units as u', 'u.id', 'g.unit_id')
      .where('s.hospital_id', hospitalId)
      .where('s.create_date', 'like', '%' + date + '%');
  }

  getSupInfo(db: Knex) {
    return db('b_generics as g')
      .where('type', 'SUPPLIES')
      .where('is_actived', 'Y')
      .where('is_deleted', 'N')
  }

  getSupplie(db: Knex, data, provinceCode: any, hospitalId: any) {
    let sql = `SELECT
    h.id,
    h.hospcode,
    h.hospname,`;
    for (let v = 0; v < data.length; v++) {
      sql += `(
      SELECT
        sd.qty 
      FROM
        wm_supplies_details AS sd
        LEFT JOIN b_generics AS g ON g.id = sd.generic_id 
      WHERE
        sd.wm_supplie_id = s.id 
        AND g.id = ${data[v].id} 
        ) AS 'g${data[v].id}'`;
      if (v != data.length - 1) {
        sql += ','
      }
    }
    sql += `FROM
    b_hospitals h
    LEFT JOIN wm_supplies s ON s.hospital_id = h.id
    WHERE h.province_code = ? AND h.id != ?`;
    return db.raw(sql, [provinceCode, hospitalId]);
  }

  // getSupplie(db: Knex, provinceCode: any, hospitalId: any, query: any = '', date: any = '') {
  //   return db('b_hospitals as h')
  //     .select('h.id', 'h.hospcode', 'h.hospname', 'h.hosptype_code', 'g.name as generic_name', 'sd.qty', 'u.name as unit_name')
  //     .leftJoin('wm_supplies as s', 's.hospital_id', 'h.id')
  //     .leftJoin('wm_supplies_details as sd', 's.id', 'sd.wm_supplie_id')
  //     .leftJoin('b_generics as g', 'g.id', 'sd.generic_id')
  //     .leftJoin('b_units as u', 'u.id', 'g.unit_id')
  //     .where('h.province_code', provinceCode)
  //     .whereNot('h.id', hospitalId)
  //     // .where('s.create_date', 'like', '%' + date + '%')
  //     .where((v) => {
  //       v.where('h.hospname', 'like', '%' + query + '%')
  //       v.orWhere('h.hospcode', 'like', '%' + query + '%')
  //       v.orWhere('g.name', 'like', '%' + query + '%')
  //     })
  // }

}