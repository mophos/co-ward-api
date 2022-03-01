import { groupBy } from 'lodash';
import Knex = require('knex');
import moment = require('moment');

export class ReportAllModel {

  getProvince(db: Knex) {
    return db('b_province')
  }

  report1(db: Knex, date: any, sector: any) {
    const sql = db('views_hospital_all as vh')
      .select('vc.*', 'vh.*')
      .count('* as hospital_qty')
      .sum('aiir_covid_qty as aiir_qty')
      .sum('modified_aiir_covid_qty as modified_aiir_qty')
      .sum('isolate_covid_qty as isolate_qty')
      .sum('cohort_covid_qty as cohort_qty')
      .sum('hospitel_covid_qty as hospitel_qty')
      .leftJoin('views_bed_hospital_cross as vc', 'vh.id', 'vc.hospital_id')
      .groupBy('vh.sub_ministry_code')
    return sql;

  }

  getPatientsCaseByEachDate(db: Knex, { start, end }: { start: string, end: string }, options: any) {

    const groupBy = options.groupBy || 'cd.gcs_id'
    const sql = db('p_covid_case_details AS cd')
      .select('g.name', 'c.date_admit')
      .count('* as amount')
      .leftJoin('p_covid_cases as c', 'cd.covid_case_id', 'c.id')
      .leftJoin('p_patients as pt', 'pt.id', 'c.patient_id')
      .leftJoin('b_hospitals as h', 'pt.hospital_id', 'h.id')
      .leftJoin('b_hospital_subministry as hs', 'hs.code', 'h.sub_ministry_code')
      .leftJoin('b_gcs as g', 'g.id', 'cd.gcs_id')
      .whereBetween('c.date_admit', [start, end])
      .where('c.case_status', options.case)
      .where('cd.status', options.status)
      .where('c.is_deleted', 'N')
      .groupBy('c.date_admit', groupBy)
      .orderBy('c.date_admit')

    if (options.gcs_id) {
      sql.where('cd.gcs_id', options.gcs_id)
    }

    if (options.medical_supplie_id) {
      sql.where('cd.medical_supplie_id', options.medical_supplie_id)
    }

    if (options.sub_ministry_codes?.length) {
      sql.whereIn('h.sub_ministry_code', options.sub_ministry_codes)
    }

    if (options.zones?.length) {
      sql.whereIn('h.zone_code', options.zones)
    }

    if (options.provinces?.length) {
      sql.whereIn('h.province_code', options.provinces)
    }

    if (options.bed_ids?.length) {
      sql.whereIn('cd.bed_id', options.bed_ids)
    }

    return sql
  }

  getPatientsStatusByEachDate(db: Knex, { start, end }: { start: string, end: string }, options: any) {
    const sql = db('p_covid_case_details as covid_case_detail')
      .select('covid_case.status', 'covid_case.date_admit')
      .count('* as amount')
      .leftJoin('p_covid_cases as covid_case', 'covid_case_detail.covid_case_id', 'covid_case.id')
      .leftJoin('p_patients as patients', 'patients.id', 'covid_case.patient_id')
      .leftJoin('b_hospitals as hospitals', 'patients.hospital_id', 'hospitals.id')
      .leftJoin('b_hospital_subministry as hospital_subministry', 'hospital_subministry.code', 'hospitals.sub_ministry_code')
      .leftJoin('b_beds as beds', 'beds.id', 'covid_case_detail.bed_id')
      .joinRaw('LEFT JOIN b_bed_hospitals AS bed_hospitals ON bed_hospitals.bed_id = covid_case_detail.bed_id AND bed_hospitals.hospital_id = hospitals.id')
      .whereBetween('covid_case.date_admit', [start, end])
      .where('covid_case.is_deleted', 'N')
      .groupBy('covid_case.status')
      .groupBy('covid_case.date_admit')

    if (options.sub_ministry_codes?.length) {
      sql.whereIn('hospitals.sub_ministry_code', options.sub_ministry_codes)
    }

    if (options.zones?.length) {
      sql.whereIn('hospitals.zone_code', options.zones)
    }

    if (options.provinces?.length) {
      sql.whereIn('hospitals.province_code', options.provinces)
    }

    if (options.bed_ids?.length) {
      sql.whereIn('covid_case_detail.bed_id', options.bed_ids)
    }

    return sql
  }

  getPatientsCategoryByEachDate(db: Knex, { start, end }: { start: string, end: string }, options: any) {
    const sql = db('p_covid_case_details as covid_case_detail')
      .select('covid_case.date_admit')
      .count('* as amount')
      .leftJoin('p_covid_cases as covid_case', 'covid_case_detail.covid_case_id', 'covid_case.id')
      .leftJoin('p_patients as patients', 'patients.id', 'covid_case.patient_id')
      .leftJoin('b_hospitals as hospitals', 'patients.hospital_id', 'hospitals.id')
      .leftJoin('b_hospital_subministry as hospital_subministry', 'hospital_subministry.code', 'hospitals.sub_ministry_code')
      .leftJoin('b_beds as beds', 'beds.id', 'covid_case_detail.bed_id')
      .joinRaw('LEFT JOIN b_bed_hospitals AS bed_hospitals ON bed_hospitals.bed_id = covid_case_detail.bed_id AND bed_hospitals.hospital_id = hospitals.id')
      .whereBetween('covid_case.date_admit', [start, end])
      .where('covid_case.is_deleted', 'N')
      .whereNotIn('covid_case.status', ['DEATH', 'DISCHARGE'])
      .groupBy('covid_case.date_admit')

    if (options.sectors?.length) {
      sql.leftJoin('views_hospital_dms as dms', 'dms.id', 'hospitals.id')
        .whereIn('dms.sector', options.sectors)
    }

    if (options.sub_ministry_codes?.length) {
      sql.whereIn('hospitals.sub_ministry_code', options.sub_ministry_codes)
    }

    if (options.zones?.length) {
      sql.whereIn('hospitals.zone_code', options.zones)
    }

    if (options.provinces?.length) {
      sql.whereIn('hospitals.province_code', options.provinces)
    }

    if (options.bed_ids?.length) {
      sql.whereIn('covid_case_detail.bed_id', options.bed_ids)
    }

    return sql
  }

  getTotalUsedBedByDateRange(db: Knex, { start, end }: { start: string, end: string }, options: any) {
    const sql = db('p_covid_case_details as covid_case_details')
      .select('beds.name', 'beds.id as bed_id')
      .count('* as amount')
      .leftJoin('p_covid_cases as covid_cases', 'covid_case_details.covid_case_id', 'covid_cases.id')
      .leftJoin('b_beds as beds', 'beds.id', 'covid_case_details.bed_id')
      .leftJoin('p_patients as patients', 'patients.id', 'covid_cases.patient_id')
      .leftJoin('b_hospitals as hospitals', 'patients.hospital_id', 'hospitals.id')
      .leftJoin('b_hospital_subministry as hospital_subministry', 'hospital_subministry.code', 'hospitals.sub_ministry_code')
      .where('covid_cases.case_status', 'COVID')
      .whereBetween('covid_cases.date_admit', [start, end])
      // .whereIn('covid_case_details.bed_id', options.bed_ids || [11, 12, 13, 14])
      .whereNotIn('covid_cases.status', ['DEATH', 'DISCHARGE'])
      .groupBy('covid_case_details.bed_id', 'covid_cases.date_admit')

    if (options.bed_ids.length) {
      sql.whereIn('covid_case_details.bed_id', options.bed_ids)
    } else {
      sql.whereIn('covid_case_details.bed_id', [11, 12, 13, 14])
    }

    if (options.sectors?.length) {
      sql.leftJoin('views_hospital_dms as dms', 'dms.id', 'hospitals.id')
        .whereIn('dms.sector', options.sectors)
    }

    if (options.sub_ministry_codes?.length) {
      sql.whereIn('hospitals.sub_ministry_code', options.sub_ministry_codes)
    }

    if (options.zones?.length) {
      sql.whereIn('hospitals.zone_code', options.zones)
    }

    if (options.provinces?.length) {
      sql.whereIn('hospitals.province_code', options.provinces)
    }
    console.log(sql.toString());

    return sql
  }

