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
            .insert(data, 'id');
    }

    getTitles(db: Knex) {
        return db('um_titles')
            .where('is_deleted', 'N')
    }

    getPositions(db: Knex) {
        return db('um_positions')
            .where('is_deleted', 'N')
    }

    getRights(db: Knex, rights) {
        return db('um_rights')
            .whereIn('name', rights)
    }

    insertUserRights(db: Knex, data = {}) {
        return db('um_user_rights')
            .insert(data);
    }
}