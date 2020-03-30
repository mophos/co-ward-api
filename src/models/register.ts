import * as Knex from 'knex';

export class Register {

    getHopsCode(db: Knex, hospcode) {
        return db('chospital')
            .where('hospcode', hospcode)
    }

    insertUser(db: Knex, data = {}) {
        return db('users')
            .insert(data);
    }
}