  getTotalBedByDateRange(db: Knex, { start, end }: { start: string, end: string }, options: any) {
    console.log(options);

    const max = db('wm_beds')
      .where('date', '<', end)
      .max('id')
      .groupBy('hospital_id');

    const sql = db('wm_bed_details as bed_details')
      .select('bed_details.bed_id', 'bed_info.name')
      .sum('bed_details.covid_qty as covid_qty')
      .sum('bed_details.spare_qty as spare_qty')
      .leftJoin('wm_beds as bed', 'bed.id', 'bed_details.wm_bed_id')
      .leftJoin('b_beds as bed_info', 'bed_details.bed_id', 'bed_info.id')
      .leftJoin('b_hospitals as hospitals', 'bed.hospital_id', 'hospitals.id')
      .leftJoin('b_hospital_subministry as hospital_subministry', 'hospital_subministry.code', 'hospitals.sub_ministry_code')
      // .whereRaw('bed.date = (SELECT MAX(wm_beds.date) FROM wm_beds WHERE )')

      // .where('bed.date', '<', end)
      .whereIn('bed.id', max)

      // .orWhereNull('bed.date')
      .groupBy('bed_details.bed_id')
    if (options.bed_ids.length) {
      sql.whereIn('bed_details.bed_id', options.bed_ids)
    } else {
      sql.whereIn('bed_details.bed_id', [11, 12, 13, 14])
    }
    if (options.sectors?.length) {
      sql.leftJoin('views_hospital_dms as dms', 'dms.id', 'hospitals.id')
        .whereIn('dms.sector', options.sectors)
    }

    if (options.sub_ministry_codes?.length) {
      sql.whereIn('hospitals.sub_ministry_code', options.sub_ministry_codes)
    }

    if (options.zones?.length) {
      sql.whereIn('hospitals.zone_code', options.zones)
    }

    if (options.provinces?.length) {
      sql.whereIn('hospitals.province_code', options.provinces)
    }
    console.log(sql.toString());

    return sql
  }

  medicalsSupplyReportByHospital(db: Knex, date: any, sector: any, hospitalIds = []) {
    const sql = db('views_hospital_all as vh')
      .select('vh.*', 'vm.*')
      .leftJoin('views_medical_supplies_hospital_cross as vm', 'vh.id', 'vm.hospital_id')
      .groupBy('vh.id')
      .orderBy('vh.zone_code', 'ASC')
      .orderBy('vh.province_name', 'ASC')
      .orderBy('vh.hospname', 'ASC')

    if (hospitalIds.length > 0) {
      sql.whereIn('vm.hospital_id', hospitalIds)
    }

    return sql
  }

  getBedReportByZone(
    db: Knex,
    date: string,
    options: {
      case: string,
      status: string,
      groupBy: string,
      zones: string[],
      provinces: string[]
    },
    dateRange: {
      start: string,
      end: string
    } = null) {
    const sql = db('p_covid_case_details AS cd')
      .select('h.zone_code', 'cd.bed_id', 'b.name as bed_name', 'h.province_code', 'h.province_name', 'h.hospname', 'h.id', 'h.hospcode', 'h.level', 'hs.name as sub_ministry_name')
      .count('* as used')
      .leftJoin('p_covid_cases as c', 'cd.covid_case_id', 'c.id')
      .leftJoin('p_patients as pt', 'pt.id', 'c.patient_id')
      .leftJoin('b_hospitals as h', 'pt.hospital_id', 'h.id')
      .leftJoin('b_hospital_subministry as hs', 'hs.code', 'h.sub_ministry_code')
      .leftJoin('b_beds as b', 'b.id', 'cd.bed_id')
      .where('cd.status', options.status)
      .where('c.is_deleted', 'N')
      .where('h.is_deleted', 'N')
      .groupBy(options.groupBy, 'cd.bed_id')
      .orderBy('h.zone_code')
      .orderBy('h.province_name')
      .orderBy('h.hospname')
      .as('a')

    if (moment(date, 'YYYY-MM-DD').isValid()) {
      sql.where('cd.entry_date', date)
    }

    if (options.case) {
      sql.where('c.case_status', options.case)
    }

    if (!date && dateRange) {
      if (moment(dateRange.start, 'YYYY-MM-DD').isValid()) {
        sql.whereBetween('cd.entry_date', [dateRange.start, dateRange.end])
      }
    }



    if (options.zones?.length > 0) {
      sql.whereIn('h.zone_code', options.zones)
    }

    if (options.provinces?.length > 0) {
      sql.whereIn('h.province_code', options.provinces)
    }

    const sqlBed = db('b_bed_hospitals as bh')
      .select('h.zone_code','h.province_code', 'bed_id')
      .sum('bh.covid_qty as covid_qty')
      .join('b_hospitals as h', 'h.id', 'bh.hospital_id')
      .groupBy('bh.bed_id')
      .groupBy('h.zone_code')
      .as('b')

    const finalSQL = db(sql).select('a.*', 'b.covid_qty as total')
      .join(sqlBed, (w) => {
        w.on('a.zone_code', 'b.zone_code')
        w.on('a.bed_id', 'b.bed_id')
      })
      // .limit(10)
      // console.log(finalSQL.toString());
      
    return finalSQL;

  }

  getBedReportByProvince(
    db: Knex,
    date: string,
    options: {
      case: string,
      status: string,
      groupBy: string,
      zones: string[],
      provinces: string[]
    },
    dateRange: {
      start: string,
      end: string
    } = null) {
    const sql = db('p_covid_case_details AS cd')
      .select('h.zone_code', 'cd.bed_id', 'b.name as bed_name', 'h.province_code', 'h.province_name', 'h.hospname', 'h.id', 'h.hospcode', 'h.level', 'hs.name as sub_ministry_name')
      .count('* as used')
      .leftJoin('p_covid_cases as c', 'cd.covid_case_id', 'c.id')
      .leftJoin('p_patients as pt', 'pt.id', 'c.patient_id')
      .leftJoin('b_hospitals as h', 'pt.hospital_id', 'h.id')
      .leftJoin('b_hospital_subministry as hs', 'hs.code', 'h.sub_ministry_code')
      .leftJoin('b_beds as b', 'b.id', 'cd.bed_id')
      .where('cd.status', options.status)
      .where('c.is_deleted', 'N')
      .where('h.is_deleted', 'N')
      .groupBy(options.groupBy, 'cd.bed_id')
      .orderBy('h.zone_code')
      .orderBy('h.province_name')
      .orderBy('h.hospname')
      .as('a')

    if (moment(date, 'YYYY-MM-DD').isValid()) {
      sql.where('cd.entry_date', date)
    }

    if (options.case) {
      sql.where('c.case_status', options.case)
    }

    if (!date && dateRange) {
      if (moment(dateRange.start, 'YYYY-MM-DD').isValid()) {
        sql.whereBetween('cd.entry_date', [dateRange.start, dateRange.end])
      }
    }



    if (options.zones?.length > 0) {
      sql.whereIn('h.zone_code', options.zones)
    }

    if (options.provinces?.length > 0) {
      sql.whereIn('h.province_code', options.provinces)
    }

    const sqlBed = db('b_bed_hospitals as bh')
      .select('h.zone_code','h.province_code', 'bed_id')
      .sum('bh.covid_qty as covid_qty')
      .join('b_hospitals as h', 'h.id', 'bh.hospital_id')
      .groupBy('bh.bed_id')
      .groupBy('h.province_code')
      .as('b')

    const finalSQL = db(sql).select('a.*', 'b.covid_qty as total')
      .join(sqlBed, (w) => {
        w.on('a.province_code', 'b.province_code')
        w.on('a.bed_id', 'b.bed_id')
      })
      // .limit(10)
      // console.log(finalSQL.toString());
      
    return finalSQL;

  }

