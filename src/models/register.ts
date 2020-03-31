import * as Knex from 'knex';

export class Register {

    getHospCode(db: Knex, hospcode) {
        return db('l_hospitals')
            .where('hospcode', hospcode)
    }

    autocompleteHospital(db: Knex, query) {
		const _q = `%${query}%`;
		return db('l_hospitals')
			.orWhere('hospname', 'like', _q)
			.orderBy('hospname')
	}

    insertUser(db: Knex, data = {}) {
        return db('um_users')
            .insert(data);
    }
}