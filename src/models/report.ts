import Knex = require('knex');
import * as moment from 'moment';
import { join } from 'bluebird';

export class ReportModel {

  getGcsAdmit(db: Knex, date) {
    // return db('views_case_dates AS vcl')
    //   .count('* as count')
    //   .select('vcl.gcs_id', 'bg.name as gcs_name', 'pp.hospital_id')
    //   .join('p_patients AS pp', 'pp.id', 'vcl.patient_id')
    //   .join('b_hospitals AS bh', 'bh.id', 'pp.hospital_id')
    //   .join('b_gcs as bg', 'bg.id', 'vcl.gcs_id')
    //   .where('vcl.entry_date', date)
    //   .where('vcl.status', 'ADMIT')
    //   .groupBy('pp.hospital_id', 'vcl.gcs_id')
    return db('views_case_hospital_date_cross as v')
      .select('h.province_code', 'h.province_name', 'h.zone_code', 'h.hospcode', 'h.hospname', 'h.id as hospital_id')
      .sum('severe as severe')
      .sum('mild as mild')
      .sum('moderate as moderate')
      .sum('asymptomatic as asymptomatic')
      .sum('ip_pui as ip_pui')
      .count('* as count')
      .join('b_hospitals as h', 'h.id', 'v.hospital_id')
      .where('v.entry_date', date)
      .where('v.status', 'ADMIT')
      .groupBy('h.id')
      .orderBy('h.zone_code')
      .orderBy('h.province_code')
  }

  getGcs(db: Knex, date) {
    return db('views_case_dates AS vcl')
      .select('vcl.gcs_id', 'bg.name as gcs_name', 'pp.hospital_id', 'pp.hn', 'vcl.date_admit', 'vcl.status')
      .join('p_patients AS pp', 'pp.id', 'vcl.patient_id')
      .join('b_hospitals AS bh', 'bh.id', 'pp.hospital_id')
      .leftJoin('b_gcs as bg', 'bg.id', 'vcl.gcs_id')
      .where('vcl.entry_date', date)
    // .groupBy('pp.hospital_id', )
  }

  getBad(db: Knex) {
    return db('views_bed_hospitals AS vbh')
  }

  getMedicals(db: Knex) {
    return db('views_requisition_hospitals AS vrh')
  }

  getProfessional(db: Knex) {
    return db('views_professional_hospitals AS vph')
  }

  getSupplies(db: Knex, date) {
    const sql = db('wm_supplies_details as sd')
      .select('sd.id AS id', 'sd.wm_supplie_id AS wm_supplie_id', 'sd.generic_id AS generic_id',
        'sd.qty AS qty', 'sd.month_usage_qty AS month_usage_qty', 's.hospital_id AS hospital_id')
      .join('wm_supplies as s', 's.id', 'sd.wm_supplie_id')
    if (date) {
      sql.where('s.date', date)
    }
    return sql;
  }

  getHospital(db: Knex) {
    return db('b_hospitals AS bh')
      .whereIn('bh.hosptype_code', ['01', '05', '06', '07', '11', '12'])
  }

  getHospitalByType(db: Knex) {
    return db('b_hospitals AS bh')
      .join('views_hospital_types as vht', 'vht.hospcode', 'bh.hospcode')
      .where('vht.type', 'B')
  }

  getHospitalDrugs(db: Knex) {
    return db('b_hospitals AS bh')
      .whereIn('bh.hosptype_code', ['01', '05', '06', '07', '11', '15'])
  }

  getProvince(db: Knex, zoneCode = null, provinceCode = null) {
    const sql = db('b_province')
    if (zoneCode) {
      sql.where('zone_code', zoneCode)
    }
    if (provinceCode) {
      sql.where('code', provinceCode)
    }
    return sql;
  }

  getZoneHospital(db: Knex, zoneCode) {
    return db('b_hospitals as h')
      .count('p.id as count')
      .select('h.id as hospital_id', 'h.hospname', 'h.hospcode', 'h.province_name', 'p.id as patient_id')
      .join('p_patients as p', 'p.hospital_id', 'h.id')
      .join('view_case_lasted as pc', 'pc.covid_case_id', 'p.id')
      .join('p_covid_cases as c', 'c.patient_id', 'p.id')
      .where('h.zone_code', zoneCode)
      // .where('c.status', 'ADMIT')
      .groupBy('h.id')
      .orderBy('h.province_name')
  }