  getBedReportByHospital(
    db: Knex,
    date: string,
    options: {
      case: string,
      status: string,
      zones: string[],
      provinces: string[]
    }) {
    const sql = db('p_covid_case_details AS cd')
    sql.select('h.zone_code', 'cd.bed_id', 'h.province_code', 'h.province_name', 'h.hospname', 'h.id as hospital_id')
      .count('* as used')
      .leftJoin('p_covid_cases as c', 'cd.covid_case_id', 'c.id')
      .leftJoin('p_patients as pt', 'pt.id', 'c.patient_id')
      .leftJoin('b_hospitals as h', 'pt.hospital_id', 'h.id')
      // .joinRaw('LEFT JOIN b_bed_hospitals AS bh ON bh.bed_id = cd.bed_id AND bh.hospital_id = h.id')
      .where('cd.status', options.status)
      .where('c.is_deleted', 'N')
      .where('h.is_deleted', 'N')
      .groupBy('h.id', 'cd.bed_id')
      .orderBy('h.zone_code')
      .orderBy('h.province_name')
      .orderBy('h.hospname')
      .as('a')

    if (moment(date, 'YYYY-MM-DD').isValid()) {
      sql.where('cd.entry_date', date)
    }

    if (options.case) {
      sql.where('c.case_status', options.case)
    }
    console.log(options.zones);

    if (options.zones?.length > 0) {
      sql.whereIn('h.zone_code', options.zones)
    }

    if (options.provinces?.length > 0) {
      // sql.whereIn('h.zone_code', options.zones)
      sql.whereIn('h.province_code', options.provinces)
    }


    const sqlBed = db('b_bed_hospitals as bh')
      .select('h.id as hospital_id', 'bh.bed_id', 'h.hospname', 'h.zone_code', 'h.hospcode', 'h.province_name', 'h.level', 'hs.name as sub_ministry_name')
      .sum('bh.covid_qty as covid_qty')
      .join('b_hospitals as h', 'h.id', 'bh.hospital_id')
      .leftJoin('b_hospital_subministry as hs', 'hs.code', 'h.sub_ministry_code')
      .where('h.is_deleted', 'N')
      .groupBy('bh.bed_id')
      .groupBy('h.id')
      .orderBy('h.zone_code')
      .orderBy('h.province_name')
      .orderBy('h.hospname')
      .as('b')

    if (options.zones?.length > 0) {
      sqlBed.whereIn('h.zone_code', options.zones)
    }

    if (options.provinces?.length > 0) {
      sqlBed.whereIn('h.province_code', options.provinces)
    }
    const finalSQL = db(sqlBed).select('b.hospname', 'b.zone_code', 'b.hospcode', 'b.province_name', 'b.level', 'a.used', 'b.bed_id', 'b.sub_ministry_name', 'b.covid_qty as total')
      .leftJoin(sql, (w) => {
        w.on('a.hospital_id', 'b.hospital_id')
        w.on('a.bed_id', 'b.bed_id')
      })
    // console.log(finalSQL.toString());

    return finalSQL;
  }

  bedReportByZone(db: Knex, date: any, sector: any, zones = []) {
    const sql = db('views_hospital_all as vh')
      .select('vc.*', 'vh.*', 'vm.*')
      .count('* as hospital_qty')
      .sum('aiir_covid_qty as aiir_qty')
      .sum('modified_aiir_covid_qty as modified_aiir_qty')
      .sum('isolate_covid_qty as isolate_qty')
      .sum('cohort_covid_qty as cohort_qty')
      .sum('hospitel_covid_qty as hospitel_qty')
      .sum('home_isolation_covid_qty as home_isolation_qty')
      .sum('community_isolation_covid_qty as community_isolation_qty')
      .sum('invasive_covid_qty as invasive_qty')
      .sum('non_invasive_covid_qty as non_invasive_qty')
      .sum('high_flow_covid_qty as high_flow_qty')
      .sum('papr_covid_qty as papr_qty')
      .leftJoin('views_bed_hospital_cross as vc', 'vh.id', 'vc.hospital_id')
      .leftJoin('views_medical_supplies_hospital_cross as vm', 'vh.id', 'vm.hospital_id')
      .groupBy('vh.zone_code')
      .orderBy('vh.zone_code', 'ASC')

    if (zones.length > 0) {
      sql.whereIn('vh.zone_code', zones)
    }

    return sql;
  }

  bedReportByProvince(db: Knex, date: any, sector: any, provinces = []) {
    const sql = db('views_hospital_all as vh')
      .select('vc.*', 'vh.*')
      .count('* as hospital_qty')
      .sum('aiir_covid_qty as aiir_qty')
      .sum('modified_aiir_covid_qty as modified_aiir_qty')
      .sum('isolate_covid_qty as isolate_qty')
      .sum('cohort_covid_qty as cohort_qty')
      .sum('hospitel_covid_qty as hospitel_qty')
      .sum('home_isolation_covid_qty as home_isolation_qty')
      .sum('community_isolation_covid_qty as community_isolation_qty')
      .sum('invasive_covid_qty as invasive_qty')
      .sum('non_invasive_covid_qty as non_invasive_qty')
      .sum('high_flow_covid_qty as high_flow_qty')
      .sum('papr_covid_qty as papr_qty')
      .leftJoin('views_bed_hospital_cross as vc', 'vh.id', 'vc.hospital_id')
      .leftJoin('views_medical_supplies_hospital_cross as vm', 'vh.id', 'vm.hospital_id')
      .groupBy('vh.province_code')
      .orderBy('vh.zone_code', 'ASC')

    if (provinces.length > 0) {
      sql.whereIn('vh.province_code', provinces)
    }

    return sql;
  }

  bedReportByHospital(db: Knex, date: any, sector: any, hospitalIds = []) {
    const sql = db('views_hospital_all as vh')
      .select('vc.*', 'vh.*')
      .count('* as hospital_qty')
      .sum('aiir_covid_qty as aiir_qty')
      .sum('modified_aiir_covid_qty as modified_aiir_qty')
      .sum('isolate_covid_qty as isolate_qty')
      .sum('cohort_covid_qty as cohort_qty')
      .sum('hospitel_covid_qty as hospitel_qty')
      .sum('home_isolation_covid_qty as home_isolation_qty')
      .sum('community_isolation_covid_qty as community_isolation_qty')
      .sum('invasive_covid_qty as invasive_qty')
      .sum('non_invasive_covid_qty as non_invasive_qty')
      .sum('high_flow_covid_qty as high_flow_qty')
      .sum('papr_covid_qty as papr_qty')
      .leftJoin('views_bed_hospital_cross as vc', 'vh.id', 'vc.hospital_id')
      .leftJoin('views_medical_supplies_hospital_cross as vm', 'vh.id', 'vm.hospital_id')
      .groupBy('vc.hospital_id')
      .orderBy('vh.zone_code', 'ASC')

    if (hospitalIds.length > 0) {
      sql.whereIn('vc.hospital_id', hospitalIds)
    }

    return sql;
  }

