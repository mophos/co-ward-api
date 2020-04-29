import Knex = require('knex');
import * as moment from 'moment';
import { join } from 'bluebird';

export class ReportDmsModel {
  report1(db: Knex) {

    let sub = db('views_hospital_types AS ht')
      .select('ht.hospital_id', 'ht.hospcode', 'bh.create_date',
        db.raw(`sum( IF ( bh.bed_id = 1, bh.qty, 0 ) ) AS aiir_qty`),
        db.raw(`sum( IF ( bh.bed_id = 2, bh.qty, 0 ) ) AS modified_aiir_qty`),
        db.raw(`sum( IF ( bh.bed_id = 3, bh.qty, 0 ) ) AS isolate_qty`),
        db.raw(`sum( IF ( bh.bed_id = 4, bh.qty, 0 ) ) AS cohort_qty`),
        db.raw(`sum( IF ( bh.bed_id = 5, bh.qty, 0 ) ) AS hospitel_qty`))
      .leftJoin('b_bed_hospitals AS bh', 'ht.hospital_id', 'bh.hospital_id')
      .where('ht.type', 'B')
      .groupBy('ht.hospital_id').as('q')

    let sql = db(sub)
      .select('hm.name',
        db.raw(`COUNT( * ) AS hospital_qty`),
        db.raw(`sum( q.aiir_qty ) + sum( q.modified_aiir_qty ) + sum( q.isolate_qty ) + sum( q.cohort_qty ) + sum( q.hospitel_qty ) AS bed_qty`),
        db.raw(`sum( q.aiir_qty ) AS aiir_qty`),
        db.raw(`sum( q.modified_aiir_qty ) AS modified_aiir_qty`),
        db.raw(`sum( q.isolate_qty ) AS isolate_qty`),
        db.raw(`sum( q.cohort_qty ) AS cohort_qty`),
        db.raw(`sum( q.hospitel_qty ) AS hospitel_qty`))
      .leftJoin('b_hospitals AS h', 'h.id', 'q.q.hospital_id')
      .leftJoin('b_hospital_ministry_types AS hm', 'hm.id', 'h.hosptype_id')
      .groupBy('h.hosptype_id')

    return sql;
  }

  report2(db: Knex, date) {
    return db('views_case_hospital_date_cross as v')
      .select('v.*', 'h.hospname', 'ht.name as hosp_sub_min_name')
      .join('b_hospitals as h', 'h.id', 'v.hospital_id')
      .leftJoin('b_hospital_subministry as ht', 'ht.code', 'h.sub_ministry_code')
      .where('v.entry_date', date)
  }

  report3(db: Knex, date) {
    return db('views_case_hospital_date_cross as v')
      .select('v.*', 'h.hospname', 'ht.name as hosp_sub_min_name')
      .join('b_hospitals as h', 'h.id', 'v.hospital_id')
      .leftJoin('b_hospital_subministry as ht', 'ht.code', 'h.sub_ministry_code')
      .where('v.entry_date', date)
  }

  report4(db: Knex, date) {
    return db('views_case_hospital_date_total as v')
      .select(`ht.name as sub_ministry_name`, `h.hospname`,
        `v.hospital_id`,
        `v.entry_date`,
        db.raw(`sum(IF(v.STATUS = 'ADMIT' AND v.gcs_id != 5, v.qty_total, 0)) AS admit,
        sum(IF(v.STATUS != 'ADMIT' AND v.gcs_id != 5, v.qty_total, 0)) AS discharge_total,
        sum(IF(v.STATUS = 'REFER' AND h.hospital_type = 'HOSPITEL' AND v.gcs_id != 5, v.qty_total, 0)) AS discharge_refer_hospitel,
        sum(IF(v.STATUS = 'DEATH' AND v.gcs_id != 5, v.qty_total, 0)) AS discharge_death,
        sum(IF(v.STATUS = 'ADMIT' AND v.gcs_id = 5, v.qty_total, 0)) AS pui_admit,
        sum(IF(v.STATUS != 'ADMIT' AND v.gcs_id = 5, v.qty_total, 0)) AS pui_discharge_total,
        sum(IF(v.STATUS = 'REFER' AND h.hospital_type = 'HOSPITEL' AND v.gcs_id = 5, v.qty_total, 0)) AS pui_discharge_refer_hospitel,
        sum(IF(v.STATUS = 'DEATH' AND v.gcs_id = 5, v.qty_total, 0)) AS pui_death`))
      .joinRaw(`JOIN (SELECT ht.hospital_id,max( vcs.entry_date ) AS entry_date 
      FROM views_hospital_types AS ht 
      JOIN views_case_hospital_date_total AS vcs ON ht.hospital_id = vcs.hospital_id 
      WHERE ht.type = 'B' AND vcs.entry_date <= ? 
      GROUP BY
      ht.hospital_id,
      vcs.entry_date) as a ON v.hospital_id = a.hospital_id`, date)
      .join('b_hospitals AS h', 'a.hospital_id', 'h.id')
      .leftJoin('b_hospitals AS hr', 'v.hospital_id_refer', 'h.id')
      .joinRaw(`JOIN b_hospital_ministry_types as ht on ht.id = h.hosptype_id AND v.entry_date = a.entry_date`)
      .groupBy('v.hospital_id', 'v.entry_date')
  }

  report5(db: Knex, date) {
    return db('views_case_hospital_date_cross as v')
      .select('v.*', 'h.hospname')
      .join('b_hospitals as h', 'h.id', 'v.hospital_id')
      .where('v.entry_date', date)
  }

  report6(db: Knex, date) {
    return db('views_case_hospital_date_cross as v')
      .select('v.*', 'h.hospname')
      .join('b_hospitals as h', 'h.id', 'v.hospital_id')
      .where('v.entry_date', date)
  }

  report7(db: Knex, date) {
    return db('views_case_hospital_date_cross as v')
      .select('v.*', 'h.hospname')
      .join('b_hospitals as h', 'h.id', 'v.hospital_id')
      .where('v.entry_date', date)
  }

  report8(db: Knex, date) {
    return db('views_case_hospital_date_cross as v')
      .select('v.*', 'h.hospname')
      .join('b_hospitals as h', 'h.id', 'v.hospital_id')
      .where('v.entry_date', date)
  }

  report9(db: Knex, date) {
    return db('views_case_hospital_date_cross as v')
      .select('v.*', 'h.hospname')
      .join('b_hospitals as h', 'h.id', 'v.hospital_id')
      .where('v.entry_date', date)
  }

  report10(db: Knex, date) {
    return db('views_case_hospital_date_cross as v')
      .select('v.*', 'h.hospname')
      .join('b_hospitals as h', 'h.id', 'v.hospital_id')
      .where('v.entry_date', date)
  }

  getHospitalByType(db: Knex) {
    return db('b_hospitals AS bh')
      .join('views_hospital_types as vht', 'vht.hospcode', 'bh.hospcode')
      .where('vht.type', 'B')
  }

  getBad(db: Knex) {
    return db('views_bed_hospitals AS vbh')
  }

}