  getCovidCase(db: Knex) {
    return db('p_covid_cases as p')
      .join('p_patients as pp', 'pp.id', 'p.patient_id')
      .join('view_case_lasted as pc', 'pc.covid_case_id', 'p.id')
      .join('b_gcs as g', 'g.id', 'pc.gcs_id')
    // .where('p.status', 'ADMIT')
  }

  getSupplie(db: Knex, date: any, query: any) {
    return db('b_hospitals as h')
      .select('h.hospcode',
        'h.hospname',
        'h.zone_code',
        'h.hosptype_code',
        db.raw(`(select qty from wm_supplies_details as sd 
    join b_generics as g on g.id = sd.generic_id where sd.wm_supplie_id = s.id and g.id = 17) as surgical_mask`),
        db.raw(`(select qty from wm_supplies_details as sd 
    join b_generics as g on g.id = sd.generic_id where sd.wm_supplie_id = s.id and g.id = 12) as N95`),
        db.raw(`(select qty from wm_supplies_details as sd 
    join b_generics as g on g.id = sd.generic_id where sd.wm_supplie_id = s.id and g.id = 10) as cover_all_1`),
        db.raw(`(select qty from wm_supplies_details as sd 
    join b_generics as g on g.id = sd.generic_id where sd.wm_supplie_id = s.id and g.id = 11) as cover_all_2`),
        db.raw(`(select qty from wm_supplies_details as sd 
    join b_generics as g on g.id = sd.generic_id where sd.wm_supplie_id = s.id and g.id = 13) as shoe_cover`),
        db.raw(`(select qty from wm_supplies_details as sd 
    join b_generics as g on g.id = sd.generic_id where sd.wm_supplie_id = s.id and g.id = 14) as surgical_hood`),
        db.raw(`(select qty from wm_supplies_details as sd 
    join b_generics as g on g.id = sd.generic_id where sd.wm_supplie_id = s.id and g.id = 15) as long_glove`),
        db.raw(`(select qty from wm_supplies_details as sd 
    join b_generics as g on g.id = sd.generic_id where sd.wm_supplie_id = s.id and g.id = 16) as face_shield`)
      )
      .leftJoin('wm_supplies as s', (v) => {
        v.on('h.id', 's.hospital_id')
        v.on('s.date', db.raw(`'${date}'`))
      })
      .whereIn('h.hosptype_code', ['01', '02', '05', '06', '07'])
      .where((v) => {
        v.where('h.hospname', 'like', '%' + query + '%')
        v.orWhere('h.hospcode', 'like', '%' + query + '%')
      })
  }

  getSupplieZone(db: Knex, date: any, query: any, zoneCode) {
    return db('b_hospitals as h')
      .select('h.hospcode',
        'h.hospname',
        'h.zone_code',
        'h.hosptype_code',
        db.raw(`(select qty from wm_supplies_details as sd 
                join b_generics as g on g.id = sd.generic_id where sd.wm_supplie_id = s.id and g.id = 17) as surgical_mask`),
        db.raw(`(select qty from wm_supplies_details as sd 
                join b_generics as g on g.id = sd.generic_id where sd.wm_supplie_id = s.id and g.id = 12) as N95`),
        db.raw(`(select qty from wm_supplies_details as sd 
                join b_generics as g on g.id = sd.generic_id where sd.wm_supplie_id = s.id and g.id = 10) as cover_all_1`),
        db.raw(`(select qty from wm_supplies_details as sd 
                join b_generics as g on g.id = sd.generic_id where sd.wm_supplie_id = s.id and g.id = 11) as cover_all_2`),
        db.raw(`(select qty from wm_supplies_details as sd 
                join b_generics as g on g.id = sd.generic_id where sd.wm_supplie_id = s.id and g.id = 13) as shoe_cover`),
        db.raw(`(select qty from wm_supplies_details as sd 
                join b_generics as g on g.id = sd.generic_id where sd.wm_supplie_id = s.id and g.id = 14) as surgical_hood`),
        db.raw(`(select qty from wm_supplies_details as sd 
                join b_generics as g on g.id = sd.generic_id where sd.wm_supplie_id = s.id and g.id = 15) as long_glove`),
        db.raw(`(select qty from wm_supplies_details as sd 
                join b_generics as g on g.id = sd.generic_id where sd.wm_supplie_id = s.id and g.id = 16) as face_shield`)
      )
      .leftJoin('wm_supplies as s', (v) => {
        v.on('h.id', 's.hospital_id')
        v.on('s.date', db.raw(`'${date}'`))
      })
      .whereIn('h.hosptype_code', ['01', '02', '05', '06', '07'])
      .where('h.zone_code', zoneCode)
      .where((v) => {
        v.where('h.hospname', 'like', '%' + query + '%')
        v.orWhere('h.hospcode', 'like', '%' + query + '%')
      })
  }