  report2(db: Knex, date, sector) {
    //     const last = db('views_covid_case')
    //       .max('updated_entry as updated_entry_last')
    //       .whereRaw('hospital_id=vc.hospital_id')
    //       .whereNotNull('updated_entry')
    //       .as('updated_entry')

    //     const sql = db('views_hospital_all as vh')
    //       .select('vh.id', 'vh.hospname', 'vh.sub_ministry_name', db.raw(`
    // sum( gcs_id = 1 ) AS severe,
    // sum( gcs_id = 2 ) AS moderate,
    // sum( gcs_id = 3 ) AS mild,
    // sum( gcs_id = 4 ) AS asymptomatic,
    // sum( gcs_id = 5 ) AS ip_pui,
    // sum( gcs_id = 6 ) AS observe`), last)
    //       .leftJoin('views_covid_case_last as vc', (v) => {
    //         v.on('vh.id', 'vc.hospital_id')
    //         v.on('vc.status', db.raw(`'ADMIT'`))
    //       })
    //       .groupBy('vh.id')

    // return sql;
    return db('temp_report_all_2 as t')
      .select('t.*', 'h.zone_code', 'h.province_code')
      .join('b_hospitals as h', 'h.id', 't.id');
  }

  report3(db: Knex, date, sector) {
    let sub = db('views_case_hospital_date_cross')
      .max('entry_date as entry_date')
      .select('hospital_id')
      .where('entry_date', date)
      .where('status', 'ADMIT')
      .groupBy('hospital_id')
      .as('sub')

    let sql = db(sub)
      .select('v.*', 'vh.hospname', 'vh.sub_ministry_name', 'vh.zone_code', 'vh.province_code')
      .join('views_case_hospital_date_cross as v', (v) => {
        v.on('v.hospital_id', 'sub.hospital_id')
        v.on('v.entry_date', 'sub.entry_date')
      })
      .join('views_hospital_all as vh', 'vh.id', 'v.hospital_id')
      .where('v.status', 'ADMIT')
      .orderBy('vh.sub_ministry_name')

    return sql;

  }

  getPatientsReport(db: Knex, date, sector) {
    const sql = db('views_covid_case_last as cl')
      .select('vh.id as hospital_id',
        'vh.hospname',
        'vh.sub_ministry_name',
        'vh.zone_code',
        'vh.hospcode',
        'vh.province_code',
        'vh.province_name',
        db.raw(`sum((cl.gcs_id in (1,2,3,4) or cl.gcs_id is null) ) as admit,
          sum(c.status!='ADMIT' and (cl.gcs_id in (1,2,3,4) or cl.gcs_id is null) ) as discharge,
          sum(c.status='REFER' and hr.hospital_type='HOSPITEL'  and (cl.gcs_id in (1,2,3,4) or cl.gcs_id is null)  ) as discharge_hospitel,
          sum(c.status='DEATH'  and (cl.gcs_id in (1,2,3,4) or cl.gcs_id is null)  ) as discharge_death,
          
          sum(cl.gcs_id = 5 ) as pui_admit,
          sum(c.status!='ADMIT' and cl.gcs_id = 5 ) as pui_discharge,
          sum(c.status='REFER' and hr.hospital_type='HOSPITEL'  and cl.gcs_id = 5 ) as pui_discharge_hospitel,
          sum(c.status='DEATH'  and cl.gcs_id = 5 ) as pui_discharge_death,
          sum(cl.gcs_id = 6) as observe`
        ))

      .join('p_covid_cases AS c', 'c.id', 'cl.covid_case_id')
      .leftJoin('b_hospitals AS hr', 'c.hospital_id_refer', 'hr.id')
      .join('views_hospital_all as vh', 'vh.id', 'cl.hospital_id')
      .where('cl.entry_date', '<=', date)
      .where('cl.entry_date', '>=', '2020-12-15')
      .groupBy('cl.hospital_id')
      .orderBy('vh.zone_code', 'ASC')
      .orderBy('vh.province_name', 'ASC')
      .orderBy('vh.hospname', 'ASC')
    // console.log(sql.toString());

    return sql;
  }

  getPatientsReportByDate(db: Knex, date, sector) {
    const sql = db('views_covid_case_last as cl')
      .select('vh.id as hospital_id',
        'vh.hospname',
        'vh.sub_ministry_name',
        'vh.zone_code',
        'vh.hospcode',
        'vh.province_code',
        'vh.province_name',
        db.raw(`sum((cl.gcs_id in (1,2,3,4) or cl.gcs_id is null) ) as admit,
          sum(c.status!='ADMIT' and (cl.gcs_id in (1,2,3,4) or cl.gcs_id is null) ) as discharge,
          sum(c.status='REFER' and hr.hospital_type='HOSPITEL'  and (cl.gcs_id in (1,2,3,4) or cl.gcs_id is null)  ) as discharge_hospitel,
          sum(c.status='DEATH'  and (cl.gcs_id in (1,2,3,4) or cl.gcs_id is null)  ) as discharge_death,
          
          sum(cl.gcs_id = 5 ) as pui_admit,
          sum(c.status='ADMIT' and cl.gcs_id = 5 ) as pui_discharge,
          sum(c.status='REFER' and hr.hospital_type='HOSPITEL'  and cl.gcs_id = 5 ) as pui_discharge_hospitel,
          sum(c.status='DEATH'  and cl.gcs_id = 5 ) as pui_discharge_death,
          sum(cl.gcs_id = 6) as observe`
        ))

      .join('p_covid_cases AS c', 'c.id', 'cl.covid_case_id')
      .leftJoin('b_hospitals AS hr', 'c.hospital_id_refer', 'hr.id')
      .join('views_hospital_all as vh', 'vh.id', 'cl.hospital_id')
      .where('cl.entry_date', date)
      .groupBy('cl.hospital_id')
      .orderBy('vh.zone_code', 'ASC')
    return sql;
  }

  report4(db: Knex, date, sector) {
    const sql = db('views_covid_case_last as cl')
      .select('vh.id as hospital_id',
        'vh.hospname',
        'vh.sub_ministry_name',
        'vh.zone_code',
        'vh.province_code',
        'vh.province_name',
        db.raw(`sum((cl.gcs_id in (1,2,3,4) or cl.gcs_id is null) ) as admit,
        sum(c.status!='ADMIT' and (cl.gcs_id in (1,2,3,4) or cl.gcs_id is null) ) as discharge,
        sum(c.status='REFER' and hr.hospital_type='HOSPITEL'  and (cl.gcs_id in (1,2,3,4) or cl.gcs_id is null)  ) as discharge_hospitel,
        sum(c.status='DEATH'  and (cl.gcs_id in (1,2,3,4) or cl.gcs_id is null)  ) as discharge_death,
        
        sum(cl.gcs_id = 5 ) as pui_admit,
        sum(c.status!='ADMIT' and cl.gcs_id = 5 ) as pui_discharge,
        sum(c.status='REFER' and hr.hospital_type='HOSPITEL'  and cl.gcs_id = 5 ) as pui_discharge_hospitel,
        sum(c.status='DEATH'  and cl.gcs_id = 5 ) as pui_discharge_death,
        sum(cl.gcs_id = 6) as observe`
        ))

      .join('p_covid_cases AS c', 'c.id', 'cl.covid_case_id')
      .leftJoin('b_hospitals AS hr', 'c.hospital_id_refer', 'hr.id')
      .join('views_hospital_all as vh', 'vh.id', 'cl.hospital_id')
      .where('cl.entry_date', '<=', date)
      .where('cl.entry_date', '>=', '2020-12-15')
      .groupBy('cl.hospital_id')
    return sql;
  }

