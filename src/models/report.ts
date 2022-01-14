import Knex = require('knex');
import * as moment from 'moment';
import { join } from 'bluebird';
var request = require("request");

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
      .sum('v.sum as countCase')
      .join('b_hospitals as h', 'h.id', 'v.hospital_id')
      .where('v.entry_date', date)
      .where('v.status', 'ADMIT')
      .groupBy('h.id')
      .orderBy('h.zone_code')
      .orderBy('h.province_code');
  }
  getHeadGcs(db: Knex, date, provinces) {
    return db('temp_views_case_hospital_date_cross as v')
      .select('h.province_code', 'h.province_name', 'h.zone_code', 'h.hospcode', 'h.hospname', 'h.id as hospital_id')
      .sum('severe as severe')
      .sum('mild as mild')
      .sum('moderate as moderate')
      .sum('asymptomatic as asymptomatic')
      .sum('ip_pui as ip_pui')
      .count('* as count')
      .sum('v.sum as countCase')
      .join('b_hospitals as h', 'h.id', 'v.hospital_id')
      .where('v.entry_date', date)
      .where('v.status', 'ADMIT')
      .whereIn('h.province_code', provinces)
      .groupBy('h.id')
      .orderBy('h.zone_code')
      .orderBy('h.province_code');
  }

  getGcs(db: Knex, date) {
    return db('temp_views_case_dates AS vcl')
      // .select('vcl.gcs_id', 'bg.name as gcs_name', 'pp.hospital_id', 'pp.hn', 'p.an', 'vcl.date_admit', 'vcl.status')
      // .join('p_covid_cases as p', 'p.id', 'vcl.covid_case_id')
      // .join('p_patients AS pp', 'pp.id', 'vcl.patient_id')
      // .join('b_hospitals AS bh', 'bh.id', 'pp.hospital_id')
      // .leftJoin('b_gcs as bg', 'bg.id', 'vcl.gcs_id')
      .where('vcl.entry_date', date)
      .where('vcl.status', 'ADMIT');
    // .groupBy('pp.hospital_id', )
  }

  getBad(db: Knex) {
    return db('views_bed_hospitals AS vbh');
  }

  getBed(db: Knex, provinceCode) {
    const last = db('views_covid_case')
      .max('updated_entry as updated_entry')
      .whereRaw('hospital_id=vc.hospital_id')
      .whereNotNull('updated_entry')
      .as('updated_entry');

    let sub = db('b_hospitals as vh')
      .select('vh.id as hospital_id', 'vh.hospname', 'bs.name as sub_ministry_name', db.raw(`
      sum( bed_id  =1 ) as aiir_usage_qty,
      sum( bed_id = 2 ) as modified_aiir_usage_qty,
      sum( bed_id = 3 ) as isolate_usage_qty,
      sum( bed_id = 4 ) as cohort_usage_qty,
      sum( bed_id = 5 ) AS hospitel_usage_qty`), last)
      .leftJoin('temp_views_covid_case_last as vc', (v) => {
        v.on('vh.id', 'vc.hospital_id')
        v.on('vc.status', db.raw(`'ADMIT'`))
      })
      .join('b_hospital_subministry as bs', 'bs.code', 'vh.sub_ministry_code')
      .where('vh.province_code', provinceCode)
      .whereIn('vh.hosptype_code', ['05', '06', '07', '11', '12', '15'])
      .groupBy('vh.id')
      .as('sub');

    let sql =
      db('b_hospitals  as vh')
        .select('vb.*', 'sub.*', 'vh.hospname', 'bs.name as sub_ministry_name')
        .leftJoin('views_bed_hospital_cross as vb', 'vh.id', 'vb.hospital_id')
        .leftJoin(sub, 'sub.hospital_id', 'vh.id')
        .join('b_hospital_subministry as bs', 'bs.code', 'vh.sub_ministry_code')
        .where('vh.province_code', provinceCode)
        .whereIn('vh.hosptype_code', ['05', '06', '07', '11', '12', '15'])
        .orderBy('bs.name')
        .orderBy('vh.hospname');

    // console.log(sql.toString());

    return sql;
    // return db('views_bed_hospitals AS vbh')
  }

  getUseBed(db: Knex) {
    let sql = db('temp_report_bed as t')
      .select('t.*', 'h.level', 'h.hospital_type')
      .join('b_hospitals as h', 'h.id', 't.hospital_id')
      .where('h.is_deleted', 'N')
    return sql;
    // return db('views_bed_hospitals AS vbh')
  }

  getBadExcel(db: Knex, date) {
    return db('views_bed_hospital_cross as vc')
      .leftJoin('views_bed_hospital_date_cross AS vb', (v) => {
        v.on('vc.hospital_id ', 'vb.hospital_id')
          .on('vb.entry_date', db.raw(`${date}`))
      })
      .join('b_hospitals as vh', 'vh.id', 'vc.hospital_id')
      // .whereIn('vh.hosptype_code', ['01', '02', '05', '06', '07', '11', '12'])
      // .where('vh.province_code', provinceCode)
      .orderBy('vh.province_code');
  }

  getMedicals(db: Knex) {
    return db('temp_views_medical_supplies_hospital_cross AS vrh')
      .join('b_hospitals as vh', 'vh.id', 'vrh.hospital_id')
      .orderBy('vh.province_code');
  }

  getMedicalCross(db: Knex) {
    return db('temp_views_requisition_hospital_cross');
  }

  getProfessional(db: Knex) {
    return db('views_professional_hospitals AS vph');
  }

  getProfessionalCross(db: Knex) {
    return db('view_professional_hospital_cross');
  }

  getSupplies(db: Knex, date, provinceCode, zoneCode: any[]) {
    const supplies = db('temp_views_supplies_hospital_date_cross as ws')
      .join('b_hospitals as h', 'h.id', 'ws.hospital_id')
      .max('ws.entry_date as entry_date')
      .select('ws.hospital_id')
      .groupBy('ws.hospital_id')
      .where('ws.entry_date', '<=', date)
      .as('supplies');
    if (zoneCode.length) {
      supplies.whereIn('h.zone_code', zoneCode);
    }
    if (provinceCode) {
      supplies.where('h.province_code', provinceCode);
    }


    const sql = db('b_hospitals as h')
      .select('sd.*', 'h.hospname', 'h.province_code', 'h.province_name', 'h.zone_code')
      .leftJoin(supplies, (v) => {
        v.on('supplies.hospital_id', 'h.id')
        // v.on('supplies.entry_date', 'ws.entry_date')
      })
      .leftJoin('temp_views_supplies_hospital_date_cross as sd', (v) => {
        v.on('sd.hospital_id', 'supplies.hospital_id')
        v.on('sd.entry_date', 'supplies.entry_date')
      })

      .whereIn('h.hosptype_code', ['01', '05', '06', '07', '11', '12', '15', '19']);
    if (zoneCode.length) {
      sql.whereIn('h.zone_code', zoneCode);
    }
    if (provinceCode) {
      sql.where('h.province_code', provinceCode);
    }
    sql.orderBy('h.zone_code')
      .orderBy('h.province_code')
      .orderBy('h.hospcode');
    // console.log(sql.toString());

    return sql;
  }

  getHospital(db: Knex) {
    return db('b_hospitals AS bh')
      .whereIn('bh.hosptype_code', ['01', '05', '06', '07', '11', '12']);
  }

  getHospitalAll(db: Knex) {
    return db('b_hospitals AS bh');
    // .whereIn('bh.hosptype_code', ['01', '05', '06', '07', '11', '12'])
  }

  getHospitalByType(db: Knex) {
    return db('b_hospitals AS bh')
      .join('views_hospital_types as vht', 'vht.hospcode', 'bh.hospcode')
      .where('vht.type', 'B');
  }

  getHospitalDrugs(db: Knex) {
    return db('b_hospitals AS bh')
      .whereIn('bh.hosptype_code', ['01', '05', '06', '07', '11', '15']);
  }

  getProvince(db: Knex, zoneCode = null, provinceCode = null) {
    const sql = db('b_province');
    if (zoneCode) {
      sql.where('zone_code', zoneCode);
    }
    if (provinceCode) {
      sql.where('code', provinceCode);
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
      .orderBy('h.province_name');
  }

  getCovidCase(db: Knex) {
    return db('p_covid_cases as p')
      .join('p_patients as pp', 'pp.id', 'p.patient_id')
      .join('view_case_lasted as pc', 'pc.covid_case_id', 'p.id')
      .join('b_gcs as g', 'g.id', 'pc.gcs_id');
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
      });
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
      });
  }

  getTotalSupplie(db: Knex, type) {
    return db.raw(`SELECT h.zone_code,sum(surgical_gown_qty) as surgical_gown_qty,
    sum(cover_all1_qty) as cover_all1_qty,
    sum(cover_all2_qty) as cover_all2_qty,
    sum(n95_qty) as n95_qty,
    sum(shoe_cover_qty) as shoe_cover_qty,
    sum(surgical_hood_qty) as surgical_hood_qty,
    sum(long_glove_qty) as long_glove_qty,
    sum(face_shield_qty) as face_shield_qty,
    sum(surgical_mask_qty) as surgical_mask_qty,
    sum(powered_air_qty) as powered_air_qty,
    sum(alcohol_70_qty) as alcohol_70_qty,
    sum(alcohol_95_qty) as alcohol_95_qty,
    sum(alcohol_gel_qty) as alcohol_gel_qty,
    sum(disposable_glove_qty) as disposable_glove_qty,
    sum(isolation_gown_qty) as isolation_gown_qty,
    sum(leg_cover_qty) as leg_cover_qty,
    sum(disposable_cap_qty) as disposable_cap_qty
    from views_supplies_hospital_cross as v 
    join b_hospitals as h on h.id = v.hospital_id
    GROUP BY h.zone_code
    order by h.zone_code asc`
    );
  }

  getZone(db: Knex, query, zone) {
    return db('b_hospitals')
      .select('zone_code')
      .where('hospname', 'like', '%' + query + '%')
      .where('zone_code', 'like', '%' + zone + '%')
      .whereNot('zone_code', null)
      .whereNot('zone_code', '-')
      .groupBy('zone_code')
      .orderBy('zone_code');
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
      .groupBy('vcl.gcs_id');
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
      .orderBy('vh.province_code');
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
        v.on('v.hospital_id', 'h.id');
        v.on('v.entry_date', db.raw(`'${date}'`));
        v.on('v.status', db.raw(`'ADMIT'`));
      })
      .groupBy('p.code')
      .orderBy('h.zone_code')
      .orderBy('p.code');
  }

  admitConfirmCase(db: Knex, showPersons = false, limit = 1000, offset = 0) {
    let sql = db('temp_report_admit_comfirm_case')
      .select('d1', 'd2', 'd3', 'd4', 'd5', 'd7', 'd8','d26','d27', 'hn', 'an', 'hospital_id', 'updated_entry_last', 'days',
        'hospname', 'hospcode', 'zone_code', 'province_name', 'date_admit', 'gcs_name', 'bed_name', 'medical_supplies_name',
        'first_name', 'last_name', 'cid', 'sat_id', 'timestamp'
      );
    if (showPersons) {
      sql.select('first_name', 'last_name', 'cid', 'sat_id', 'sex', 'age');
    }
    sql.limit(limit);
    sql.offset(offset)
      .orderBy('zone_code')
      .orderBy('province_name')
      .orderBy('hospname');
    return sql;
  }

  admitConfirmCaseSummaryExport(db: Knex) {
    const sql = db('temp_report_admit_comfirm_case')
      .select(db.raw(`zone_code as 'เขต',
      province_name as 'จังหวัด',
      hospname as 'โรงพยาบาล',
      hn as 'HN',
      an as 'AN',
      cid as 'CID',
      first_name as 'ชื่อ',
      last_name as 'นามสกุล',
      sat_id as 'SAT ID',
      sex as 'เพศ',
      age as 'อายุ',
      DATE_FORMAT(date_admit , '%Y-%m-%d') as 'วันที่ ADMIT',
      gcs_name as 'ความรุนแรง',
      bed_name as 'เตียง',
      medical_supplies_name as 'เครื่องช่วยหายใจ',
      IFNULL(DATE_FORMAT(updated_entry_last , '%Y-%m-%d') ,'') as 'วันที่บันทึกล่าสุด',
      days as 'ไม่ได้บันทึกมา',
      CASE WHEN d3 > 0 THEN '/' ELSE '' END as 'Darunavir 600 mg.',
      CASE WHEN d4 > 0 THEN '/' ELSE '' END as 'Lopinavir 200 mg./Ritonavir 50 mg.',
      CASE WHEN d5 > 0 THEN '/' ELSE '' END as 'Ritonavir 100 mg.',
      CASE WHEN d7 > 0 THEN '/' ELSE '' END as 'Azithromycin 250 mg.',
      CASE WHEN d8 > 0 THEN '/' ELSE '' END as 'Favipiravi'`)
      )
      .orderBy('zone_code')
      .orderBy('province_name')
      .orderBy('hospname');
    return sql;
  }

  admitConfirmCaseDms(db: Knex, showPersons = false, limit = 1000, offset = 0) {
    let sql = db('temp_report_admit_comfirm_case_dms as c')
      .select('c.d1', 'c.d2', 'c.d3', 'c.d4', 'c.d5', 'c.d7', 'c.d8', 'c.hn', 'c.an', 'c.hospital_id', 'c.updated_entry_last', 'c.days',
        'c.hospname', 'c.hospcode', 'c.zone_code', 'c.province_name', 'c.date_admit', 'c.gcs_name', 'c.bed_name', 'c.medical_supplies_name',
        'first_name', 'c.last_name', 'c.cid', 'c.sat_id', 'c.timestamp'
      );
    if (showPersons) {
      sql.select('c.first_name', 'c.last_name', 'c.cid', 'c.sat_id', 'c.sex', 'c.age');
    }
    sql.join('views_hospital_dms as v', 'v.hospcode', 'c.hospcode')
    sql.whereIn('c.zone_code', ['04', '06', '13'])
    sql.limit(limit);
    sql.offset(offset)
      .orderBy('c.zone_code')
      .orderBy('c.province_name')
      .orderBy('c.hospname');
    console.log(sql.toString());

    return sql;
  }

  admitConfirmCaseTotal(db: Knex) {
    let sql = db('temp_report_admit_comfirm_case')
      .count('* as total');
    return sql;
  }

  admitPuiCase(db: Knex, showPersons = false, limit = 1000, offset = 0) {
    // const last = db('p_covid_case_details')
    let sql = db('temp_report_admit_pui_case')
      .select('d1', 'd2', 'd3', 'd4', 'd5', 'd7', 'd8','d26','d27', 'hn', 'an', 'hospital_id', 'updated_entry_last', 'days',
        'hospname', 'hospcode', 'zone_code', 'province_name', 'date_admit', 'gcs_name', 'bed_name', 'medical_supplies_name',
        'first_name', 'last_name', 'cid', 'sat_id', 'timestamp'
      );
    if (showPersons) {
      sql.select('first_name', 'last_name', 'cid', 'sat_id');
    }
    sql.limit(limit);
    sql.offset(offset);
    // console.log(sql.toString());
    return sql;
  }

  admitPuiCaseDms(db: Knex, showPersons = false, limit = 1000, offset = 0) {
    // const last = db('p_covid_case_details')
    let sql = db('temp_report_admit_pui_case_dms as c')
      .select('c.d1', 'c.d2', 'c.d3', 'c.d4', 'c.d5', 'c.d7', 'c.d8', 'c.hn', 'c.an', 'c.hospital_id', 'c.updated_entry_last', 'c.days',
        'c.hospname', 'c.hospcode', 'c.zone_code', 'c.province_name', 'c.date_admit', 'c.gcs_name', 'c.bed_name', 'c.medical_supplies_name',
        'first_name', 'c.last_name', 'c.cid', 'c.sat_id', 'c.timestamp'
      );
    if (showPersons) {
      sql.select('c.first_name', 'c.last_name', 'c.cid', 'c.sat_id');
    }
    sql.join('views_hospital_dms as v', 'v.hospcode', 'c.hospcode')
    sql.whereIn('c.zone_code', ['04', '06', '13'])
    sql.limit(limit);
    sql.offset(offset);
    // console.log(sql.toString());
    return sql;
  }

  admitPuiCaseTotal(db: Knex) {
    let sql = db('temp_report_admit_pui_case')
      .count('* as total');
    return sql;
  }

  admitPuiCaseByProvince(db: Knex, province: any) {
    // const last = db('p_covid_case_details')
    let sql = db('temp_report_admit_pui_case as c')
      .select('c.d1', 'c.d2', 'c.d3', 'c.d4', 'c.d5', 'c.d7', 'c.d8','d26','d27', 'c.hn', 'c.an', 'c.hospital_id', 'c.updated_entry_last', 'c.days',
        'c.hospname', 'c.hospcode', 'c.zone_code', 'c.province_name', 'c.date_admit', 'c.gcs_name', 'c.bed_name', 'c.medical_supplies_name',
        'c.first_name', 'c.last_name', 'c.cid', 'c.sat_id', 'c.timestamp'
      );
    sql.join('b_hospitals as h', 'h.id', 'c.hospital_id');
    sql.whereIn('h.province_code', province);
    sql.orderBy('h.province_name');
    console.log(sql.toString());
    return sql;
  }

  sumAdmitPuiCaseByProvince(db: Knex, province) {
    let sql = `SELECT
    sum( ( du.d1 IS NOT NULL ) AND ( du.d1 > 0 ) ) AS d1,
    sum( ( du.d2 IS NOT NULL ) AND ( du.d2 > 0 ) ) AS d2,
    sum( ( du.d3 IS NOT NULL ) AND ( du.d3 > 0 ) ) AS d3,
    sum( ( du.d4 IS NOT NULL ) AND ( du.d4 > 0 ) ) AS d4,
    sum( ( du.d5 IS NOT NULL ) AND ( du.d5 > 0 ) ) AS d5,
    sum( ( du.d7 IS NOT NULL ) AND ( du.d7 > 0 ) ) AS d7,
    sum( ( du.d8 IS NOT NULL ) AND ( du.d8 > 0 ) ) AS d8,
    sum( ( du.d26 IS NOT NULL ) AND ( du.d26 > 0 ) ) AS d26,
    sum( ( du.d27 IS NOT NULL ) AND ( du.d27 > 0 ) ) AS d27,
    h.zone_code,
    sum( cl.gcs_id IN ( 5 ) ) AS pui,
    sum( cl.bed_id = 1 ) AS aiir,
    sum( cl.bed_id = 2 ) AS modified_aiir,
    sum( cl.bed_id = 3 ) AS isolate,
    sum( cl.bed_id = 4 ) AS cohort,
    sum( cl.bed_id = 5 ) AS hospitel,
    
    sum( cl.bed_id = 8 ) AS community_isolation,
    sum( cl.bed_id = 9 ) AS home_isolation,
    sum( cl.bed_id = 10 ) AS lv0,
    sum( cl.bed_id = 11 ) AS lv1,
    sum( cl.bed_id = 12 ) AS lv21,
    sum( cl.bed_id = 13 ) AS lv22,
    sum( cl.bed_id = 14 ) AS lv3,
    sum( cl.medical_supplie_id = 1 ) AS invasive,
    sum( cl.medical_supplie_id = 2 ) AS noninvasive,
    sum( cl.medical_supplie_id = 3 ) AS high_flow ,
    now() as timestamp
  FROM
    views_covid_case_last AS cl
    INNER JOIN p_covid_cases AS c ON c.id = cl.covid_case_id
    INNER JOIN p_patients AS pt ON pt.id = c.patient_id
    INNER JOIN b_hospitals AS h ON h.id = pt.hospital_id
    LEFT JOIN (
    SELECT
      i.covid_case_detail_id,
      sum( IF ( i.generic_id = 1, i.qty, 0 ) ) AS 'd1',
      sum( IF ( i.generic_id = 2, i.qty, 0 ) ) AS 'd2',
      sum( IF ( i.generic_id = 3, i.qty, 0 ) ) AS 'd3',
      sum( IF ( i.generic_id = 4, i.qty, 0 ) ) AS 'd4',
      sum( IF ( i.generic_id = 5, i.qty, 0 ) ) AS 'd5',
      sum( IF ( i.generic_id = 7, i.qty, 0 ) ) AS 'd7',
      sum( IF ( i.generic_id = 8, i.qty, 0 ) ) AS 'd8', 
      sum( IF ( i.generic_id = 26, i.qty, 0 ) ) AS 'd26', 
      sum( IF ( i.generic_id = 27, i.qty, 0 ) ) AS 'd27' 
    FROM
      p_covid_case_detail_items AS i
      INNER JOIN view_covid_case_last AS l ON l.id = i.covid_case_detail_id 
    GROUP BY
      i.covid_case_detail_id 
    ) AS du ON du.covid_case_detail_id = cl.id 
  WHERE
    cl.status = 'ADMIT' 
    AND gcs_id IN ( 5 )
    AND province_code IN (?)
  GROUP BY
    h.province_code 
  ORDER BY
    h.zone_code ASC,
    h.province_code ASC;`;
    return db.raw(sql, [province]);
  }

  admitConfirmCaseProvice(db: Knex, zoneCode, provinceCode = null, showPersons = false) {
    const subCioCheck = db('p_cio_check_confirm').groupBy('covid_case_detail_id').max('id as id');
    const cioCheck = db('p_cio_check_confirm as ci').whereIn('ci.id', subCioCheck).as('cc');

    let sql = db('temp_report_admit_comfirm_case as t')
      .select('t.d1', 't.d2', 't.d3', 't.d4', 't.d5', 't.d7', 't.d8','t.d26','t.d27', 't.hn', 't.an', 't.hospital_id', 't.updated_entry_last', 't.days',
        't.hospname', 't.hospcode', 't.zone_code', 't.province_name', 't.date_admit', 't.gcs_name', 't.bed_name', 't.medical_supplies_name',
        'first_name', 't.last_name', 't.cid', 't.sat_id', 't.timestamp', 't.sex', 't.age'
      )
      .leftJoin(cioCheck, 'cc.covid_case_detail_id', 't.covid_case_detail_id')
      .join('b_hospitals as h', 'h.id', 't.hospital_id')
      // .where('t.status', 'ADMIT')
      .where('t.zone_code', zoneCode)
      .whereIn('t.gcs_id', [1, 2, 3, 4])
      .orderBy('h.province_code')
      .orderBy('t.hospname')
      .orderBy('t.covid_case_id');
    if (showPersons) {
      sql.select('t.first_name', 't.last_name', 't.cid', 't.sat_id');
    }

    if (provinceCode) {
      sql.where('h.province_code', provinceCode);
    }    
    return sql;
  }

  checkAdmitConfirmCase(db: Knex, data) {
    return db('p_cio_check_confirm')
      .insert(data);
  }
  admitConfirmCaseSummary(db: Knex) {
    let sql = db('temp_report_admit_comfirm_case_summary');
    return sql;
  }

  admitConfirmCaseSummaryExcel(db: Knex) {
    const sql = db('temp_report_admit_comfirm_case_summary')
    .select(db.raw(`IFNULL(zone_code, 0) as 'เขต',IFNULL(confirm, 0) as 'รวม',IFNULL(severe, 0) as 'Severe',IFNULL(moderate, 0) as 'moderate',IFNULL(mild, 0) as 'mild',IFNULL(asymptomatic, 0) as 'asymptomatic',IFNULL(aiir, 0) as 'aiir',IFNULL(modified_aiir, 0) as 'modified_aiir',IFNULL(isolate, 0) as 'isolate',IFNULL(cohort, 0) as 'cohort',IFNULL(cohort_icu, 0) as 'cohort_icu',IFNULL(hospitel, 0) as 'Hospitel',IFNULL(invasive, 0) as 'invasive',IFNULL(noninvasive, 0) as 'noninvasive',IFNULL(high_flow, 0) as 'high_flow',IFNULL(d3, 0) as 'Darunavir 600 mg.',IFNULL(d4, 0) as 'Lopinavir 200 mg./Ritonavir 50 mg.',IFNULL(d5, 0) as 'Ritonavir 100 mg.',IFNULL(d7, 0) as 'Azithromycin 250 mg.',IFNULL(d8, 0) as 'Favipiravi(คน)'`))
    return sql;
  }


  admitConfirmCaseSummaryDms(db: Knex) {
    let sql = db('temp_report_admit_comfirm_case_summary_dms').whereIn('zone_code', ['04', '06', '13']);
    return sql;
  }
  admitPuiCaseSummary(db: Knex) {
    let sql = db('temp_report_admit_pui_case_summary');
    return sql;
  }
  admitPuiCaseSummaryDms(db: Knex) {
    let sql = db('temp_report_admit_pui_case_summary_dms');
    return sql;
  }

  admitConfirmCaseSummaryProvince(db: Knex, zoneCode, provinceCode = null) {
    let sql = db('temp_report_admit_comfirm_case_summary_province as s')
      .where('s.zone_code', zoneCode);
    if (provinceCode) {
      sql.where('s.province_code', provinceCode);
    }
    return sql;
  }

  homework(db: Knex, filter = 'all') {
    const sql = db('views_review_homework as v')
      .select(db.raw(`b.zone_code,
    sum(b.hosptype_code in ('05','06','07','11','12','19','18')) as government,
    sum(b.hosptype_code in ('05','06','07','11','12','19','18') and v.register_last_date is not null) as government_register,
      sum(b.hosptype_code in ('15')) as private,
    sum(b.hosptype_code in ('15') and v.register_last_date is not null) as private_register`))
      .join('b_hospitals as b', 'b.id', 'v.hospital_id')
      .whereIn('b.hosptype_code', ['15', '05', '06', '07', '11', '12', '19', '18'])
      .groupBy('b.zone_code')
      .orderBy('b.zone_code');
    // console.log(sql.toString());

    return sql;
  }

  homeworkDetail(db: Knex, filter = 'all') {
    const sql = db('views_review_homework as v')
      .select('v.*', 'b.hospcode', 'b.hospname', 'bs.name as sub_ministry_name', 'b.zone_code')
      .join('b_hospitals as b', 'b.id', 'v.hospital_id')
      .leftJoin('b_hospital_subministry as bs', 'bs.code', 'b.sub_ministry_code')
      .orderBy('b.zone_code')
      .orderBy('b.province_name')
      .orderBy('bs.name')
      .whereIn('b.hosptype_code', ['15', '05', '06', '07', '11', '12', '19', '18']);
    if (filter == 'register') {
      sql.whereNotNull('register_last_date');
    } else if (filter == 'nonregister') {
      sql.whereNull('register_last_date');
    }
    // console.log(sql.toString());

    return sql;
  }

  getPersonTime(db: Knex) {
    return db('temp_report_records');
  }

  getLocalQuarantine(db: Knex) {
    return db('local_quarantine');
  }

  getCountLocalQuarantine(db: Knex) {
    return db('local_quarantine').count('* as rows');
  }

  insertLocalQuarantine(db: Knex, data) {
    return db('local_quarantine').insert(data);
  }

  insertLocalQuarantineHotel(db: Knex, data) {
    return db('local_quarantine_hotel').insert(data);
  }

  removeLocalQuarantine(db: Knex) {
    return db('local_quarantine').del();
  }

  summaryLocalQuarantineProvince(db: Knex) {
    return db.raw(`SELECT
      l.zone_code,
      l.last_quarantine_province,
      count( * ) AS local_q,
      r.person_total,
      a.admit
    FROM
      local_quarantine l
      LEFT JOIN (
      SELECT
        v.province_code,
        v.zone_code,
        SUM( IF ( ( v.gcs_id IN ( 1, 2, 3, 4 ) AND v.person_id IS NOT NULL ), 1, 0 ) ) AS person,
        SUM( IF ( ( vt.gcs_id IN ( 1, 2, 3, 4 ) ), 1, 0 ) ) AS person_time,
        SUM( IF ( ( v.gcs_id IS NULL AND v.person_id IS NOT NULL ), 1, 0 ) ) AS person_old,
        SUM( IF ( ( vt.gcs_id IS NULL ), 1, 0 ) ) AS person_old_time,
        SUM(
        IF
          (
            ( ( v.gcs_id IN ( 1, 2, 3, 4 ) OR v.gcs_id IS NULL ) AND v.person_id IS NOT NULL ),
            1,
            0 
          ) 
        ) AS person_total,
        SUM( IF ( ( vt.gcs_id IN ( 1, 2, 3, 4 ) OR v.gcs_id IS NULL ), 1, 0 ) ) AS person_time_total,
        SUM( IF ( ( v.STATUS = 'DEATH' ), 1, 0 ) ) AS person_death 
      FROM
        views_case_zone_total_times AS vt
        LEFT JOIN views_case_zone_total_persons AS v ON vt.case_id = v.case_id 
      GROUP BY
        vt.province_code 
      ORDER BY
        vt.zone_code 
      ) AS r ON r.province_code = l.province_code
      LEFT JOIN (
      SELECT
        h.province_code,
        count( * ) AS admit 
      FROM
        p_covid_cases p
        JOIN p_patients pp ON pp.id = p.patient_id
        JOIN b_hospitals h ON h.id = pp.hospital_id 
        JOIN temp_views_covid_case_last v on v.covid_case_id = p.id
      WHERE
        p.status = 'ADMIT' and p.is_deleted = 'N' and v.gcs_id in (1,2,3,4)
      GROUP BY
        h.province_code 
      ) AS a ON a.province_code = l.province_code 
    GROUP BY
      l.province_code 
    ORDER BY
      l.zone_code`);
  }

  summaryLocalQuarantineZone(db: Knex) {
    return db.raw(`SELECT
      l.zone_code,
      count( * ) AS local_q,
      r.person_total,
      a.admit
    FROM
      local_quarantine l
      LEFT JOIN (
      SELECT
        v.zone_code,
        SUM( IF ( ( v.gcs_id IN ( 1, 2, 3, 4 ) AND v.person_id IS NOT NULL ), 1, 0 ) ) AS person,
        SUM( IF ( ( vt.gcs_id IN ( 1, 2, 3, 4 ) ), 1, 0 ) ) AS person_time,
        SUM( IF ( ( v.gcs_id IS NULL AND v.person_id IS NOT NULL ), 1, 0 ) ) AS person_old,
        SUM( IF ( ( vt.gcs_id IS NULL ), 1, 0 ) ) AS person_old_time,
        SUM(
        IF
          (
            ( ( v.gcs_id IN ( 1, 2, 3, 4 ) OR v.gcs_id IS NULL ) AND v.person_id IS NOT NULL ),
            1,
            0 
          ) 
        ) AS person_total,
        SUM( IF ( ( vt.gcs_id IN ( 1, 2, 3, 4 ) OR v.gcs_id IS NULL ), 1, 0 ) ) AS person_time_total,
        SUM( IF ( ( v.STATUS = 'DEATH' ), 1, 0 ) ) AS person_death 
      FROM
        views_case_zone_total_times AS vt
        LEFT JOIN views_case_zone_total_persons AS v ON vt.case_id = v.case_id 
      GROUP BY
        vt.zone_code 
      ORDER BY
        vt.zone_code 
      ) AS r ON r.zone_code = l.zone_code
      LEFT JOIN (
      SELECT
        h.zone_code,
        count( * ) AS admit 
      FROM
        p_covid_cases p
        JOIN p_patients pp ON pp.id = p.patient_id
        JOIN b_hospitals h ON h.id = pp.hospital_id 
        JOIN temp_views_covid_case_last v on v.covid_case_id = p.id
      WHERE
        p.status = 'ADMIT' and p.is_deleted = 'N' and v.gcs_id in (1,2,3,4)
      GROUP BY
        h.zone_code 
      ) AS a ON a.zone_code = l.zone_code 
    GROUP BY
      l.zone_code 
    ORDER BY
      l.zone_code`);
  }

  summaryLocalQuarantineZone2(db: Knex) {
    return db.raw(`SELECT
      a.zone_code,
      SUM( IF ( a.checkin_date BETWEEN '2020-03-01 00:00:00' AND '2020-03-31 23:59:59', 1, 0 ) ) AS m3,
      SUM( IF ( a.checkin_date BETWEEN '2020-04-01 00:00:00' AND '2020-04-31 23:59:59', 1, 0 ) ) AS m4,
      SUM( IF ( a.checkin_date BETWEEN '2020-05-01 00:00:00' AND '2020-05-31 23:59:59', 1, 0 ) ) AS m5,
      SUM( IF ( a.checkin_date BETWEEN '2020-06-01 00:00:00' AND '2020-06-31 23:59:59', 1, 0 ) ) AS m6,
      SUM( IF ( a.checkin_date BETWEEN '2020-07-01 00:00:00' AND '2020-07-31 23:59:59', 1, 0 ) ) AS m7 
    FROM
      local_quarantine AS a 
    GROUP BY
      a.zone_code 
    ORDER BY
      a.zone_code`);
  }

  getLocalQuarantineHotel(db: Knex) {
    return db.raw(`SELECT
      lh.zone_code,
      COUNT( * ) AS qty,
      SUM(lh.total_capacity) AS total_capacity,
      (
        SELECT COUNT(*) FROM local_quarantine WHERE zone_code = lh.zone_code
      ) AS person_qty
    FROM
      local_quarantine_hotel lh 
    GROUP BY
      lh.zone_code 
    ORDER BY
      lh.zone_code`);
  }

  localQuarantineApi() {
    return new Promise((resolve: any, reject: any) => {
      var options = {
        method: 'GET',
        url: 'http://local.thquarantine.cloud/api/external/get-people-details',
        headers: {
          authorization: process.env.QUARANTINE_TOKEN
        }
      };
      request(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }

  localQuarantineHotelApi() {
    return new Promise((resolve: any, reject: any) => {
      var options = {
        method: 'GET',
        url: 'http://local.thquarantine.cloud/api/external/get-hotel',
        headers: {
          authorization: process.env.QUARANTINE_TOKEN
        }
      };
      request(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }

  // summary1(db: Knex,month) {
  //   return db.raw(`
  //   SELECT
  //     count(*),
  //     sum(status!='ADMIT') as discharge,
  //     count(*)-sum(status!='ADMIT') as heal
  //   FROM
  //     p_covid_cases 
  //     where date_admit < '${month}-01'
  //     and case_status = 'COVID'

  //   `);
  // }

  dischargeCase(db: Knex, date, showPersons = false) {
    let sql = db('p_covid_cases as pc')
      .select('pc.*', 'p.hn', 'p.hospital_id', 'p.person_id', 'h.hospcode', 'h.hospname', 'h.zone_code', 'h.province_code', 'h.province_name as p_name', 'rh.hospcode as refer_hospcode', 'rh.hospname as refer_hospname')
      .join('p_patients as p', 'p.id', ' pc.patient_id')
      .join('b_hospitals as h', 'h.id', 'p.hospital_id')
      .join('views_covid_case_last as vl', 'vl.covid_case_id', 'pc.id')
      .leftJoin('b_hospitals as rh', 'rh.id', 'pc.hospital_id_refer')
      .where('pc.is_deleted', 'N')
      .whereIn('pc.status', ['DISCHARGE', 'NEGATIVE', 'DEATH', 'REFER'])
      .whereIn('vl.gcs_id', [1, 2, 3, 4])
      .whereBetween('pc.date_discharge', [`${date} 00:00:00`, `${date} 23:59:00`])
      .orderBy('h.zone_code').orderBy('h.province_name').orderBy('h.hospname');
    if (showPersons) {
      sql.select('p.person_id', 'pp.*', 't.name as title_name')
        .join('p_persons as pp', 'p.person_id', 'pp.id')
        .leftJoin('um_titles as t', 'pp.title_id', 't.id');
    }
    console.log(sql.toString());

    return sql
  }

  dischargeCaseDms(db: Knex, date, showPersons = false) {
    let sql = db('p_covid_cases as pc')
      .select('pc.*', 'p.hn', 'p.hospital_id', 'p.person_id', 'h.hospcode', 'h.hospname', 'h.zone_code', 'h.province_code', 'h.province_name as p_name', 'rh.hospcode as refer_hospcode', 'rh.hospname as refer_hospname')
      .join('p_patients as p', 'p.id', ' pc.patient_id')
      .join('b_hospitals as h', 'h.id', 'p.hospital_id')
      .join('views_hospital_dms as vhd', 'vhd.id', 'h.id')
      .join('views_covid_case_last as vl', 'vl.covid_case_id', 'pc.id')
      .leftJoin('b_hospitals as rh', 'rh.id', 'pc.hospital_id_refer')
      .where('pc.is_deleted', 'N')
      .whereIn('pc.status', ['DISCHARGE', 'NEGATIVE', 'DEATH', 'REFER'])
      .whereIn('vl.gcs_id', [1, 2, 3, 4])
      .whereBetween('pc.date_discharge', [`${date} 00:00:00`, `${date} 23:59:00`])
      .orderBy('h.zone_code').orderBy('h.province_name').orderBy('h.hospname');
    if (showPersons) {
      sql.select('p.person_id', 'pp.*', 't.name as title_name')
        .join('p_persons as pp', 'p.person_id', 'pp.id')
        .leftJoin('um_titles as t', 'pp.title_id', 't.id');
    }
    return sql;
  }

  dischargeCaseEntryDate(db: Knex, date, showPersons = false) {
    let sql = db('views_covid_case_last AS vc')
      .select('vc.*', 'pc.date_discharge', 'pc.hospital_id_refer', 'bh.zone_code', 'bh.province_code', 'bh.province_name as p_name', 'bh.hospcode', 'bh.hospname', 'rh.hospcode as hospcode_refer', 'rh.hospname as hospname_refer', 'pc.an', 'p.hn')
      .join('p_covid_cases AS pc', 'pc.id', 'vc.covid_case_id')
      .join('p_patients as p', 'p.id', ' pc.patient_id')
      .join('b_hospitals AS bh', 'bh.id', 'vc.hospital_id')
      .leftJoin('b_hospitals as rh', 'rh.id', 'pc.hospital_id_refer')
      .whereIn('vc.status', ['DISCHARGE', 'NEGATIVE', 'DEATH', 'REFER'])
      .whereBetween('vc.entry_date', [`${date} 00:00:00`, `${date} 23:59:00`])
      .orderBy('bh.zone_code').orderBy('bh.province_name').orderBy('bh.hospname');
    if (showPersons) {
      sql.select('p.person_id', 'pp.*', 't.name as title_name')
        .join('p_persons as pp', 'p.person_id', 'pp.id')
        .leftJoin('um_titles as t', 'pp.title_id', 't.id');
    }
    console.log(sql.toString());

    return sql
  }

  labPositive(db: Knex) {
    return db('p_covid_cases as c')
      .select('l.*')
      .rightJoin('lab_positive as l', 'c.sat_id', 'l.sat_id')
      .whereNull('c.id');
  }


  getCaseDc(db: Knex, showPersons = false, query = null, zoneCode, provinceCode = null) {
    const _query = `%${query}%`;
    const sql = db('view_covid_case_last as c')
      .select('c.id as covid_case_id', 'h.hospname', 'h.province_name as hosp_province', 'c.an', 'c.confirm_date', 'c.status', 'c.date_admit', 'c.date_discharge', 'pt.hn')
      .join('p_patients as pt', 'c.patient_id', 'pt.id')
      .join('b_hospitals AS h', 'h.id', 'c.hospital_id')
      .whereIn('c.status', ['DISCHARGE', 'NEGATIVE', 'DEATH', 'REFER'])
      // .where('pt.hospital_id', hospitalId)
      .where('h.zone_code', zoneCode);
    if (showPersons) {
      sql.select('pt.person_id', 'p.*', 't.name as title_name')
        .join('p_persons as p', 'pt.person_id', 'p.id')
        .leftJoin('um_titles as t', 'p.title_id', 't.id');
    }
    if (provinceCode) {
      sql.where('h.province_code', provinceCode);
    }
    if (query) {
      sql.where((w) => {
        w.where('pt.hn', 'like', _query)
          .orWhere('h.hospname', 'like', _query)
          .orWhere('h.province_name', 'like', _query)
          .orWhere('c.status', 'like', _query);
        if (showPersons) {
          w.orWhere('p.first_name', 'like', _query)
            .orWhere('p.last_name', 'like', _query);
        }
      });
    }

    sql.orderBy('c.date_admit', 'DESC');
    console.log(sql.toString());

    return sql;
    // .groupBy('pt.id')
  }

  reportBedZone(db: Knex) {
    return db('temp_report_all_6_1');
  }

  reportBedProvince(db: Knex) {
    return db.raw(`SELECT
    t.zone_code,
    t.province_code,
    p.name_th as province_name,
    sum(t.aiir_covid_qty) as aiir_covid_qty,
    sum(t.aiir_usage_qty) as aiir_usage_qty,
    sum(t.modified_aiir_covid_qty) as modified_aiir_covid_qty,
    sum(t.modified_aiir_usage_qty) as modified_aiir_usage_qty,
    sum(t.cohort_covid_qty) as cohort_covid_qty,
    sum(t.cohort_usage_qty) as cohort_usage_qty,
    sum(t.isolate_covid_qty) as isolate_covid_qty,
    sum(t.isolate_usage_qty) as  isolate_usage_qty,
    sum(t.cohort_icu_covid_qty) as cohort_icu_covid_qty,
    sum(t.cohort_icu_usage_qty) as cohort_icu_usage_qty,
    sum(t.hospitel_usage_qty) as hospitel_usage_qty,
    sum(t.hospitel_covid_qty) as hospitel_covid_qty
  FROM
    temp_report_all_6 as t 
    join b_province as p on p.code = t.province_code
  GROUP BY
    t.province_code
    order by t.zone_code,p.name_th`)
  }

  getCasePresent(db: Knex, hospitalId) {
    const sql = db('p_covid_cases as c')
      .select('pt.hn', 't.name as title_name', 'p.*', 'p.first_name', 'p.last_name',
        db.raw(`ifnull(cd.updated_entry, cd.create_date) as updated_date`), 'cd.gcs_id',
        db.raw(`ifnull(cd.medical_supplie_id, 'not use') as medical_supplie_id`),
        'cd.bed_id', 'cdi.generic_id as set4'
      )
      .join('p_patients as pt', 'c.patient_id', 'pt.id')
      .join('p_persons as p', 'pt.person_id', 'p.id')
      .leftJoin('um_titles as t', 'p.title_id', 't.id')
      .leftJoin('p_covid_case_detail_last as ccd', 'ccd.covid_case_id', 'c.id')
      .leftJoin('p_covid_case_details as cd', 'ccd.covid_case_detail_id', 'cd.id')
      .joinRaw('  left join p_covid_case_detail_items as cdi on cdi.covid_case_detail_id = cd.id and cdi.generic_id = 8')
      .where('pt.hospital_id', hospitalId)
      .where('c.status', 'ADMIT')
      .where('c.is_deleted', 'N');
    // console.log(sql.toString());
    return sql;
  }

  getCaseAllHosp(db: Knex, zoneCode, provinceCode = null, hospitalId = null) {
    const sql = db('view_covid_case_last as c')
      .select(
        'p.cid',
        'p.passport',
        't.name as title_name',
        'p.first_name',
        'p.middle_name',
        'p.last_name',
        'g.name as sex',
        'p.birth_date',
        'p.telephone',
        'p.house_no',
        'p.room_no',
        'p.village_name',
        'p.road',
        'p.tambon_name',
        'p.ampur_name',
        'p.province_name',
        'p.zipcode',
        'pet.name as people_types',
        'c.status',
        'c.confirm_date',
        'c.date_admit',
        'c.date_discharge',
        'pt.hn',
        'c.an',
        'h.hospname',
        db.raw(`ifnull(c.updated_entry, c.create_date) as updated_date`),
        'p.data_source',
      )
      .leftJoin('p_patients as pt', 'c.patient_id', 'pt.id')
      .leftJoin('p_persons as p', 'pt.person_id', 'p.id')
      .leftJoin('b_hospitals AS h', 'h.id', 'c.hospital_id')
      .leftJoin('b_genders as g', 'p.gender_id', 'g.id')
      .leftJoin('b_people_types as pet', 'p.people_type', 'pet.id')
      .leftJoin('um_titles as t', 'p.title_id', 't.id')
      .where('pt.hospital_id', hospitalId)
      .where('h.zone_code', zoneCode);
    if (provinceCode) {
      sql.where('h.province_code', provinceCode);
    }
    if (hospitalId) {
      sql.where('pt.hospital_id', hospitalId)
    }
    sql.orderBy('c.date_admit', 'DESC');
    // console.log(sql.toString());

    return sql;
    // .groupBy('pt.id')
  }

}