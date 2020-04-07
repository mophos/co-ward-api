import * as Knex from 'knex';

export class ThpdModel {
	logThpd(db: Knex, data: any) {
		return db('log_thpd')
			.insert({'text': data});
	}



}