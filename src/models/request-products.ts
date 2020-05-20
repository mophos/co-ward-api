import * as Knex from 'knex';

export class RequestProductModel {

    getlist(db: Knex, hospitalId) {
        return db('wm_request_products as r')
            .select('r.*', 'h.hospname')
            .join('b_hospitals as h', 'h.id', 'r.hospital_id')
            .where('r.hospital_id', hospitalId)
    }

    getProductTypes(db: Knex) {
        return db('lh_product_types')
    }

    getProducts(db: Knex, typeId) {
        const sql = db('lh_products')
        .select('lh_products.*',db.raw(`'0' as qty`))
        if (typeId) {
            sql.where('type_id', typeId)
        }
        return sql;
    }
}