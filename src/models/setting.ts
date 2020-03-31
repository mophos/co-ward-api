import * as Knex from 'knex';

export class BedModel {
	info(db: Knex, hospcode: any) {
		console.log(db('l_hospitals')
			.where('hospcode', hospcode).toString());

		return db('l_hospitals')
			.where('hospcode', hospcode);
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

	update(db: Knex, data, hospcode: any) {
		return db('l_hospitals').update(data).where('hospcode', hospcode);
	}
}