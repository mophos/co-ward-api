

import Knex = require('knex');
import * as moment from 'moment';
var request = require("request");
export class PatientModel {

    getPerson(db: Knex, id: any) {
        return db('p_persons')
            .where('id', id)
    }

    getPersonEq(db: Knex, hn: any, hc: any) {
        let sql = db('p_persons as pe')
            .select('pe.id as person_id', 'pa.id as patient_id', 'pe.gender_id', 'g.name as gender_name', 'pe.first_name', 'pe.title_id', 'pe.first_name', 'pe.last_name',
                'pe.cid', 'pa.hn', 'h.hospname', 'h.id as hospital_id', 'h.hospcode', 'pe.birth_date', 'pe.passport',
                'pe.room_no', 'pe.road', 'pe.village_name', 'pe.tambon_name',
                'pe.ampur_name', 'pe.province_name', 'pe.tambon_code', 'pe.house_no',
                'pe.ampur_code', 'pe.province_code', 'pe.zipcode', 'pe.telephone', 'pe.country_code')
            .join('p_patients as pa', 'pa.person_id', 'pe.id')
            // .join('p_covid_cases as pc', 'pc.patient_id', 'pa.id') 'pc.an','pc.status','pc.sat_id', 'pc.date_admit'
            .join('b_hospitals as h', 'h.id', 'pa.hospital_id')
            .join('b_genders as g', 'g.id', 'pe.gender_id')
            // .where((w) => {
            // 	w.orWhere('pe.cid', `${queryPe}`)
            // 	w.orWhere('pe.first_name', `${queryPe}`)
            // 	w.orWhere('pe.last_name', `${queryPe}`)
            // })
            .where('pa.hn', `${hn}`)
            .where('h.hospcode', `${hc}`)
        // .limit(1)
        // console.log(sql.toString());
        return sql
    }

    updatePerson(db: Knex, id, data) {
        return db('p_persons')
            .where('id', id)
            .update(data);
    }

    saveLogsPerson(db: Knex, data: any) {
        return db('logs_p_persons')
            .insert(data);
    }

    getPatient(db: Knex, id: any) {
        return db('p_patients')
            .where('id', id)
    }

    updatePatient(db: Knex, id, data) {
        return db('p_patients')
            .where('id', id)
            .update(data);
    }

    saveLogsPatient(db: Knex, data: any) {
        return db('logs_p_patients')
            .insert(data);
    }

    getCasePresent(db: Knex, hospitalId, patientId) {
        const sql = db('p_covid_cases as c')
            .select('c.*', 'c.id as covid_case_id')
            .join('p_patients as pt', 'c.patient_id', 'pt.id')
            .where('pt.hospital_id', hospitalId)
            .where('c.is_deleted', 'N')
            .where('pt.id', patientId)
        return sql;
    }

    getCase(db: Knex, id) {
        const sql = db('p_covid_cases as c')
            .where('c.id', id)
        return sql;
    }

    updateCase(db: Knex, id, data) {
        return db('p_covid_cases')
            .update(data)
            .where('id', id);
    }

    saveLogsCase(db: Knex, data) {
        return db('logs_p_covid_cases')
            .insert(data);
    }

    getCaseDetail(db: Knex, id) {
        const sql = db('p_covid_case_details as c')
            .where('c.id', id)
        return sql;
    }

    getCaseDetailByCaseId(db: Knex, id) {
        const sql = db('p_covid_case_details as c')
            .where('c.covid_case_id', id)
        return sql;
    }

    saveLogsCaseDetail(db: Knex, data) {
        return db('logs_p_covid_case_details')
            .insert(data);
    }

    deleteCaseDetail(db: Knex, id) {
        const sql = db('p_covid_case_details as c')
            .delete()
            .where('c.id', id)
        return sql;
    }

    deleteCaseDetailByCaseId(db: Knex, id) {
        const sql = db('p_covid_case_details')
            .delete()
            .whereIn('id', id)
        console.log(sql.toString());

        return sql;
    }

    updateCaseDetail(db: Knex, id, data) {
        return db('p_covid_case_details')
            .update(data)
            .where('id', id);
    }

    insertCaseDetail(db: Knex, data) {
        return db('p_covid_case_details')
            .insert(data)
    }

    getPatientDischarge(db: Knex, hospitalId, startDate, endDate) {
        let sql = db('p_patients AS p')
            .select('p.hn', 'pc.*', 'pp.first_name', 'pp.last_name', 'pp.cid', 'pp.passport',db.raw(`DATEDIFF( now(),(pc.date_admit) ) as days`))
            .join('p_covid_cases AS pc', 'pc.patient_id', 'p.id')
            .join('p_persons as pp', 'pp.id', 'p.person_id')
            .where('p.hospital_id', hospitalId)
            .where('pc.is_deleted', 'N')
            .where('pc.status', 'ADMIT')

        if (startDate && endDate) {
            sql.whereBetween('pc.date_admit', [startDate, endDate])
        } else if (startDate) {
            sql.where('pc.date_admit', '>=', startDate);
        } else if (endDate) {
            sql.where('pc.date_admit', '<=', endDate);
        }

        console.log(sql.toString());

        return sql;
    }
}