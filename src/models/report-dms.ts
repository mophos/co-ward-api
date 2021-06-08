import Knex = require('knex');
export class ReportDmsModel {
  report1(db: Knex, date: any, sector: any) {
    const sql = db('views_bed_hospital_cross as vc')
      .select('vc.*', 'vh.*')
      .count('* as hospital_qty')
      .sum('aiir_qty as aiir_qty')
      .sum('modified_aiir_qty as modified_aiir_qty')
      .sum('isolate_qty as isolate_qty')
      .sum('cohort_qty as cohort_qty')
      .sum('hospitel_qty as hospitel_qty')
      .join('views_hospital_dms as vh', 'vh.id', 'vc.hospital_id')
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

    // let sub = db('views_case_hospital_date_cross')
    //   .max('entry_date as entry_date')
    //   .select('hospital_id')
    //   .where('entry_date', '<=', date)
    //   .where('status', 'ADMIT')
    //   .groupBy('hospital_id')
    //   .as('sub')

    // let sql =
    //   db('views_hospital_dms as vh')
    //     .select('v.*', 'vh.hospname', 'vh.sub_ministry_name')
    //     .leftJoin(sub, 'sub.hospital_id', 'vh.id')
    //     .leftJoin('views_case_hospital_date_cross as v', (v) => {
    //       v.on('v.hospital_id', 'sub.hospital_id')
    //       v.on('v.entry_date', 'sub.entry_date')
    //       v.on('v.status', db.raw(`'ADMIT'`))
    //     })
    //     // .join('views_hospital_dms as vh', 'vh.id', 'v.hospital_id')
    //     // .where('v.status', 'ADMIT')
    //     .where('vh.sector', sector)
    //     .orderBy('vh.sub_ministry_name')
    // return sql;

    const last = db('views_covid_case')
      .max('updated_entry as updated_entry_last')
      .whereRaw('hospital_id=vc.hospital_id')
      .whereNotNull('updated_entry')
      .as('updated_entry')

    const sql = db('views_hospital_dms as vh')
      .select('vh.id', 'vh.hospname', 'vh.sub_ministry_name', db.raw(`
      sum( gcs_id = 1 ) AS severe,
      sum( gcs_id = 2 ) AS moderate,
      sum( gcs_id = 3 ) AS mild,
      sum( gcs_id = 4 ) AS asymptomatic,
      sum( gcs_id = 5 ) AS ip_pui,
      sum( gcs_id = 6 ) AS observe`), last)
      .leftJoin('views_covid_case_last as vc', (v) => {
        v.on('vh.id', 'vc.hospital_id')
        v.on('vc.status', db.raw(`'ADMIT'`))
      })
      .where('vh.sector', sector)
      .groupBy('vh.id')
    return sql;
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
      .select('v.*', 'vh.hospname', 'vh.sub_ministry_name')
      .join('views_case_hospital_date_cross as v', (v) => {
        v.on('v.hospital_id', 'sub.hospital_id')
        v.on('v.entry_date', 'sub.entry_date')
      })
      .join('views_hospital_dms as vh', 'vh.id', 'v.hospital_id')
      .where('v.status', 'ADMIT')
      .where('vh.sector', sector)
      .orderBy('vh.sub_ministry_name')
    return sql;

  }

  report4(db: Knex, date, sector) {
    const sql = db('views_covid_case_last as cl')
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
        sum(c.status='DEATH'  and cl.gcs_id = 5 ) as pui_discharge_death,
        sum(cl.gcs_id = 6) as observe`))

      .join('p_covid_cases AS c', 'c.id', 'cl.covid_case_id')
      .leftJoin('b_hospitals AS hr', 'c.hospital_id_refer', 'hr.id')
      .join('views_hospital_dms as vh', 'vh.id', 'cl.hospital_id')
      .where('cl.entry_date', '<=', date)
      .where('vh.sector', sector)
      .groupBy('cl.hospital_id')
    return sql;
  }

  report5(db: Knex, date, sector) {
    // return db('views_bed_hospital_cross as vc')
    //   .leftJoin('views_bed_hospital_date_cross AS vb', (v) => {
    //     v.on('vc.hospital_id ', 'vb.hospital_id')
    //       .on('vb.entry_date', db.raw(`'${date}'`))
    //   })
    //   .join('views_hospital_dms as vh', 'vh.id', 'vc.hospital_id')
    //   .where('vh.sector', sector)
    let sub = db('views_hospital_dms as vh')
      .select('vh.id as hospital_id', 'vh.hospname', 'vh.sub_ministry_name', db.raw(`
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
      .where('vh.sector', sector)
      .groupBy('vh.id')
      .as('sub')

    let sql =
      db('views_hospital_dms  as vh')
        .select('vb.*', 'sub.*', 'vh.hospname', 'vh.sub_ministry_name')
        .leftJoin('views_bed_hospital_cross as vb', 'vh.id', 'vb.hospital_id')
        .leftJoin(sub, 'sub.hospital_id', 'vb.hospital_id')
        // .leftJoin('views_case_hospital_date_cross as v', (v) => {
        //   v.on('v.hospital_id', 'sub.hospital_id')
        //   v.on('v.entry_date', 'sub.entry_date')
        //   v.on('v.status', db.raw(`'ADMIT'`))
        // })
        .where('vh.sector', sector)
        .orderBy('vh.sub_ministry_name')
    return sql;
  }

