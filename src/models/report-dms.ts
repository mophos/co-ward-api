import Knex = require('knex');
import * as moment from 'moment';
import { join } from 'bluebird';

export class ReportDmsModel {

  report1(db: Knex, date: any, sector: any) {
    return db('views_bed_hospital_cross as vc')
      .select('vc.*', 'vh.*')
      .count('* as hospital_qty')
      .join('views_hospital_dms as vh', 'vh.id', 'vc.hospital_id')
      .where('vh.sector', sector)
      .groupBy('vh.sub_ministry_code')
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
      .where('entry_date', '=', date)
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

  report4(db: Knex, date, sector) {
    return db('views_covid_case_last as cl')
      .select('vh.id as hospital_id',
        'vh.hospname',
        'vh.sub_ministry_name',
        db.raw(`sum((cl.gcs_id != 5 or cl.gcs_id is null) ) as admit,
        sum(c.status!='ADMIT' and (cl.gcs_id != 5 or cl.gcs_id is null) ) as discharge,
        sum(c.status='REFER' and hr.hospital_type='HOSPITEL'  and (cl.gcs_id != 5 or cl.gcs_id is null)  ) as discharge_hospitel,
        sum(c.status='DEATH'  and (cl.gcs_id != 5 or cl.gcs_id is null)  ) as discharge_death,
        
        sum(cl.gcs_id = 5 ) as pui_admit,
        sum(c.status!='ADMIT' and cl.gcs_id = 5 ) as pui_discharge,
        sum(c.status='REFER' and hr.hospital_type='HOSPITEL'  and cl.gcs_id = 5 ) as pui_discharge_hospitel,
        sum(c.status='DEATH'  and cl.gcs_id = 5 ) as pui_discharge_death`))

      .join('p_covid_cases AS c', 'c.id', 'cl.covid_case_id')
      .leftJoin('b_hospitals AS hr', 'c.hospital_id_refer', 'hr.id')
      .join('views_hospital_dms as vh', 'vh.id', 'cl.hospital_id')
      .where('cl.entry_date', '<=', date)
      .where('vh.sector', sector)
      .groupBy('cl.hospital_id')
  }

  report5(db: Knex, date, sector) {
    return db('views_bed_hospital_cross as vc')
      .leftJoin('views_bed_hospital_date_cross AS vb', (v) => {
        v.on('vc.hospital_id ', 'vb.hospital_id')
          .on('vb.entry_date', db.raw(`'${date}'`))
      })
      .join('views_hospital_dms as vh', 'vh.id', 'vc.hospital_id')
      .where('vh.sector', sector)
  }

  report6(db: Knex, date, sector) {
    return db('views_bed_hospital_cross as vc')
      .leftJoin('views_bed_hospital_date_cross AS vb', (v) => {
        v.on('vc.hospital_id ', 'vb.hospital_id')
          .on('vb.entry_date', db.raw(`'${date}'`))
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

  report9(db: Knex, date, sector) {
    return db('views_professional_hospital_cross as v')
      .select('v.*', 'vh.hospname', 'vh.sub_ministry_name')
      .join('views_hospital_dms as vh', 'vh.id', 'v.hospital_id')
      .where('vh.sector', sector)
  }

  report10(db: Knex, date, sector) {
    return db('views_professional_hospital_cross as v')
      .select('v.*', 'vh.hospname', 'vh.sub_ministry_name')
      .join('views_hospital_dms as vh', 'vh.id', 'v.hospital_id')
      .where('vh.sector', sector)
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