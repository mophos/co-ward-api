import * as Knex from 'knex';

export class HpvcModel {

  getList(db: Knex, personId) {
    let sql = db('p_hpvc as h')
      .leftJoin('p_hpvc_details as hd', 'hd.p_hpvc_id', 'h.id')
      .leftJoin('b_hpvc as bh', 'bh.id', 'hd.hpvc_id')
      .leftJoin('p_hpvc_drug_details as dhd', 'dhd.p_hpvc_id', 'h.id')
      .leftJoin('b_generics as g', 'g.id', 'dhd.drug_id')
      .leftJoin('um_users as u', 'u.id', 'h.created_by')
      .select('h.id', 'h.created_date', 'u.fname', db.raw(`group_concat( DISTINCT bh.name, ' ') as hpvc_name`), db.raw(`group_concat(DISTINCT g.name, ' ') as drug_name`))
      .where('h.person_id', personId)
      .groupBy('h.id')
      console.log(sql.toString());
      
      return sql
    // .orderBy('id', 'DESC')
  }

  getProduct(db: Knex) {
    return db('b_generics')
      .where('type', 'DRUG')
      .where('is_deleted', 'N')
  }

  saveHpvc(db: Knex, data) {
    return db('p_hpvc')
      .insert(data);
  }
  saveHpvcDetail(db: Knex, data) {
    return db('p_hpvc_details')
      .insert(data);
  }
  saveHpvcDrugDetail(db: Knex, data) {
    return db('p_hpvc_drug_details')
      .insert(data);
  }

  deleteHpvc(db: Knex, id) {
    return db('p_hpvc')
      .delete()
      .where('id', id);
  }
  deleteHpvcDetail(db: Knex, id) {
    return db('p_hpvc_details')
      .delete()
      .where('p_hpvc_id', id);
  }
  deleteHpvcDrugDetail(db: Knex, id) {
    return db('p_hpvc_drug_details')
      .delete()
      .where('p_hpvc_id', id);
  }

}