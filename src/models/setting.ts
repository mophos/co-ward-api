import * as Knex from 'knex';

export class BedModel {
	info(db: Knex, hospcode: any) {
		return db('b_hospitals')
			.where('hospcode', hospcode);
	}
	getBeds(db: Knex, hospitalId: any) {
		return db('b_beds as b')
			.select('b.id as bed_id', 'b.name', 'bh.qty')
			.leftJoin('b_bed_hospitals as bh', (v) => {
				v.on('b.id', 'bh.bed_id')
				v.on('bh.hospital_id', db.raw(`${hospitalId}`));
			})
	}

	getVentilators(db: Knex, hospitalId: any) {
		return db('b_ventilators as b')
			.select('b.id as ventilator_id', 'b.name', 'bh.qty')
			.leftJoin('b_ventilator_hospitals as bh', (v) => {
				v.on('b.id', 'bh.ventilator_id')
				v.on('bh.hospital_id', db.raw(`${hospitalId}`));
			}).where('b.is_show', 'Y')
	}

	removeBeds(db: Knex, hospitalId) {
		return db('b_bed_hospitals')
			.where('hospital_id', hospitalId)
			.del();
	}

	removeVentilators(db: Knex, hospitalId) {
		return db('b_ventilator_hospitals')
			.where('hospital_id', hospitalId)
			.del();
	}

	saveBeds(db: Knex, data) {
		return db('b_bed_hospitals')
			.insert(data);
	}

	saveVentilators(db: Knex, data) {
		return db('b_ventilator_hospitals')
			.insert(data);
	}

	userInfo(db: Knex, userId: any) {
		return db('um_users as u')
			.select('u.*')
			.where('u.id', userId);
	}

	update(db: Knex, data, hospcode: any) {
		return db('b_hospitals').update(data).where('hospcode', hospcode);
	}

	updateUser(db: Knex, data, userId: any) {
		return db('um_users').update(data).where('id', userId);
	}

	saveHead(db: Knex, data) {
		return db('wm_beds')
			.insert(data, 'id');
	}

	saveDetail(db: Knex, data) {
		return db('wm_bed_details')
			.insert(data);
	}

	saveHeadVentilator(db: Knex, data) {
		return db('wm_ventilators')
			.insert(data, 'id');
	}

	saveDetailVentilators(db: Knex, data) {
		return db('wm_ventilator_details')
			.insert(data);
	}
}