  getTotalSupplie(db: Knex, type) {
    return db.raw(`SELECT
        g.id,
        CONCAT( g.name, ' (', u.name, ')' ) AS supplies,
        ( SELECT sum( v.qty ) AS sum FROM b_hospitals h JOIN views_supplies_hospitals v ON v.hospital_id = h.id WHERE h.zone_code = '01' AND v.generic_id = g.id GROUP BY h.zone_code ) AS zone1,
        ( SELECT sum( v.qty ) AS sum FROM b_hospitals h JOIN views_supplies_hospitals v ON v.hospital_id = h.id WHERE h.zone_code = '02' AND v.generic_id = g.id GROUP BY h.zone_code ) AS zone2,
        ( SELECT sum( v.qty ) AS sum FROM b_hospitals h JOIN views_supplies_hospitals v ON v.hospital_id = h.id WHERE h.zone_code = '03' AND v.generic_id = g.id GROUP BY h.zone_code ) AS zone3,
        ( SELECT sum( v.qty ) AS sum FROM b_hospitals h JOIN views_supplies_hospitals v ON v.hospital_id = h.id WHERE h.zone_code = '04' AND v.generic_id = g.id GROUP BY h.zone_code ) AS zone4,
        ( SELECT sum( v.qty ) AS sum FROM b_hospitals h JOIN views_supplies_hospitals v ON v.hospital_id = h.id WHERE h.zone_code = '05' AND v.generic_id = g.id GROUP BY h.zone_code ) AS zone5,
        ( SELECT sum( v.qty ) AS sum FROM b_hospitals h JOIN views_supplies_hospitals v ON v.hospital_id = h.id WHERE h.zone_code = '06' AND v.generic_id = g.id GROUP BY h.zone_code ) AS zone6,
        ( SELECT sum( v.qty ) AS sum FROM b_hospitals h JOIN views_supplies_hospitals v ON v.hospital_id = h.id WHERE h.zone_code = '07' AND v.generic_id = g.id GROUP BY h.zone_code ) AS zone7,
        ( SELECT sum( v.qty ) AS sum FROM b_hospitals h JOIN views_supplies_hospitals v ON v.hospital_id = h.id WHERE h.zone_code = '08' AND v.generic_id = g.id GROUP BY h.zone_code ) AS zone8,
        ( SELECT sum( v.qty ) AS sum FROM b_hospitals h JOIN views_supplies_hospitals v ON v.hospital_id = h.id WHERE h.zone_code = '09' AND v.generic_id = g.id GROUP BY h.zone_code ) AS zone9,
        ( SELECT sum( v.qty ) AS sum FROM b_hospitals h JOIN views_supplies_hospitals v ON v.hospital_id = h.id WHERE h.zone_code = '10' AND v.generic_id = g.id GROUP BY h.zone_code ) AS zone10,
        ( SELECT sum( v.qty ) AS sum FROM b_hospitals h JOIN views_supplies_hospitals v ON v.hospital_id = h.id WHERE h.zone_code = '11' AND v.generic_id = g.id GROUP BY h.zone_code ) AS zone11,
        ( SELECT sum( v.qty ) AS sum FROM b_hospitals h JOIN views_supplies_hospitals v ON v.hospital_id = h.id WHERE h.zone_code = '12' AND v.generic_id = g.id GROUP BY h.zone_code ) AS zone12,
        ( SELECT sum( v.qty ) AS sum FROM b_hospitals h JOIN views_supplies_hospitals v ON v.hospital_id = h.id WHERE h.zone_code = '13' AND v.generic_id = g.id GROUP BY h.zone_code ) AS zone13,
        ( SELECT sum( v.qty ) AS sum FROM b_hospitals h JOIN views_supplies_hospitals v ON v.hospital_id = h.id WHERE  v.generic_id = g.id GROUP BY g.id ) AS total
    FROM
        b_generics g
        JOIN b_units u ON u.id = g.unit_id
    WHERE
        g.type = '${type}'
        AND g.is_actived = 'Y'`);
  }

