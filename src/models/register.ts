import * as Knex from 'knex';

export class Register {

    getHopsCode(db: Knex, hospcode) {
        return db('chospital')
            .where('hospcode', hospcode)
    }

}