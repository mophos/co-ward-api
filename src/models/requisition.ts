import * as Knex from 'knex';

export class Requisition {

    getlist(db: Knex, hospcode) {
        return db('wm_requisitions')
            .where('hospcode', hospcode)
    }
}