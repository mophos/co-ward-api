import * as Knex from 'knex';

export class HpvcModel {

  getList(db: Knex, personId) {
    return db('p_hpvc as h')
      .join('p_hpvc_details as hd', 'hd.p_hpvc_id', 'h.id')
      .join('b_hpvc as bh', 'bh.id', 'hd.hpvc_id')
      .leftJoin('um_users as u', 'u.id', 'h.created_by')
      .select('h.created_date', 'u.fname', db.raw(`group_concat(bh.name) as hpvc_name`))
      .where('h.person_id', personId)
    // .orderBy('id', 'DESC')
  }

  getProduct(db: Knex) {
    return db('b_generics')
      .where('type', 'DRUG')
      .where('is_deleted', 'N')
  }

}