  getPatientsReportHeaders(db: Knex) {
    const sql = db('b_gcs').select('*').where('is_deleted', 'N')
    return sql
  }

  // getPatientsCases(db: Knex, date: string) {
  //   const sql = db('p_covid_case_details AS cd')
  //     .select('h.zone_code', 'cd.gcs_id', 'g.name as gcs_name')
  //     .count('* as count')
  //     .leftJoin('p_covid_cases as c', 'cd.covid_case_id', 'c.id')
  //     .leftJoin('p_patients as pt', 'pt.id', 'c.patient_id')
  //     .leftJoin('b_hospitals as h', 'pt.hospital_id', 'h.id')
  //     .leftJoin('b_gcs as g', 'g.id', 'cd.gcs_id')
  //     .where('cd.entry_date', date)
  //     .where('c.case_status', 'COVID')
  //     .where('cd.status', 'ADMIT')
  //     .where('c.is_deleted', 'N')
  //     .groupBy('h.zone_code', 'cd.gcs_id')
  //     .orderBy('h.zone_code')

  //   return sql
  // }

  // getDeathPatientsCases(db: Knex, date: string) {
  //   const sql = db('p_covid_case_details AS cd')
  //     .select('h.zone_code', 'cd.gcs_id', 'g.name as gcs_name')
  //     .count('* as count')
  //     .leftJoin('p_covid_cases as c', 'cd.covid_case_id', 'c.id')
  //     .leftJoin('p_patients as pt', 'pt.id', 'c.patient_id')
  //     .leftJoin('b_hospitals as h', 'pt.hospital_id', 'h.id')
  //     .leftJoin('b_gcs as g', 'g.id', 'cd.gcs_id')
  //     .where('cd.entry_date', date)
  //     .where('c.case_status', 'COVID')
  //     .where('cd.status', 'DEATH')
  //     .where('c.is_deleted', 'N')
  //     .groupBy('h.zone_code', 'cd.gcs_id')
  //     .orderBy('h.zone_code')

  //   return sql
  // }

  getPatientsCases(db: Knex, date: string, options: { case: string, status: string, groupBy: string, zones: string[], provinces: string[] }) {
    const sql = db('p_covid_case_details AS cd')

      .count('* as count')
      .leftJoin('p_covid_cases as c', 'cd.covid_case_id', 'c.id')
      .leftJoin('p_patients as pt', 'pt.id', 'c.patient_id')
      .leftJoin('b_hospitals as h', 'pt.hospital_id', 'h.id')
      .leftJoin('b_hospital_subministry as hs', 'hs.code', 'h.sub_ministry_code')
      // .leftJoin('b_medical_supplies as ms', 'ms.id', 'cd.medical_supplie_id')
      .leftJoin('b_gcs as g', 'g.id', 'cd.gcs_id')
      .where('cd.entry_date', date)
      // .where('c.case_status', options.case)
      .where('cd.status', options.status)
      .where('c.is_deleted', 'N')
      .whereNotNull('cd.gcs_id')
      .groupBy(options.groupBy, 'cd.gcs_id')
      .orderBy('h.zone_code')

    if (options.case == 'COVID') {
      sql.whereIn('cd.gcs_id', [1, 2, 3, 4]);
    } else if (options.case == 'IPPUI') {
      sql.where('cd.gcs_id', 5);
    } else if (options.case == 'ATK') {
      sql.where('cd.gcs_id', 7);
    }
    if (options.groupBy === 'h.zone_code') {
      sql.select('h.zone_code', 'cd.gcs_id', 'g.name as gcs_name')
    }

    if (options.groupBy === 'h.province_code') {
      sql.select('h.zone_code', 'cd.gcs_id', 'g.name as gcs_name', 'h.province_code', 'h.province_name')
    }

    if (options.groupBy === 'h.id') {
      sql.select('h.zone_code', 'cd.gcs_id', 'g.name as gcs_name', 'h.province_code', 'h.province_name', 'h.hospname', 'h.id', 'h.hospcode', 'hs.name as sub_ministry_name', 'h.level')
    }

    if (options.zones?.length > 0) {
      sql.whereIn('h.zone_code', options.zones)
    }

    if (options.provinces?.length > 0) {
      // sql.whereIn('h.zone_code', options.zones)
      sql.whereIn('h.province_code', options.provinces)
    }

    return sql
  }

  getPatientsCasesGroupByMedicalSupplies(db: Knex, date: string, options: { case: string, status: string, groupBy: string, zones: string[], provinces: string[] }) {
    const sql = db('p_covid_case_details AS cd')

      .count('* as count')
      .leftJoin('p_covid_cases as c', 'cd.covid_case_id', 'c.id')
      .leftJoin('p_patients as pt', 'pt.id', 'c.patient_id')
      .leftJoin('b_hospitals as h', 'pt.hospital_id', 'h.id')
      .leftJoin('b_hospital_subministry as hs', 'hs.code', 'h.sub_ministry_code')
      .leftJoin('b_medical_supplies as ms', 'ms.id', 'cd.medical_supplie_id')
      .where('cd.entry_date', date)
      .where('cd.status', options.status)
      .where('c.is_deleted', 'N')
      .groupBy(options.groupBy, 'cd.medical_supplie_id')
      .orderBy('h.zone_code')
    if (options.case) {
      sql.where('c.case_status', options.case)
    }
    if (options.groupBy === 'h.zone_code') {
      sql.select('h.zone_code', 'cd.medical_supplie_id', 'ms.name as ms_name')
    }

    if (options.groupBy === 'h.province_code') {
      sql.select('h.zone_code', 'cd.medical_supplie_id', 'ms.name as ms_name', 'h.province_code', 'h.province_name')
    }

    if (options.groupBy === 'h.id') {
      sql.select('h.zone_code', 'cd.medical_supplie_id', 'ms.name as ms_name', 'h.province_code', 'h.province_name', 'h.hospname', 'h.id', 'h.hospcode', 'hs.name as sub_ministry_name', 'h.level')
    }

    if (options.zones?.length > 0) {
      sql.whereIn('h.zone_code', options.zones)
    }

    if (options.provinces?.length > 0) {
      // sql.whereIn('h.zone_code', options.zones)
      sql.whereIn('h.province_code', options.provinces)
    }
    // console.log(sql.toString());

    return sql
  }

