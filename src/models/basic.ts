import Knex = require('knex');
import * as moment from 'moment';

export class BasicModel {

    getTitles(db: Knex) {
        return db('um_titles')
            .where('is_deleted', 'N')
    }

    getPositions(db: Knex) {
        return db('um_positions')
            .where('is_deleted', 'N')
    }

    getGenerics(db: Knex) {
        return db('mm_generics')
            .where('is_deleted', 'N')
            .andWhere('is_actived', 'Y')
    }
}