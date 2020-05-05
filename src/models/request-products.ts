import * as Knex from 'knex';

export class RequestProductModel {

    getlist(db: Knex, hospitalId) {
        return db('wm_request_products as r')
            .select('r.*', 'h.hospname as hospname_req')
            .join('b_hospitals as h', 'h.id', 'r.hosppital_id')
            .where('r.hospital_id', hospitalId)
    }

    saveHead(db: Knex, data: any) {
        return db('wm_requisition_supplies').insert(data, 'id');
    }

    delHead(db: Knex, id: any) {
        return db('wm_requisition_supplies').delete().where('id', id);
    }

    saveDetail(db: Knex, data: any) {
        return db('wm_requisition_supplies_details').insert(data, 'id');
    }

    saveItem(db: Knex, data: any) {
        return db('wm_requisition_supplies_detail_items').insert(data);
    }
    getGenerics(db: Knex) {
        return db('mm_generic_supplies');
    }

    getHead(db: Knex, id) {
        return db('wm_requisition_supplies as r')
            .select('r.*', 'h.hospname as hospname_req')
            .join('l_hospitals as h', 'h.hospcode', 'r.hospcode_req')
            .where('r.id', id);
    }

    getDetail(db: Knex, id) {
        return db('wm_requisition_supplies_details')
            .where('requisition_id', id)
    }
    getDetailItem(db: Knex, id) {
        return db('wm_requisition_supplies_detail_items as rsdi')
            .join('mm_generic_supplies as mg', 'mg.id', 'rsdi.generic_id')
            .where('requisition_detail_id', id)

    }

}