  patientReportByZone(db: Knex, date, sector, zones = []) {
    const sql = db('views_covid_case_last as cl')
      .select('vh.id as hospital_id',
        'vh.hospname',
        'vh.sub_ministry_name',
        'vh.zone_code',
        'vh.province_code',
        'vh.province_name',
        db.raw(`sum((cl.gcs_id in (1,2,3,4) or cl.gcs_id is null) ) as admit,
        sum(c.status!='ADMIT' and (cl.gcs_id in (1,2,3,4) or cl.gcs_id is null) ) as discharge,
        sum(c.status='REFER' and hr.hospital_type='HOSPITEL'  and (cl.gcs_id in (1,2,3,4) or cl.gcs_id is null)  ) as discharge_hospitel,
        sum(c.status='DEATH'  and (cl.gcs_id in (1,2,3,4) or cl.gcs_id is null)  ) as discharge_death,
        sum(cl.gcs_id = 1 ) as severe,
        sum(cl.gcs_id = 2 ) as moderater,
        sum(cl.gcs_id = 3 ) as mild,
        sum(cl.gcs_id = 4 ) as asymtomatic,
        sum(cl.gcs_id = 5 ) as pui_admit,
        sum(c.status!='ADMIT' and cl.gcs_id = 5 ) as pui_discharge,
        sum(c.status='REFER' and hr.hospital_type='HOSPITEL'  and cl.gcs_id = 5 ) as pui_discharge_hospitel,
        sum(c.status='DEATH'  and cl.gcs_id = 5 ) as pui_discharge_death,
        sum(cl.gcs_id = 6) as observe`
        ))

      .join('p_covid_cases AS c', 'c.id', 'cl.covid_case_id')
      .leftJoin('b_hospitals AS hr', 'c.hospital_id_refer', 'hr.id')
      .join('views_hospital_all as vh', 'vh.id', 'cl.hospital_id')
      .where('cl.entry_date', '<=', date)
      .where('cl.entry_date', '>=', '2020-12-15')
      .groupBy('vh.zone_code')
      .orderBy('vh.zone_code', 'ASC')

    if (zones.length > 0) {
      sql.whereIn('vh.zone_code', zones)
    }

    return sql;
  }

  patientReportByProvince(db: Knex, date, sector, provinces = []) {
    const sql = db('views_covid_case_last as cl')
      .select('vh.id as hospital_id',
        'vh.hospname',
        'vh.sub_ministry_name',
        'vh.zone_code',
        'vh.province_code',
        'vh.province_name',
        db.raw(`sum((cl.gcs_id in (1,2,3,4) or cl.gcs_id is null) ) as admit,
        sum(c.status!='ADMIT' and (cl.gcs_id in (1,2,3,4) or cl.gcs_id is null) ) as discharge,
        sum(c.status='REFER' and hr.hospital_type='HOSPITEL'  and (cl.gcs_id in (1,2,3,4) or cl.gcs_id is null)  ) as discharge_hospitel,
        sum(c.status='DEATH'  and (cl.gcs_id in (1,2,3,4) or cl.gcs_id is null)  ) as discharge_death,
        sum(cl.gcs_id = 1 ) as severe,
        sum(cl.gcs_id = 2 ) as moderater,
        sum(cl.gcs_id = 3 ) as mild,
        sum(cl.gcs_id = 4 ) as asymtomatic,
        sum(cl.gcs_id = 5 ) as pui_admit,
        sum(c.status!='ADMIT' and cl.gcs_id = 5 ) as pui_discharge,
        sum(c.status='REFER' and hr.hospital_type='HOSPITEL'  and cl.gcs_id = 5 ) as pui_discharge_hospitel,
        sum(c.status='DEATH'  and cl.gcs_id = 5 ) as pui_discharge_death,
        sum(cl.gcs_id = 6) as observe`
        ))

      .join('p_covid_cases AS c', 'c.id', 'cl.covid_case_id')
      .leftJoin('b_hospitals AS hr', 'c.hospital_id_refer', 'hr.id')
      .join('views_hospital_all as vh', 'vh.id', 'cl.hospital_id')
      .where('cl.entry_date', '<=', date)
      .where('cl.entry_date', '>=', '2020-12-15')
      .groupBy('vh.province_code')
      .orderBy('vh.zone_code', 'ASC')

    if (provinces.length > 0) {
      sql.whereIn('vh.province_code', provinces)
    }

    return sql;
  }

  patientReportByHospital(db: Knex, date, sector, hospitalIds = []) {
    const sql = db('views_covid_case_last as cl')
      .select('vh.id as hospital_id',
        'vh.hospname',
        'vh.sub_ministry_name',
        'vh.zone_code',
        'vh.province_code',
        'vh.province_name',
        db.raw(`sum((cl.gcs_id in (1,2,3,4) or cl.gcs_id is null) ) as admit,
        sum(c.status!='ADMIT' and (cl.gcs_id in (1,2,3,4) or cl.gcs_id is null) ) as discharge,
        sum(c.status='REFER' and hr.hospital_type='HOSPITEL'  and (cl.gcs_id in (1,2,3,4) or cl.gcs_id is null)  ) as discharge_hospitel,
        sum(c.status='DEATH'  and (cl.gcs_id in (1,2,3,4) or cl.gcs_id is null)  ) as discharge_death,
        sum(cl.gcs_id = 1 ) as severe,
        sum(cl.gcs_id = 2 ) as moderater,
        sum(cl.gcs_id = 3 ) as mild,
        sum(cl.gcs_id = 4 ) as asymtomatic,
        sum(cl.gcs_id = 5 ) as pui_admit,
        sum(c.status!='ADMIT' and cl.gcs_id = 5 ) as pui_discharge,
        sum(c.status='REFER' and hr.hospital_type='HOSPITEL'  and cl.gcs_id = 5 ) as pui_discharge_hospitel,
        sum(c.status='DEATH'  and cl.gcs_id = 5 ) as pui_discharge_death,
        sum(cl.gcs_id = 6) as observe`
        ))

      .join('p_covid_cases AS c', 'c.id', 'cl.covid_case_id')
      .leftJoin('b_hospitals AS hr', 'c.hospital_id_refer', 'hr.id')
      .join('views_hospital_all as vh', 'vh.id', 'cl.hospital_id')
      .where('cl.entry_date', '<=', date)
      .where('cl.entry_date', '>=', '2020-12-15')
      .groupBy('cl.hospital_id')
      .orderBy('vh.zone_code', 'ASC')

    if (hospitalIds.length > 0) {
      sql.whereIn('cl.hospital_id', hospitalIds)
    }

    return sql;
  }

  report5(db: Knex, date, sector) {
    let sub = db('views_hospital_all as vh')
      .select('vh.id as hospital_id', 'vh.hospname', 'vh.province_code', 'vh.zone_code', 'vh.sub_ministry_name', db.raw(`
      ifnull(sum( gcs_id  =1 ),0) +
      ifnull(sum( gcs_id = 2 ),0) +
      ifnull(sum( gcs_id = 3 ),0) +
      ifnull(sum( gcs_id = 4 ),0) +
      ifnull(sum( gcs_id = 5 ),0) AS sum,
      vc.updated_entry  as updated_entry`))
      .leftJoin('views_covid_case_last as vc', (v) => {
        v.on('vh.id', 'vc.hospital_id')
        v.on('vc.status', db.raw(`'ADMIT'`))
      })
      .groupBy('vh.id')
      .groupBy('vh.hospcode')
      .as('sub')

    let sql =
      db('views_hospital_all as vh')
        .select(
          'vh.province_code',
          'vh.zone_code',
          'vb.hospital_id',
          'vb.aiir_qty',
          'vb.aiir_covid_qty',
          'vb.aiir_spare_qty',
          'vb.modified_aiir_qty',
          'vb.modified_aiir_covid_qty',
          'vb.modified_aiir_spare_qty',
          'vb.isolate_qty',
          'vb.isolate_covid_qty',
          'vb.isolate_spare_qty',
          'vb.cohort_qty',
          'vb.cohort_covid_qty',
          'vb.cohort_spare_qty',
          'vb.hospitel_qty',
          'vb.hospitel_covid_qty',
          'vb.hospitel_spare_qty',
          'vb.entry_date',
          'sub.hospname',
          'sub.sum',
          'sub.updated_entry',
          'vh.hospname',
          'vh.sub_ministry_name')
        .leftJoin('views_bed_hospital_cross as vb', 'vh.id', 'vb.hospital_id')
        .leftJoin(sub, 'sub.hospital_id', 'vb.hospital_id')
        .orderBy('vh.sub_ministry_name')
    return sql;
  }

