import Knex = require('knex');
import * as moment from 'moment';
var request = require("request");

export class BasicModel {

	getTitles(db: Knex) {
		return db('um_titles')
			.where('is_deleted', 'N')
	}

	getHospitalReq(db: Knex) {
		return db('mm_requisition_supplies_center as r')
			.select('r.*', 'l.hospname')
			.join('l_hospitals as l', 'l.hospcode', 'r.hospcode')
	}

	getPositions(db: Knex) {
		return db('um_positions')
			.where('is_deleted', 'N')
	}

	getGenerics(db: Knex) {
		return db('b_generics')
			.where('is_deleted', 'N')
			.andWhere('is_actived', 'Y')
	}

	getGenericsType(db: Knex, type) {
		return db('b_generics')
			.where('is_deleted', 'N')
			.andWhere('is_actived', 'Y')
			.andWhere('type', type)
	}

	autocompleteTambon(db: Knex, query) {
		const q = `%${query}%`;
		const _q = `${query}%`;
		return db.raw(`SELECT DISTINCT
		province_code,
		province_name,
		province_name_en,
		ampur_code,
		ampur_name,
		ampur_name_en,
		tambon_code,
		tambon_name,
		tambon_name_en,
		zip_code 
	FROM
		(
		SELECT
			* 
		FROM
			( SELECT *, '1' AS o FROM view_address WHERE tambon_name LIKE ? ORDER BY tambon_name ASC ) AS a UNION
		SELECT
			* 
		FROM
			( SELECT *, '2' AS o FROM view_address WHERE tambon_name LIKE ? ORDER BY tambon_name ASC ) AS b 
		) AS m 
	ORDER BY
		m.o ASC,
		m.tambon_name`, [_q, q]);
	}

	autocompleteAmpur(db: Knex, query) {
		const q = `%${query}%`;
		const _q = `${query}%`;
		return db.raw(`SELECT DISTINCT
			province_code,
			province_name,
			province_name_en,
			ampur_code,
			ampur_name,
			ampur_name_en,
			tambon_code,
			tambon_name,
			tambon_name_en,
			zip_code 
		FROM
			(
			SELECT
				* 
			FROM
				( SELECT *, '1' AS o FROM view_address WHERE ampur_name LIKE ? ORDER BY ampur_name ASC ) AS a UNION
			SELECT
				* 
			FROM
				( SELECT *, '2' AS o FROM view_address WHERE ampur_name LIKE ? ORDER BY ampur_name ASC ) AS b 
			) AS m 
		ORDER BY
			m.o ASC,
			m.ampur_name`, [_q, q]);
	}

	autocompleteProvince(db: Knex, query) {
		const _q = `%${query}%`;
		return db('view_address')
			.orWhere('province_name', 'like', _q)
			.orderBy('province_name')
		// .orWhere('ampur_name','like',_q)
		// .orWhere('tambon_name','like',_q)
		// .orWhere('zipcode','like',_q)
	}

	autocompleteZipcode(db: Knex, query) {
		const _q = `%${query}%`;
		return db('view_address')
			.orWhere('zip_code', 'like', _q)
			.orderBy('zip_code')
	}

	autocompleteHospitalRequisition(db: Knex, query, hospcode) {
		const _q = `%${query}%`;
		return db('mm_requisition_supplies_center AS mrsc')
			.select('lh.*')
			.join('mm_requisition_supplies_node AS mrsn', 'mrsn.center_id', 'mrsc.id')
			.join('l_hospitals as lh', 'lh.hospcode', 'mrsn.hospcode')
			.where('mrsc.hospcode', hospcode)
			.andWhere('lh.hospname', 'like', _q)
			.orderBy('lh.hospname')
	}

	autocompleteHospital(db: Knex, query) {
		const _q = `%${query}%`;
		return db('b_hospitals')
			.orWhere('hospname', 'like', _q)
			.orWhere('hospcode', 'like', _q)
			.orderBy('hospname')
			.limit(30);
	}

	autocompleteCountry(db: Knex, query) {
		const _q = `%${query}%`;
		return db('b_countries')
			.orWhere('name', 'like', _q)
			.orderBy('name')
	}

	getGCS(db: Knex) {
		return db('b_gcs')
			.where('is_deleted', 'N')
	}