  getZone(db: Knex, query, zone) {
    return db('b_hospitals')
      .select('zone_code')
      .where('hospname', 'like', '%' + query + '%')
      .where('zone_code', 'like', '%' + zone + '%')
      .whereNot('zone_code', null)
      .whereNot('zone_code', '-')
      .groupBy('zone_code')
      .orderBy('zone_code')
  }

  getGenerics(db: Knex, type) {
    return db('b_generics as g')
      .where('g.is_actived', 'Y')
      .where('g.type', type);
  }

  getProvinceByZone(db: Knex, zone) {
    return db('b_hospitals as h')
      .select('h.province_code', 'h.province_name')
      .where('h.zone_code', zone)
      .groupBy('h.province_code');
  }

  getSumByProvince(db: Knex, provinceCode, genericId) {
    return db('b_hospitals as h')
      .sum('vs.qty as sum')
      .join('views_supplies_hospitals as vs', 'vs.hospital_id', 'h.id')
      .where('h.province_code', provinceCode)
      .where('vs.generic_id', genericId)
      .groupBy('h.province_code');
  }

  sumGcsProvince(db: Knex, provinceCode, date) {
    return db('views_case_dates AS vcl')
      .sum('* as sum')
      .select('vcl.gcs_id', 'bg.name as gcs_name')
      .join('p_patients AS pp', 'pp.id', 'vcl.patient_id')
      .join('b_hospitals AS bh', 'bh.id', 'pp.hospital_id')
      .join('b_gcs as bg', 'bg.id', 'vcl.gcs_id')
      .where('vcl.entry_date', date)
      .where('bh.code', provinceCode)
      .groupBy('vcl.gcs_id')
  }

  beds(db: Knex, date, provinceCode) {
    return db('views_bed_hospital_cross as vc')
      .leftJoin('views_bed_hospital_date_cross AS vb', (v) => {
        v.on('vc.hospital_id ', 'vb.hospital_id')
          .on('vb.entry_date', db.raw(`${date}`))
      })
      .join('b_hospitals as vh', 'vh.id', 'vc.hospital_id')
      .whereIn('vh.hosptype_code', ['01', '02', '05', '06', '07', '11', '12'])
      .where('vh.province_code', provinceCode)
      .orderBy('vh.province_code')
  }

  provinceCaseDate(db: Knex, date) {
    return db('b_province as p')
      .select('p.code as province_code', 'p.name_th as province_name', 'h.zone_code')
      .sum('v.severe as severe')
      .sum('v.mild as mild')
      .sum('v.moderate as moderate')
      .sum('v.asymptomatic as asymptomatic')
      .leftJoin('b_hospitals as h', 'h.province_code', 'p.code')
      .leftJoin('views_case_hospital_date_cross as v', (v) => {
        v.on('v.hospital_id', 'h.id')
        v.on('v.entry_date', db.raw(`'${date}'`))
        v.on('v.status', db.raw(`'ADMIT'`))
      })
      .groupBy('p.code')
      .orderBy('h.zone_code')
      .orderBy('p.code');
      
  }
}