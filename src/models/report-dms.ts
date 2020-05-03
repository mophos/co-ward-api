import Knex = require('knex');
import * as moment from 'moment';
import { join } from 'bluebird';

export class ReportDmsModel {
  report1(db: Knex, sector) {
    let sub = db('views_hospital_types AS ht')
      .select('ht.hospital_id', 'ht.hospcode', 'bh.create_date',
        db.raw(`sum( IF ( bh.bed_id = 1, bh.qty, 0 ) ) AS aiir_qty`),
        db.raw(`sum( IF ( bh.bed_id = 2, bh.qty, 0 ) ) AS modified_aiir_qty`),
        db.raw(`sum( IF ( bh.bed_id = 3, bh.qty, 0 ) ) AS isolate_qty`),
        db.raw(`sum( IF ( bh.bed_id = 4, bh.qty, 0 ) ) AS cohort_qty`),
        db.raw(`sum( IF ( bh.bed_id = 5, bh.qty, 0 ) ) AS hospitel_qty`))
      .leftJoin('b_bed_hospitals AS bh', 'ht.hospital_id', 'bh.hospital_id')
      .join('views_hospital_dms as vh', 'vh.id', 'ht.hospital_id')
      .where('ht.type', 'B')
      .where('vh.sector', sector)
      .groupBy('ht.hospital_id').as('q')

    let sql = db(sub)
      .select('vh.sub_ministry_name',
        db.raw(`COUNT( * ) AS hospital_qty`),
        db.raw(`sum( q.aiir_qty ) + sum( q.modified_aiir_qty ) + sum( q.isolate_qty ) + sum( q.cohort_qty ) + sum( q.hospitel_qty ) AS bed_qty`),
        db.raw(`sum( q.aiir_qty ) AS aiir_qty`),
        db.raw(`sum( q.modified_aiir_qty ) AS modified_aiir_qty`),
        db.raw(`sum( q.isolate_qty ) AS isolate_qty`),
        db.raw(`sum( q.cohort_qty ) AS cohort_qty`),
        db.raw(`sum( q.hospitel_qty ) AS hospitel_qty`))
      .leftJoin('b_hospitals AS h', 'h.id', 'q.q.hospital_id')
      .join('views_hospital_dms as vh', 'vh.id', 'h.id')
      .where('vh.sector', sector)
      .groupBy('vh.sub_ministry_code')

    return sql;
  }

  report2(db: Knex, date, sector) {
    // return db('views_case_hospital_date_cross as v')
    //   .select('v.*', 'h.hospname', 'vh.sub_ministry_name')
    //   .join('b_hospitals as h', 'h.id', 'v.hospital_id')
    //   .join('views_hospital_dms as vh', 'vh.id', 'v.hospital_id')
    //   .where('vh.sector', sector)
    //   .where('v.entry_date', date)
    //   .where('v.status', 'ADMIT')

    let sub = db('views_case_hospital_date_cross')
      .max('entry_date as entry_date')
      .select('hospital_id')
      .where('entry_date', '<=', date)
      .where('status', 'ADMIT')
      .groupBy('hospital_id')
      .as('sub')

    return db(sub)
      .select('v.*', 'vh.hospname', 'vh.sub_ministry_name')
      .join('views_case_hospital_date_cross as v', (v) => {
        v.on('v.hospital_id', 'sub.hospital_id')
        v.on('v.entry_date', 'sub.entry_date')
      })
      .join('views_hospital_dms as vh', 'vh.id', 'v.hospital_id')
      .where('v.status', 'ADMIT')
      .where('vh.sector', sector)



  }

  report3(db: Knex, date, sector) {
    let sub = db('views_case_hospital_date_cross')
      .max('entry_date as entry_date')
      .select('hospital_id')
      .where('entry_date', '<=', date)
      .where('status', 'ADMIT')
      .groupBy('hospital_id')
      .as('sub')

    return db(sub)
      .select('v.*', 'vh.hospname', 'vh.sub_ministry_name')
      .join('views_case_hospital_date_cross as v', (v) => {
        v.on('v.hospital_id', 'sub.hospital_id')
        v.on('v.entry_date', 'sub.entry_date')
      })
      .join('views_hospital_dms as vh', 'vh.id', 'v.hospital_id')
      .where('v.status', 'ADMIT')
      .where('vh.sector', sector)
  }

  report4(db: Knex, date) {
    return db('views_case_hospital_dates as v')
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
      JOIN views_case_hospital_dates AS vcs ON ht.hospital_id = vcs.hospital_id 
      WHERE ht.type = 'B' AND vcs.entry_date <= ? 
      GROUP BY
      ht.hospital_id,
      vcs.entry_date) as a ON v.hospital_id = a.hospital_id`, date)
      .join('b_hospitals AS h', 'a.hospital_id', 'h.id')
      .leftJoin('b_hospitals AS hr', 'v.hospital_id_refer', 'h.id')
      .joinRaw(`JOIN b_hospital_ministry_types as ht on ht.id = h.hosptype_id AND v.entry_date = a.entry_date`)
      .where('v.status', 'ADMIT')
      .groupBy('v.hospital_id', 'v.entry_date')
  }

  report5(db: Knex, date, sector) {
    return db('views_bed_hopital_cross as vc')
      .leftJoin('views_bed_hospital_date_cross AS vb', (v) => {
        v.on('vc.hospital_id ', 'vb.hospital_id')
          .on('vb.entry_date', db.raw(`${date}`))
      })
      .join('views_hospital_dms as vh', 'vh.id', 'vc.hospital_id')
      .where('vh.sector', sector)
  }

  report6(db: Knex, date, sector) {
    return db('views_bed_hopital_cross as vc')
      .leftJoin('views_bed_hospital_date_cross AS vb', (v) => {
        v.on('vc.hospital_id ', 'vb.hospital_id')
          .on('vb.entry_date', db.raw(`${date}`))
      })
      .join('views_hospital_dms as vh', 'vh.id', 'vc.hospital_id')
      .where('vh.sector', sector)
  }

  report7(db: Knex, date, sector) {
    return db('views_medical_supplies_hospital_cross as v')
      .select('v.*', 'vh.hospname', 'vh.sub_ministry_name')
      .join('views_hospital_dms as vh', 'vh.id', 'v.hospital_id')
      .where('vh.sector', sector)
  }
  report8(db: Knex, date, sector) {
    return db('views_supplies_hospital_cross as v')
      .select('v.*', 'vh.hospname', 'vh.sub_ministry_name')
      .join('views_hospital_dms as vh', 'vh.id', 'v.hospital_id')
      .where('vh.sector', sector)
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

  homework(db: Knex, type) {
    return db('views_review_homework_dms as v')
      .select('*')
      .join('views_hospital_dms as vh', 'v.hospcode', 'vh.hospcode')
      .where('vh.sector', type)
  }

}