import Knex = require('knex');
import * as moment from 'moment';

export class ReportModel {
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

    getTotalSupplie(db: Knex) {
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
        g.type = 'SUPPLIES' 
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
}