	getHPVC(db: Knex) {
		return db('b_hpvc')
			.where('is_deleted', 'N')
	}

	getICD10(db: Knex, query) {
		const _query = `%${query}%`;
		return db('b_icd10')
			.where((v) => {
				v.where('code', 'like', _query)
				v.orWhere('code_plain', 'like', _query)
				v.orWhere('term', 'like', _query)
			})
			.limit(20);
	}

	getBeds(db: Knex, hospitalId, hospitalType) {
		return db('b_beds as b')
			.select('b.id', 'b.name', 'bh.hospital_id', 'bh.bed_id', 'bh.qty')
			.leftJoin('b_bed_hospitals as bh', (v) => {
				v.on('b.id', 'bh.bed_id')
				v.on('bh.hospital_id', db.raw(`${hospitalId}`));
			})
			.where('b.is_deleted', 'N')
			.where((v) => {
				v.where('b.is_hospital', hospitalType == 'HOSPITAL' ? 'Y' : 'N')
				v.orWhere('b.is_hospitel', hospitalType == 'HOSPITEL' ? 'Y' : 'N')
			})
	}

	getMedicalSupplies(db: Knex, hospitalType) {
		return db('b_medical_supplies as b')
			.where('b.pay_type', 'COVID')
			.where('b.is_deleted', 'N')
			.where((v) => {
				v.where('b.is_hospital', hospitalType == 'HOSPITAL' ? 'Y' : 'N')
				v.orWhere('b.is_hospitel', hospitalType == 'HOSPITEL' ? 'Y' : 'N')
			})
	}

	getGenericSet(db: Knex, type) {
		return db('b_generic_sets')
			.where('is_deleted', 'N')
			.where('type', type)
	}

	getGenericSetDetails(db: Knex, id) {
		return db('b_generic_set_details')
			.where('set_id', id)
	}
	getGenericSetDetailItems(db: Knex, id) {
		return db('b_generic_set_detail_items as sdi')
			.select('sdi.*', 'g.name as generic_name')
			.join('b_generics as g', 'g.id', 'sdi.generic_id')
			.where('set_detail_id', id)
	}

	timeCut() {
		const timeCut = moment(process.env.TIME_CUT, 'HH:mm');
		const cut = moment().diff(timeCut, 'minutes');
		if (cut < 0) {
			// true = บันทึกได้
			return { ok: true };
		} else {
			return { ok: false, error: `ขณะนี้เกินเวลา ${moment(timeCut).format('HH:mm').toString()} ไม่สามารถบันทึกได้` };
		}
	}

	getListChildNode(db: Knex, hospitalId) {
		let sql = db('h_node_surgical_details as cnode')
			.select('h.id', 'h.hospname', 'h.hospcode')
			.join('h_node_surgicals as node', 'node.id', 'cnode.node_id')
			.join('b_hospitals as h', 'h.id', 'cnode.hospital_id')
			.where('node.hospital_id', hospitalId)
		return sql
	}

	getSystems(db: Knex) {
		return db('sys_systems')
			.orderBy('id', 'DESC')
			.limit(1);
	}

	closeSystems(db: Knex, userId) {
		return db('sys_systems')
			.insert({ 'status': 'CLOSE', 'create_by': userId });
	}

	openSystems(db: Knex, userId) {
		return db('sys_systems')
			.insert({ 'status': 'OPEN', 'create_by': userId });
	}

	broadcast(db: Knex, text, userId) {
		return db('sys_broadcasts')
			.insert({ 'message': text, 'create_by': userId });
	}

	getPerson(db: Knex, query: any, TypeQ = 'ID') {
		let sql = db('p_persons')
		if (TypeQ === 'ID') {
			sql.where('id', +query.id)
		}
		if (TypeQ === 'CID') {
			sql.where('cid', 'like', `%${query.cid}%`)
		}
		if (TypeQ === 'FNAME') {
			sql.where('first_name', 'like', `${query.name}`)
		}
		return sql
	}

	getPatient(db: Knex, personId) {
		return db('p_patients')
			.whereIn('person_id', personId)
	}

	getCoCase(db: Knex, patientId) {
		return db('p_covid_cases')
			.whereIn('patient_id', patientId)
	}

