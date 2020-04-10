import Knex = require('knex');
import * as moment from 'moment';

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
		return db('mm_generics')
			.where('is_deleted', 'N')
			.andWhere('is_actived', 'Y')
	}

	autocompleteTambon(db: Knex, query) {
		const q = `%${query}%`;
		const _q = `${query}%`;
		return db.raw(`SELECT DISTINCT
		province_id,
		province_name,
		province_name_en,
		ampur_id,
		ampur_name,
		ampur_name_en,
		tambon_id,
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
			province_id,
			province_name,
			province_name_en,
			ampur_id,
			ampur_name,
			ampur_name_en,
			tambon_id,
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
}