import * as Knex from 'knex';

export class PayModel {

  getPay(db: Knex, hospcode) {
    return db('wm_pays as b')
      .select('b.*', db.raw('CONCAT(r.code,b.hospcode) as con_no'))
      .join('wm_restock_details as rd', 'rd.id', 'b.restock_detail_id')
      .join('wm_restocks as r', 'r.id', 'rd.restock_id')
      .where('b.hospcode', hospcode)
      .orderBy('id', 'DESC')
  }

  getPayDetail(db: Knex, id) {
    return db('wm_pay_details as bd')
      .select('bd.*', 's.name', 's.unit', 's.code')
      .join('mm_supplies as s', 'bd.supplies_id', 's.id')
      .where('bd.pay_id', id);
  }

  saveHead(db: Knex, data) {
    var chunkSize = 100;
    const that = this;
    return db.batchInsert('wm_pays', data, chunkSize)
      .returning('id')
      .then(async function (ids) {
        return ids;
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  saveDetail(db: Knex, data) {
    return db('pay_details').insert(data);
  }

  selectInsertDetail(db: Knex, start, end) {
    return db.raw(`insert wm_pay_details (pay_id,supplies_id,qty)
    SELECT p.id as pay_id,r.supplies_id,r.qty from wm_restock_detail_items as r 
    join wm_pays as p on p.restock_detail_id = r.restock_detail_id
    where p.id BETWEEN ? and ? and r.qty > 0
    `, [start, end]);
  }

  payHead(db: Knex, payId) {
    let sql = `SELECT
      CONCAT( r.code, h.hospcode ) AS con_no,
      h.hospname,
      h.address,
      h.tambon_name,
      h.ampur_name,
      h.province_name,
      h.lat,
      h.long,
      h.zipcode,
      u.telephone,
      u.email,
      r.created_at,
      CONCAT( u.fname, ' ', u.lname ) AS contact 
    FROM
      wm_pays AS p
      JOIN wm_restock_details rd ON rd.id = p.restock_detail_id
      JOIN wm_restocks r ON r.id = rd.restock_id
      JOIN l_hospitals h ON h.hospcode = rd.hospcode
      JOIN um_users u ON u.id = r.created_by
      JOIN um_titles t ON t.id = u.title_id 
    WHERE
      p.id = ${payId}`;
    return db.raw(sql)
  }

  payDetails(db: Knex, payId: any) {
    return db('wm_pays as p')
      .join('wm_pay_details as pd', 'pd.pay_id', 'p.id')
      .join('mm_supplies as s', 's.id', 'pd.supplies_id')
      .where('p.id', payId);
  }

  updatePay(db: Knex, data, payId: any) {
    return db('wm_pays').update(data).where('id', payId);
  }

}