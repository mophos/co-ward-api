import * as Knex from 'knex';

export class BedModel {
	info(db: Knex, hospcode: any) {
		return db('b_hospitals')
			.where('hospcode', hospcode);
	}
	getBeds(db: Knex, hospitalId: any) {
		return db('b_beds as b')
			.select('b.id as bed_id', 'b.name', 'bh.qty', 'bh.covid_qty','bh.spare_qty')
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
			AND p.hospital_id = ? 
		GROUP BY
			cd.bed_id 
			) AS t ON t.bed_id = b.id`
		return db.raw(sql, [hospitalId]);
	}

	getMedicalSupplies(db: Knex, hospitalId: any) {
		return db('b_medical_supplies AS b')
			.select('b.id', 'b.name', 'bh.qty', 'bh.covid_qty', 'vms.qty as usage_qty')
			.joinRaw(`LEFT JOIN b_medical_supplie_hospitals AS bh on bh.medical_supplie_id = b.id and bh.hospital_id = ?`, hospitalId)
			.joinRaw(`LEFT JOIN view_medical_supplie_sum_hospitals as vms ON vms.medical_supplie_id = b.id AND vms.hospital_id = '?'`, hospitalId)
			.where('b.is_deleted', 'N')
	}

	getProfessional(db: Knex, hospitalId: any) {
		return db('b_professionals as b')
			.select('b.id as professional_id', 'b.name', 'bh.qty')
			.leftJoin('b_professional_hospitals as bh', (v) => {
				v.on('b.id', 'bh.professional_id')
				v.on('bh.hospital_id', db.raw(`${hospitalId}`));
			})
	}

	removeBeds(db: Knex, hospitalId) {
		return db('b_bed_hospitals')
			.where('hospital_id', hospitalId)
			.del();
	}

	removeMedicalSupplies(db: Knex, hospitalId) {
		return db('b_medical_supplie_hospitals')
			.where('hospital_id', hospitalId)
			.del();
	}

	removeProfessionals(db: Knex, hospitalId) {
		return db('b_professional_hospitals')
			.where('hospital_id', hospitalId)
			.del();
	}

	saveBeds(db: Knex, data) {
		return db('b_bed_hospitals')
			.insert(data);
	}

	saveMedicalSupplies(db: Knex, data) {
		return db('b_medical_supplie_hospitals')
			.insert(data);
	}

	saveProfessionals(db: Knex, data) {
		return db('b_professional_hospitals')
			.insert(data);
	}

	userInfo(db: Knex, userId: any) {
		return db('um_users as u')
			.select('u.*')
			.where('u.id', userId);
	}

	update(db: Knex, data, hospcode: any, userId) {
		return db('b_hospitals').update(data)
			.update('updated_by', userId)
			.update('update_date', db.fn.now())
			.where('hospcode', hospcode);
	}

	updateUser(db: Knex, data, userId: any) {
		return db('um_users').update(data)
			.update('update_date', db.fn.now())
			.where('id', userId);
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
		return db('wm_medical_supplies')
			.insert(data, 'id');
	}

	saveDetailMedicalSupplies(db: Knex, data) {
		return db('wm_medical_supplie_details')
			.insert(data);
	}

	saveHeadProfessional(db: Knex, data) {
		return db('wm_professionals')
			.insert(data, 'id');
	}

	saveDetailProfessionals(db: Knex, data) {
		return db('wm_professional_details')
			.insert(data);
	}

	getProvinceUser(db: Knex, provinceCode, userId) {
		return db.raw(`SELECT
		uu.id,
		uu.cid,
		CONCAT( uu.fname, ' ', uu.lname ) AS name,
		if(uu.is_approved = 'Y',true,false) as approved,
		bh.hospcode,
		bh.hospname,
		if(uur.id, true, false) rightAdmin,
		uur.id user_right_id
	FROM
		um_users uu
		LEFT JOIN (select uur.id, uur.user_id  from um_user_rights as uur join um_rights as ur on ur.id = uur.right_id and ur.name = 'STAFF_SETTING_USERS' ) as uur on uur.user_id = uu.id
		left join b_hospitals as bh on bh.hospcode = uu.hospcode
		where bh.province_code = ?
		and uu.id <> ? `, [provinceCode, userId])
	}

	changeApproved(db: Knex, id, status) {
		return db('um_users')
			.update('is_approved', status)
			.update('updated_by', id)
			.update('update_date', db.fn.now())

			.where('id', id)
	}

	deleteRightSupUser(db: Knex, id) {
		return db('um_user_rights')
			.delete()
			.where({ user_id: id, right_id: 25 });
	}

	addRightSupUser(db: Knex, id, userId) {
		return db('um_user_rights')
			.insert({ user_id: id, right_id: 25 ,created_by: userId});
	}
}