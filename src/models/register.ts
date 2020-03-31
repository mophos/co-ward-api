import * as Knex from 'knex';

export class Register {

    getHospCode(db: Knex, hospcode) {
        return db('chospital')
            .where('hospcode', hospcode)
    }

    autocompleteHospital(db: Knex, query) {
		const _q = `%${query}%`;
		return db('chospital')
			.orWhere('hospname', 'like', _q)
			.orderBy('hospname')
	}

    insertUser(db: Knex, data = {}) {
        return db('users')
            .insert(data);
    }
}