import Knex = require('knex');
import * as moment from 'moment';
import { join } from 'bluebird';

export class ReportDmsModel {
  report1(db: Knex, date) {
    return db('views_case_hospital_date_cross as v')
      .select('v.*', 'h.hospname')
      .join('b_hospitals as h', 'h.id', 'v.hospital_id')
      .where('v.entry_date', date)
  }

  report2(db: Knex, date) {
    return db('views_case_hospital_date_cross as v')
      .select('v.*', 'h.hospname')
      .join('b_hospitals as h', 'h.id', 'v.hospital_id')
      .where('v.entry_date', date)
  }

  report3(db: Knex, date) {
    return db('views_case_hospital_date_cross as v')
      .select('v.*', 'h.hospname','ht.name as hosp_sub_min_name')
      .join('b_hospitals as h', 'h.id', 'v.hospital_id')
      .leftJoin('b_hospital_subministry as ht', 'ht.code', 'h.sub_ministry_code')
      .where('v.entry_date', date)
  }

  report4(db: Knex, date) {
    return db('views_case_hospital_date_cross as v')
      .select('v.*', 'h.hospname')
      .join('b_hospitals as h', 'h.id', 'v.hospital_id')
      .where('v.entry_date', date)
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

}