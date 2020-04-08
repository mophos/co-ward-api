import * as Knex from 'knex';

export class BedModel {
	info(db: Knex, hospcode: any) {
		return db('l_hospitals')
			.where('hospcode', hospcode);
	}

	userInfo(db: Knex, userId: any) {
		return db('um_users as u')
			.select('u.*')
			.where('u.id', userId);
	}

	update(db: Knex, data, hospcode: any) {
		return db('l_hospitals').update(data).where('hospcode', hospcode);
	}

	updateUser(db: Knex, data, userId: any) {
		return db('um_users').update(data).where('id', userId);
	}
}