  report6(db: Knex, date, sector) {
    //   const sql = `SELECT
    //   vh.hospname,
    //   bh.level,
    //   SUM( vb.aiir_qty ) AS aiir_qty,
    //   SUM( vb.modified_aiir_qty ) AS modified_aiir_qty,
    //   SUM( vb.isolate_qty ) AS isolate_qty,
    //   SUM( vb.cohort_qty ) AS cohort_qty,
    //   SUM( vb.hospitel_qty ) AS hospitel_qty,
    //   SUM( vb.aiir_covid_qty ) AS aiir_covid_qty,
    //   SUM( vb.modified_aiir_covid_qty ) AS modified_aiir_covid_qty,
    //   SUM( vb.isolate_covid_qty ) AS isolate_covid_qty,
    //   SUM( vb.cohort_covid_qty ) AS cohort_covid_qty,
    //   SUM( vb.hospitel_covid_qty ) AS hospitel_covid_qty,
    //   SUM( vb.aiir_spare_qty ) AS aiir_spare_qty,
    //   SUM( vb.modified_aiir_spare_qty ) AS modified_aiir_spare_qty,
    //   SUM( vb.isolate_spare_qty ) AS isolate_spare_qty,
    //   SUM( vb.cohort_spare_qty ) AS cohort_spare_qty,
    //   SUM( vb.hospitel_spare_qty ) AS hospitel_spare_qty,
    //   SUM( sub.aiir_usage_qty ) AS aiir_usage_qty,
    //   SUM( sub.modified_aiir_usage_qty ) AS modified_aiir_usage_qty,
    //   SUM( sub.isolate_usage_qty ) AS isolate_usage_qty,
    //   SUM( sub.cohort_usage_qty ) AS cohort_usage_qty,
    //   SUM( sub.hospitel_usage_qty ) AS hospitel_usage_qty,
    //   vh.sub_ministry_name,
    //   vh.province_code,
    //   vh.zone_code
    // FROM
    //   views_hospital_all AS vh
    //   JOIN b_hospitals as bh ON bh.id = vh.id
    //   LEFT JOIN views_bed_hospital_cross AS vb ON vh.id = vb.hospital_id
    //   LEFT JOIN (
    //   SELECT
    //     vh.id AS hospital_id,
    //     vh.hospname,
    //     vh.sub_ministry_name,
    //     sum( bed_id = 1 ) AS aiir_usage_qty,
    //     sum( bed_id = 2 ) AS modified_aiir_usage_qty,
    //     sum( bed_id = 3 ) AS isolate_usage_qty,
    //     sum( bed_id = 4 ) AS cohort_usage_qty,
    //     sum( bed_id = 5 ) AS hospitel_usage_qty,
    //     ( SELECT max( updated_entry ) AS updated_entry_last FROM views_covid_case WHERE hospital_id = vc.hospital_id AND updated_entry IS NOT NULL ) AS updated_entry 
    //   FROM
    //     views_hospital_all AS vh
    //     LEFT JOIN views_covid_case_last AS vc ON vh.id = vc.hospital_id 
    //     AND vc.status = 'ADMIT' 
    //   GROUP BY
    //     vh.id 
    //   ) AS sub ON sub.hospital_id = vh.id 
    // GROUP BY
    //   vh.id
    // ORDER BY
    //   vh.sub_ministry_name ASC`;
    let sql = db('temp_report_all_6 as t')
      .select('t.*', 'h.hospital_type')
      .join('b_hospitals as h', 'h.id', 't.id')
    return sql;
  }

  report6Ministry(db: Knex, date, sector) {
    const sql = db('temp_report_all_6_2 as t')
    return sql;
  }

  report6Sector(db: Knex, date, sector) {
    //   const sql = `SELECT
    //   SUM( vb.aiir_qty ) AS aiir_qty,
    //   SUM( vb.modified_aiir_qty ) AS modified_aiir_qty,
    //   SUM( vb.isolate_qty ) AS isolate_qty,
    //   SUM( vb.cohort_qty ) AS cohort_qty,
    //   SUM( vb.hospitel_qty ) AS hospitel_qty,
    //   SUM( vb.aiir_covid_qty ) AS aiir_covid_qty,
    //   SUM( vb.modified_aiir_covid_qty ) AS modified_aiir_covid_qty,
    //   SUM( vb.isolate_covid_qty ) AS isolate_covid_qty,
    //   SUM( vb.cohort_covid_qty ) AS cohort_covid_qty,
    //   SUM( vb.hospitel_covid_qty ) AS hospitel_covid_qty,
    //   SUM( vb.aiir_spare_qty ) AS aiir_spare_qty,
    //   SUM( vb.modified_aiir_spare_qty ) AS modified_aiir_spare_qty,
    //   SUM( vb.isolate_spare_qty ) AS isolate_spare_qty,
    //   SUM( vb.cohort_spare_qty ) AS cohort_spare_qty,
    //   SUM( vb.hospitel_spare_qty ) AS hospitel_spare_qty,
    //   SUM( sub.aiir_usage_qty ) AS aiir_usage_qty,
    //   SUM( sub.modified_aiir_usage_qty ) AS modified_aiir_usage_qty,
    //   SUM( sub.isolate_usage_qty ) AS isolate_usage_qty,
    //   SUM( sub.cohort_usage_qty ) AS cohort_usage_qty,
    //   SUM( sub.hospitel_usage_qty ) AS hospitel_usage_qty,
    //   vh.zone_code
    // FROM
    //   views_hospital_all AS vh
    //   LEFT JOIN views_bed_hospital_cross AS vb ON vh.id = vb.hospital_id
    //   LEFT JOIN (
    //   SELECT
    //     vh.id AS hospital_id,
    //     vh.hospname,
    //     vh.sub_ministry_name,
    //     sum( bed_id = 1 ) AS aiir_usage_qty,
    //     sum( bed_id = 2 ) AS modified_aiir_usage_qty,
    //     sum( bed_id = 3 ) AS isolate_usage_qty,
    //     sum( bed_id = 4 ) AS cohort_usage_qty,
    //     sum( bed_id = 5 ) AS hospitel_usage_qty,
    //     sum( bed_id = 7 ) AS cohort_icu_usage_qty,
    //     ( SELECT max( updated_entry ) AS updated_entry_last FROM views_covid_case WHERE hospital_id = vc.hospital_id AND updated_entry IS NOT NULL ) AS updated_entry 
    //   FROM
    //     views_hospital_all AS vh
    //     LEFT JOIN views_covid_case_last AS vc ON vh.id = vc.hospital_id 
    //     AND vc.status = 'ADMIT' 
    //   GROUP BY
    //     vh.id 
    //   ) AS sub ON sub.hospital_id = vh.id 
    // GROUP BY
    //   vh.zone_code 
    // ORDER BY
    //   vh.zone_code ASC`
    //   return db.raw(sql);
    let sql = db('temp_report_all_6_1')
    return sql;
  }