	getCoCaseDetail(db: Knex, coCaseId) {
		return db('p_covid_case_details')
			.whereIn('covid_case_id', coCaseId)
	}

	getReqDrug(db: Knex, coCaseDetaialId) {
		return db('wm_requisitions')
			.whereIn('covid_case_detail_id', coCaseDetaialId)
			.where('type', 'DRUG');
	}

	getReqSupplies(db: Knex, coCaseDetaialId) {
		return db('wm_requisitions')
			.whereIn('covid_case_detail_id', coCaseDetaialId)
			.where('type', 'SUPPLIES');
	}

	getReqDetail(db: Knex, ReqId) {
		return db('wm_requisition_details')
			.whereIn('requisition_id', ReqId)
	}

	deletedPerson(db: Knex, id) {
		return db('p_persons')
			.delete()
			.whereIn('id', id)
	}

	deletedPatient(db: Knex, id) {
		return db('p_patients')
			.whereIn('id', id)
	}

	deletedCoCase(db: Knex, id) {
		return db('p_covid_cases')
			.delete().whereIn('id', id)
	}

	deletedCoCaseDatail(db: Knex, id) {
		return db('p_covid_case_details')
			.delete().whereIn('id', id)
	}

	deletedReq(db: Knex, id) {
		return db('wm_requisitions')
			.delete().whereIn('id', id)
	}

	deletedReqDetail(db: Knex, id) {
		return db('wm_requisition_details')
			.delete().whereIn('id', id)
	}

	getPatientSMS(db: Knex) {

		const last = db('p_covid_case_details')
			.max('entry_date as updated_entry_last')
			.whereRaw('covid_case_id=cl.covid_case_id')
			.whereNotNull('updated_entry')
			.as('updated_entry_last');

		const sql = db('views_covid_case_last as cl')
			.select('pt.hn', 'c.an', 'pt.hospital_id', last, db.raw(`DATEDIFF( now(),(${last}) ) as days`), 'h.hospname', 'h.hospcode', 'h.zone_code', 'h.province_name', 'c.date_admit', 'u.fname', 'u.telephone', 'h.telephone_manager')
			.join('p_covid_cases as c', 'c.id', 'cl.covid_case_id')
			.join('p_patients as pt', 'pt.id', 'c.patient_id')
			.join('b_hospitals as h', 'h.id', 'pt.hospital_id')
			.leftJoin('um_users as u', 'u.id', 'c.created_by')
			.where('cl.status', 'ADMIT')
			.whereIn('cl.gcs_id', [1, 2, 3, 4])
			.havingRaw('days >= 2')
		return sql;

	}

	sendSMS(tel, text) {
		return new Promise((resolve, reject) => {
			var options = {
				method: 'POST',
				url: 'http://otp.dev.moph.go.th/sms',
				headers: { 'content-type': 'application/json' },
				body: { tel: tel, message: text, appId: process.env.OTP_APP_ID },
				json: true
			};

			request(options, function (error, response, body) {
				if (error) {
					reject(error);
				} else {
					resolve(body);
				}
			});
		});

	}

	getAdd(db: Knex, t, a, p, z) {
		return db.raw(`SELECT DISTINCT
		province_code,
		province_name,
		province_name_en,
		ampur_code,
		ampur_name,
		ampur_name_en,
		tambon_code,
		tambon_name,
		tambon_name_en,
		zip_code 
	FROM
		 view_address 
	WHERE 
		 tambon_name = ?
		 and ampur_name = ?
		 and province_name = ?
		 and zip_code = ?`, [t, a, p, z]);
	}

	getGender(db: Knex) {
		return db('b_genders')
			.where('is_deleted', 'N')
	}

	getGeneric(db: Knex, id) {
		return db('p_covid_case_detail_items as pi')
			.select('pi.*', 'g.name')
			.join('b_generics as g', 'g.id', 'pi.generic_id')
			.where('pi.covid_case_detail_id', id);
	}

	saveGeneric(db: Knex, data) {
		return db('p_covid_case_detail_items').insert(data);
	}

	removeGeneric(db: Knex, id) {
		return db('p_covid_case_detail_items').delete().where('covid_case_detail_id', id);
	}

}