  report6(db: Knex, date, sector) {
    // return db('views_bed_hospital_cross as vc')
    //   .leftJoin('views_bed_hospital_date_cross AS vb', (v) => {
    //     v.on('vc.hospital_id ', 'vb.hospital_id')
    //       .on('vb.entry_date', db.raw(`'${date}'`))
    //   })
    //   .join('views_hospital_dms as vh', 'vh.id', 'vc.hospital_id')
    //   .where('vh.sector', sector)
    //   .orderBy('vh.sub_ministry_name')
    const last = db('views_covid_case')
      .max('updated_entry as updated_entry_last')
      .whereRaw('hospital_id=vc.hospital_id')
      .whereNotNull('updated_entry')
      .as('updated_entry')

    let sub = db('views_hospital_dms as vh')
      .select('vh.id as hospital_id', 'vh.hospname', 'vh.sub_ministry_name', db.raw(`
sum( bed_id  =1 ) as aiir_usage_qty,
sum( bed_id = 2 ) as modified_aiir_usage_qty,
sum( bed_id = 3 ) as isolate_usage_qty,
sum( bed_id = 4 ) as cohort_usage_qty,
sum( bed_id = 5 ) AS hospitel_usage_qty,
sum( bed_id = 7 ) AS cohort_icu_usage_qty`), last)
      .leftJoin('views_covid_case_last as vc', (v) => {
        v.on('vh.id', 'vc.hospital_id')
        v.on('vc.status', db.raw(`'ADMIT'`))
      })
      .where('vh.sector', sector)
      .groupBy('vh.id')
      .as('sub')

    let sql =
      db('views_hospital_dms  as vh')
        .select('vb.*', 'sub.*', 'vh.hospname', 'vh.sub_ministry_name', 'h.level', 'h.hospital_type')
        .leftJoin('views_bed_hospital_cross as vb', 'vh.id', 'vb.hospital_id')
        .leftJoin(sub, 'sub.hospital_id', 'vh.id')
        .join('b_hospitals as h', 'h.id', 'vh.id')
        .where('vh.sector', sector)
        .orderBy('vh.sub_ministry_name')
    return sql;
  }

  report7(db: Knex, date, sector) {
    let sub = db('views_hospital_dms as vh')
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
      .where('vh.sector', sector)
      .groupBy('vh.id')
      .as('sub')

    let sql =
      db('views_hospital_dms  as vh')
        .select('vb.*', 'sub.*', 'vh.hospname', 'vh.sub_ministry_name')
        .leftJoin('temp_views_medical_supplies_hospital_cross as vb', 'vh.id', 'vb.hospital_id')
        .leftJoin(sub, 'sub.hospital_id', 'vh.id')
        .where('vh.sector', sector)
        .orderBy('vh.sub_ministry_name')
    return sql;
  }

  report8(db: Knex, date, sector) {
    const sql = db('views_supplies_hospital_cross as v')
      .select('v.*', 'vh.hospname', 'vh.sub_ministry_name')
      .join('views_hospital_dms as vh', 'vh.id', 'v.hospital_id')
      .where('vh.sector', sector)
    return sql;
  }

  report9(db: Knex, date, sector) {
    const sql = db('views_professional_hospital_cross as v')
      .select('v.*', 'vh.hospname', 'vh.sub_ministry_name')
      .join('views_hospital_dms as vh', 'vh.id', 'v.hospital_id')
      .where('vh.sector', sector)
    return sql;
  }

  report10(db: Knex, date, sector) {
    const sql = db('views_professional_hospital_cross as v')
      .select('v.*', 'vh.hospname', 'vh.sub_ministry_name')
      .join('views_hospital_dms as vh', 'vh.id', 'v.hospital_id')
      .where('vh.sector', sector)
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

  homework(db: Knex, type) {
    const sql = db('views_review_homework_dms as v')
      .select('*')
      .join('views_hospital_dms as vh', 'v.hospcode', 'vh.hospcode')
      .where('vh.sector', type)
    return sql;

  }

}