import * as Knex from 'knex';

export class RequestProductModel {

    getlist(db: Knex, hospitalId) {
        return db('wm_request_products as r')
            .select('r.*', 'h.hospname', 'u.fname', 'u.lname')
            .join('um_users as u', 'u.id', 'r.created_by')
            .join('b_hospitals as h', 'h.id', 'r.hospital_id')
            .where('r.hospital_id', hospitalId)
            .orderBy('r.id', 'DESC')
    }

    getlistDetails(db: Knex, id) {
        return db('wm_request_product_details as rd')
            .select('rd.*', 'p.product_name')
            .join('lh_products as p', 'p.product_id', 'rd.product_id')
            .where('rd.request_id', id)
    }

    getProductTypes(db: Knex) {
        return db('lh_product_types')
    }

    getProducts(db: Knex, typeId) {
        const sql = db('lh_products')
            .select('lh_products.*', db.raw(`'0' as qty`))
        if (typeId) {
            sql.where('type_id', typeId)
        }
        return sql;
    }

    save(db: Knex, data) {
        return db('wm_request_products').insert(data, 'id');
    }

    saveDetails(db: Knex, data) {
        return db('wm_request_product_details').insert(data);
    }
}