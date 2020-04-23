import * as Knex from 'knex';

export class Requisition {

    getlist(db: Knex, hospcode) {
        return db('wm_requisitions')
            .where('hospcode', hospcode)
    }

    saveHead(db: Knex, data: any) {
        return db('wm_requisitions').insert(data, 'id');
    }

    delHead(db: Knex, id: any) {
        return db('wm_requisitions').delete().where('id', id);
    }

    saveDetail(db: Knex, data: any) {
        return db('wm_requisition_details').insert(data, 'id');
    }

    saveItem(db: Knex, data: any) {
        return db('wm_requisition_detail_items').insert(data);
    }

    getHeadCovidCaseSupplies(db: Knex) {
        return db('p_covid_case_details as ccd')
            .select('ccd.id AS covid_case_detail_id',
                'ccd.covid_case_id',
                'pt.hospital_id AS hospital_id_client',
                'h.hospcode as hospital_id_client_code',
                db.raw(`ifnull( ns.hospital_id, pt.hospital_id ) AS hospital_id_node`)
            )
            .join('p_covid_cases as c', 'c.id', 'ccd.covid_case_id')
            .join('p_patients as pt', 'pt.id', 'c.patient_id')
            .leftJoin('h_node_supplies_details as nsd', 'nsd.hospital_id', 'pt.hospital_id')
            .leftJoin('h_node_supplies as ns', 'nsd.node_id', 'ns.id')
            .leftJoin('b_hospitals as h', 'h.id', 'pt.hospital_id')
            .where('ccd.is_requisition', 'N')
            .where('ccd.status', 'ADMIT');
    }

    getHeadCovidCaseDrugs(db: Knex) {
        return db('p_covid_case_details as ccd')
            .select('ccd.id AS covid_case_detail_id',
                'ccd.covid_case_id'
                , 'pt.hospital_id AS hospital_id_client',
                'h.hospcode as hospital_id_client_code',
                db.raw(`ifnull( ns.hospital_id, pt.hospital_id ) AS hospital_id_node`)
            )
            .join('p_covid_cases as c', 'c.id', 'ccd.covid_case_id')
            .join('p_patients as pt', 'pt.id', 'c.patient_id')
            .leftJoin('h_node_drug_details as nsd', 'nsd.hospital_id', 'pt.hospital_id')
            .leftJoin('h_node_drugs as ns', 'nsd.node_id', 'ns.id')
            .leftJoin('b_hospitals as h', 'h.id', 'pt.hospital_id')
            .where('ccd.is_requisition', 'N')
            .where('ccd.status', 'ADMIT');
    }

    getDetailCovidCaseSupplies(db: Knex, id) {
        return db('p_covid_case_details as ccd')
            .select('ccd.id AS covid_case_detail_id',
                'ccd.covid_case_id',
                'ggc.generic_id',
                'ggc.qty'
            )
            .join('p_covid_cases as c', 'c.id', 'ccd.covid_case_id')
            .join('p_patients as pt', 'pt.id', 'c.patient_id')
            .join('b_hospitals as h','pt.hospital_id','h.id')
            .join('b_generic_gcs_qty as ggc', (v)=>{
                v.on('ggc.gcs_id', 'ccd.gcs_id');
                v.on('ggc.type', 'h.hospital_type');
            })
            .where('ccd.covid_case_id', id)
            .where('ccd.status', 'ADMIT')
    }

    getDetailCovidCaseDrugs(db: Knex, id) {
        return db('p_covid_case_details as ccd')
            .select('ccd.id AS covid_case_detail_id',
                'cdi.generic_id',
                'cdi.qty'
            )
            .join('p_covid_cases as c', 'c.id', 'ccd.covid_case_id')
            .join('p_covid_case_detail_items as cdi', 'ccd.id', 'cdi.covid_case_detail_id')
            .join('p_patients as pt', 'pt.id', 'c.patient_id')
            .where('ccd.covid_case_id', id)
            .where('ccd.status', 'ADMIT')
            .where('cdi.qty', '>', '0')
    }

    updateIsRequisition(db: Knex) {
        return db('p_covid_case_details')
            .update('is_requisition', 'Y')
            .where('status','ADMIT')
    }
}