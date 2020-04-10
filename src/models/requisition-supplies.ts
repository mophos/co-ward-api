import * as Knex from 'knex';

export class RequisitionSuppilesModel {

    getlist(db: Knex, hospcode) {
        return db('wm_requisition_supplies')
            .where('hospcode', hospcode)
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
}