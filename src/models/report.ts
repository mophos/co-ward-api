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
      .sum('v.sum as countCase')
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

  getBadExcel(db: Knex, date) {
    return db('views_bed_hospital_cross as vc')
      .leftJoin('views_bed_hospital_date_cross AS vb', (v) => {
        v.on('vc.hospital_id ', 'vb.hospital_id')
          .on('vb.entry_date', db.raw(`${date}`))
      })
      .join('b_hospitals as vh', 'vh.id', 'vc.hospital_id')
      // .whereIn('vh.hosptype_code', ['01', '02', '05', '06', '07', '11', '12'])
      // .where('vh.province_code', provinceCode)
      .orderBy('vh.province_code')
  }

  getMedicals(db: Knex) {
    return db('views_requisition_hospitals AS vrh')
  }

  getProfessional(db: Knex) {
    return db('views_professional_hospitals AS vph')
  }

  getSupplies(db: Knex, date) {
    const suppliesId = db('wm_supplies_details as wsd')
      .max('ws.id as id')
      .join('wm_supplies as ws', 'ws.id', 'wsd.wm_supplie_id')
      .groupBy('ws.hospital_id');
    if (date) {
      suppliesId.where('ws.date', '<=', date)
    }

    const sql = db('wm_supplies_details as sd')
      .select('sd.id AS id', 'sd.wm_supplie_id AS wm_supplie_id', 'sd.generic_id AS generic_id',
        'sd.qty AS qty', 'sd.month_usage_qty AS month_usage_qty', 's.hospital_id AS hospital_id', 's.date')
      .join('wm_supplies as s', 's.id', 'sd.wm_supplie_id')
      .whereIn('sd.id', suppliesId)

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

  admitConfirmCase(db: Knex) {
    const last = db('p_covid_case_details')
      .max('updated_entry as updated_entry_last')
      .whereRaw('covid_case_id=cl.covid_case_id')
      .whereNotNull('updated_entry')
      .as('updated_entry_last')
    const drugUse = db('p_covid_case_detail_items AS i').select(
      'i.covid_case_detail_id',
      db.raw(`sum(if( i.generic_id = 1 ,i.qty,0)) AS 'd1'`),
      db.raw(`sum(if( i.generic_id = 2 ,i.qty,0)) AS 'd2'`),
      db.raw(`sum(if( i.generic_id = 3 ,i.qty,0)) AS 'd3'`),
      db.raw(`sum(if( i.generic_id = 4 ,i.qty,0)) AS 'd4'`),
      db.raw(`sum(if( i.generic_id = 5 ,i.qty,0)) AS 'd5'`),
      db.raw(`sum(if( i.generic_id = 7 ,i.qty,0)) AS 'd7'`),
      db.raw(`sum(if( i.generic_id = 8 ,i.qty,0)) AS 'd8'`))
      .join('view_covid_case_last AS l', 'l.id', 'i.covid_case_detail_id')
      .groupBy('i.covid_case_detail_id').as('du')
    let sql = db('views_covid_case_last as cl')
      .select('du.d1', 'du.d2', 'du.d3', 'du.d4', 'du.d5', 'du.d7', 'du.d8')
      .select('pt.hn', 'c.an', 'pt.hospital_id', last, db.raw(`DATEDIFF( now(),(${last}) ) as days`), 'h.hospname', 'h.hospcode', 'h.zone_code', 'h.province_name', 'c.date_admit', 'g.name as gcs_name', 'b.name as bed_name', 'm.name as medical_supplies_name')
      .join('p_covid_cases as c', 'c.id', 'cl.covid_case_id')
      .join('p_patients as pt', 'pt.id', 'c.patient_id')
      .join('b_hospitals as h', 'h.id', 'pt.hospital_id')
      .join('b_gcs as g', 'g.id', 'cl.gcs_id')
      .join('b_beds as b', 'b.id', 'cl.bed_id')
      .leftJoin('b_medical_supplies as m', 'm.id', 'cl.medical_supplie_id')
      .leftJoin(drugUse, 'du.covid_case_detail_id', 'cl.id')
      .where('cl.status', 'ADMIT')
      .whereIn('gcs_id', [1, 2, 3, 4])
      // .orderBy('days','DESC')
      .orderBy('h.zone_code')
      .orderBy('h.province_code')
      .orderBy('h.hospname')
    return sql;
  }

  admitConfirmCaseSummary(db: Knex) {
    const drugUse = db('p_covid_case_detail_items AS i').select(
      'i.covid_case_detail_id',
      db.raw(`sum(if( i.generic_id = 1 ,i.qty,0)) AS 'd1'`),
      db.raw(`sum(if( i.generic_id = 2 ,i.qty,0)) AS 'd2'`),
      db.raw(`sum(if( i.generic_id = 3 ,i.qty,0)) AS 'd3'`),
      db.raw(`sum(if( i.generic_id = 4 ,i.qty,0)) AS 'd4'`),
      db.raw(`sum(if( i.generic_id = 5 ,i.qty,0)) AS 'd5'`),
      db.raw(`sum(if( i.generic_id = 7 ,i.qty,0)) AS 'd7'`),
      db.raw(`sum(if( i.generic_id = 8 ,i.qty,0)) AS 'd8'`))
      .join('view_covid_case_last AS l', 'l.id', 'i.covid_case_detail_id')
      .groupBy('i.covid_case_detail_id').as('du')
    let sql = db('views_covid_case_last as cl')
      .select(db.raw('sum((du.d1 is not null) and (du.d1 > 0)) as d1'),
       db.raw('sum((du.d2 is not null) and (du.d2 > 0)) as d2'),
       db.raw('sum((du.d3 is not null) and (du.d3 > 0)) as d3'),
       db.raw('sum((du.d4 is not null) and (du.d4 > 0)) as d4'),
       db.raw('sum((du.d5 is not null) and (du.d5 > 0)) as d5'),
       db.raw('sum((du.d7 is not null) and (du.d7 > 0)) as d7'),
       db.raw('sum((du.d8 is not null) and (du.d8 > 0)) as d8'))
      .select(db.raw(`
      h.zone_code,
      sum( cl.gcs_id in (1,2,3,4) ) AS confirm,
      sum( cl.gcs_id = 1 ) AS severe,
      sum( cl.gcs_id = 2 ) AS moderate,
      sum( cl.gcs_id = 3 ) AS mild,
      sum( cl.gcs_id = 4 ) AS asymptomatic ,
      sum( cl.bed_id = 1 ) AS aiir ,
      sum( cl.bed_id = 2 ) AS modified_aiir ,
      sum( cl.bed_id = 3 ) AS isolate ,
      sum( cl.bed_id = 4 ) AS cohort ,
      sum( cl.bed_id = 5 ) AS   hospitel,
      sum( cl.medical_supplie_id = 1 ) AS   invasive,
      sum( cl.medical_supplie_id = 2 ) AS   noninvasive,
      sum( cl.medical_supplie_id = 3 ) AS   high_flow`))
      .join('p_covid_cases as c', 'c.id', 'cl.covid_case_id')
      .join('p_patients as pt', 'pt.id', 'c.patient_id')
      .join('b_hospitals as h', 'h.id', 'pt.hospital_id')
      .leftJoin(drugUse, 'du.covid_case_detail_id', 'cl.id')
      .where('cl.status', 'ADMIT')
      .whereIn('gcs_id', [1, 2, 3, 4])
      .groupBy('h.zone_code')
      .orderBy('h.zone_code')
      .orderBy('h.province_code')
      console.log(sql.toString());
      
    return sql;
  }

  homework(db: Knex) {
    return db('views_review_homework as v')
      .select(db.raw(`b.zone_code,
    sum(b.hosptype_code in ('05','06','07','11','12')) as government,
    sum(b.hosptype_code in ('05','06','07','11','12') and v.register_last_date is not null) as government_register,
      sum(b.hosptype_code in ('15')) as private,
    sum(b.hosptype_code in ('15') and v.register_last_date is not null) as private_register`))
      .join('b_hospitals as b', 'b.id', 'v.hospital_id')
      .groupBy('b.zone_code')
      .orderBy('b.zone_code')
  }

  homeworkDetail(db: Knex) {
    return db('views_review_homework as v')
      .select('v.*', 'b.hospcode', 'b.hospname', 'bs.name as sub_ministry_name')
      .join('b_hospitals as b', 'b.id', 'v.hospital_id')
      .join('b_hospital_subministry as bs', 'bs.code', 'b.sub_ministry_code')
      .orderBy('b.zone_code')
  }
}