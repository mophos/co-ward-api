import Knex = require('knex');
import * as moment from 'moment';

export class ReportModel {

  getHospital(db: Knex, province) {
    return db('view_case_lasted AS vcl')
      .count('* as count')
      .select('vcl.gcs_id', 'bg.name as gcs_name', 'pp.hospital_id', 'bh.hospcode', 'bh.hospname')
      .join('p_patients AS pp', 'pp.id', 'vcl.patient_id')
      .join('b_hospitals AS bh', 'bh.id', 'pp.hospital_id')
      .join('b_gcs as bg', 'bg.id', 'vcl.gcs_id')
      .where('bh.province_code', province)
      .groupBy('bh.id', 'vcl.gcs_id')
  }

  getProvince(db: Knex, zoneCode) {
    return db('b_province')
      .where('zone_code', zoneCode)
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
}