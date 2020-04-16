import * as Knex from 'knex';

export class BedModel {
	info(db: Knex, hospcode: any) {
		return db('b_hospitals')
			.where('hospcode', hospcode);
	}
	getBeds(db: Knex, hospitalId: any) {
		return db('b_beds as b')
			.select('b.id as bed_id', 'b.name', 'bh.qty', 'bh.covid_qty')
			.leftJoin('b_bed_hospitals as bh', (v) => {
				v.on('b.id', 'bh.bed_id')
				v.on('bh.hospital_id', db.raw(`${hospitalId}`));
			})
	}

	getBedReamin(db: Knex, hospitalId: any) {
		let sql = `SELECT
			b.id,
			b.NAME,
			t.count 
		FROM
			b_beds b
			LEFT JOIN (
		SELECT
			p.hospital_id,
			cd.bed_id,
			count( cd.id ) AS count 
		FROM
			p_covid_case_details AS cd
			JOIN p_covid_cases AS c ON c.id = cd.covid_case_id
			JOIN p_patients AS p ON p.id = c.patient_id 
		WHERE
			cd.id IN (
		SELECT
			MAX( cd.id ) 
		FROM
			p_covid_case_details AS cd
			JOIN p_covid_cases c ON c.id = cd.covid_case_id 
		WHERE
			c.STATUS = 'ADMIT' 
		GROUP BY
			c.id 
			) 
			AND p.hospital_id = ${hospitalId} 
		GROUP BY
			cd.bed_id 
			) AS t ON t.bed_id = b.id`
		return db.raw(sql);
	}

	getMedicalSupplies(db: Knex, hospitalId: any) {
		return db('b_medical-supplies as b')
			.select('b.id as medical_supplie_id', 'b.name', 'bh.qty')
			.leftJoin('b_medical-supplie_hospitals as bh', (v) => {
				v.on('b.id', 'bh.medical_supplie_id')
				v.on('bh.hospital_id', db.raw(`${hospitalId}`));
			}).where('b.is_show', 'Y')
	}

	removeBeds(db: Knex, hospitalId) {
		return db('b_bed_hospitals')
			.where('hospital_id', hospitalId)
			.del();
	}

	removeMedicalSupplies(db: Knex, hospitalId) {
		return db('b_medical-supplie_hospitals')
			.where('hospital_id', hospitalId)
			.del();
	}

	saveBeds(db: Knex, data) {
		return db('b_bed_hospitals')
			.insert(data);
	}

	saveMedicalSupplies(db: Knex, data) {
		return db('b_medical-supplie_hospitals')
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

	saveHeadMedicalSupplie(db: Knex, data) {
		return db('wm_medical-supplies')
			.insert(data, 'id');
	}

	saveDetailMedicalSupplies(db: Knex, data) {
		return db('wm_medical-supplie_details')
			.insert(data);
	}
}