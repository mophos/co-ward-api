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
}