import * as Knex from 'knex';

export class EocModel {

  beds(db: Knex, date) {
    const _date = `%${date}%`
    let sql = db('chospital as ch')
      .select('ch.short_hospcode as hospcode', 'ch.hospname as hospname', 'eoc.eoc_AIIR', 'eoc.eoc_AIIRUsed', 'eoc.eoc_ModifiedAIIR', 'eoc.eoc_ModifiedAIIRUsed', 'eoc.eoc_IsolationRoom', 'eoc.eoc_IsolationRoomUsed', 'eoc.eoc_cohortWard', 'eoc.eoc_cohortWardUsed',
        'ch.zone_code',
        'ch.province_code',
        'ch.province_name',
        'eoc.eoc_resource_entrydate',
        db.raw(`(select max(resource_entrydate) from eoc where agency_code = eoc.hos_code) as last_update`))
      .joinRaw(`LEFT JOIN merge_data AS eoc ON eoc.hos_code = ch.short_hospcode 
      and eoc.eoc_resource_entrydate like '%2020-03-31%'`)

      .whereIn('ch.hosptype_code', ['05', '06', '07'])
    return sql;

  }
}