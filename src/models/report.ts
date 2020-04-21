import Knex = require('knex');
import * as moment from 'moment';

export class ReportModel {
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

  getSupplie(db: Knex, date: any, query: any) {
    return db('b_hospitals as h')
      .select('h.hospcode',
        'h.hospname',
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
}