  report7(db: Knex, date, sector) {
    let sub = db('views_hospital_all as vh')
      .select('vh.id as hospital_id', 'vh.hospname', 'vh.sub_ministry_name', db.raw(`
      sum( medical_supplie_id = 1 ) AS invasive_ventilator,
      sum( medical_supplie_id = 2 ) AS non_invasive_ventilator,
      sum( medical_supplie_id = 3 ) AS high_flow,
      sum( medical_supplie_id = 5 ) AS papr,
vc.updated_entry  as updated_entry`))
      .leftJoin('views_covid_case_last as vc', (v) => {
        v.on('vh.id', 'vc.hospital_id')
        v.on('vc.status', db.raw(`'ADMIT'`))
      })
      .groupBy('vh.id')
      .as('sub')

    let sql =
      db('views_hospital_all  as vh')
        .select('vb.*', 'sub.*', 'vh.hospname', 'vh.sub_ministry_name')
        .leftJoin('temp_views_medical_supplies_hospital_cross as vb', 'vh.id', 'vb.hospital_id')
        .leftJoin(sub, 'sub.hospital_id', 'vh.id')
        .orderBy('vh.sub_ministry_name')
    return sql;
  }

  report7Ministry(db: Knex, date, sector) {
    const sql = `SELECT
      SUM(vb.invasive_qty) AS invasive_qty,
      SUM(vb.non_invasive_qty) AS non_invasive_qty,
      SUM(vb.high_flow_qty) AS high_flow_qty,
      SUM(vb.papr_qty) AS papr_qty,
      SUM(vb.invasive_covid_qty) AS invasive_covid_qty,
      SUM(vb.non_invasive_covid_qty) AS non_invasive_covid_qty,
      SUM(vb.high_flow_covid_qty) AS high_flow_covid_qty,
      SUM(vb.papr_covid_qty) AS papr_covid_qty,
      SUM(sub.invasive_ventilator) AS invasive_ventilator,
      SUM(sub.non_invasive_ventilator) AS non_invasive_ventilator,
      SUM(sub.high_flow) AS high_flow,
      SUM(sub.papr) AS papr,
      vh.sub_ministry_name
    FROM
      views_hospital_all AS vh
      LEFT JOIN temp_views_medical_supplies_hospital_cross AS vb ON vh.id = vb.hospital_id
      LEFT JOIN (
      SELECT
        vh.id AS hospital_id,
        vh.hospname,
        vh.sub_ministry_name,
        sum( medical_supplie_id = 1 ) AS invasive_ventilator,
        sum( medical_supplie_id = 2 ) AS non_invasive_ventilator,
        sum( medical_supplie_id = 3 ) AS high_flow,
        sum( medical_supplie_id = 5 ) AS papr,
        vc.updated_entry AS updated_entry 
      FROM
        views_hospital_all AS vh
        LEFT JOIN views_covid_case_last AS vc ON vh.id = vc.hospital_id 
        AND vc.status = 'ADMIT' 
      GROUP BY
        vh.id 
      ) AS sub ON sub.hospital_id = vh.id 
      GROUP BY vh.sub_ministry_name
    ORDER BY
      vh.sub_ministry_name ASC`

    return db.raw(sql);
  }

  report7Sector(db: Knex, date, sector) {
    const sql = `SELECT
      SUM(vb.invasive_qty) AS invasive_qty,
      SUM(vb.non_invasive_qty) AS non_invasive_qty,
      SUM(vb.high_flow_qty) AS high_flow_qty,
      SUM(vb.papr_qty) AS papr_qty,
      SUM(vb.invasive_covid_qty) AS invasive_covid_qty,
      SUM(vb.non_invasive_covid_qty) AS non_invasive_covid_qty,
      SUM(vb.high_flow_covid_qty) AS high_flow_covid_qty,
      SUM(vb.papr_covid_qty) AS papr_covid_qty,
      SUM(sub.invasive_ventilator) AS invasive_ventilator,
      SUM(sub.non_invasive_ventilator) AS non_invasive_ventilator,
      SUM(sub.high_flow) AS high_flow,
      SUM(sub.papr) AS papr,
      vh.zone_code
    FROM
      views_hospital_all AS vh
      LEFT JOIN temp_views_medical_supplies_hospital_cross AS vb ON vh.id = vb.hospital_id
      LEFT JOIN (
      SELECT
        vh.id AS hospital_id,
        vh.hospname,
        vh.sub_ministry_name,
        sum( medical_supplie_id = 1 ) AS invasive_ventilator,
        sum( medical_supplie_id = 2 ) AS non_invasive_ventilator,
        sum( medical_supplie_id = 3 ) AS high_flow,
        sum( medical_supplie_id = 5 ) AS papr,
        vc.updated_entry AS updated_entry 
      FROM
        views_hospital_all AS vh
        LEFT JOIN views_covid_case_last AS vc ON vh.id = vc.hospital_id 
        AND vc.status = 'ADMIT' 
      GROUP BY
        vh.id 
      ) AS sub ON sub.hospital_id = vh.id 
      GROUP BY vh.zone_code
    ORDER BY
      vh.zone_code ASC`

    return db.raw(sql);
  }

  report8(db: Knex, date, sector) {
    const sql = db('views_supplies_hospital_cross as v')
      .select('v.*', 'vh.hospname', 'vh.sub_ministry_name')
      .join('views_hospital_all as vh', 'vh.id', 'v.hospital_id')
    return sql;
  }

  report9(db: Knex, date, sector) {
    const sql = db('views_professional_hospital_cross as v')
      .select('v.*', 'vh.hospname', 'vh.sub_ministry_name')
      .join('views_hospital_all as vh', 'vh.id', 'v.hospital_id')
    return sql;
  }

  report10(db: Knex, date, sector) {
    const sql = db('views_professional_hospital_cross as v')
      .select('v.*', 'vh.hospname', 'vh.sub_ministry_name')
      .join('views_hospital_all as vh', 'vh.id', 'v.hospital_id')
    return sql;
  }

  getHospitalByType(db: Knex) {
    return db('b_hospitals AS bh')
      .join('views_hospital_types as vht', 'vht.hospcode', 'bh.hospcode')
      .where('vht.type', 'B')
  }

  getBad(db: Knex) {
    return db('views_bed_hospitals AS vbh')
  }

  getBed(db: Knex) {
    return db('b_beds as b')
      .select('b.id', 'b.name')
      .orderBy('b.id', 'desc')
      .where('b.is_deleted', 'N')
  }

  homework(db: Knex, type) {
    return db('views_review_homework_dms as v')
      .select('*')
      .join('views_hospital_all as vh', 'v.hospcode', 'vh.hospcode')
      .where('vh.sector', type)
  }

  getBedHospital(db: Knex) {
    return db('b_bed_hospitals as bh')
      .select('bh.covid_qty', 'bh.qty', 'bh.bed_id', 'bh.hospital_id', 'b.name as bed_name', 'h.province_name', 'h.hospcode', 'h.hospname', 'hs.name as sub_ministry_name', 'h.zone_code')
      .join('b_beds as b', 'b.id', 'bh.bed_id')
      .join('b_hospitals as h', 'h.id', 'bh.hospital_id')
      .leftJoin('b_hospital_subministry as hs', 'hs.code', 'h.sub_ministry_code')
      .where('h.is_deleted', 'N')
      .orderBy('h.zone_code')
      .orderBy('h.province_name')
      .orderBy('h.hospname')
  }

}