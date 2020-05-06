import * as Knex from 'knex';

export class PayModel {

  getPay(db: Knex, hospcode) {
    return db('wm_pays as b')
      .where('b.hospcode', hospcode)
      .orderBy('id', 'DESC')
  }

  getSurgicalMask(db: Knex, hospitalId) {
    return db('pay_surgical_masks as p')
      .select('p.*', 'h2.hospname')
      .join('b_hospitals as h1', 'h1.id', 'p.src_hospital_id')
      .join('b_hospitals as h2', 'h2.id', 'p.dst_hospital_id')
      .where('h1.id', hospitalId)
      .orderBy('p.id', 'DESC')
  }

  insertSergicalMask(db: Knex, data) {
    return db('pay_surgical_masks')
      .insert(data);
  }

  updateSergicalMask(db: Knex, data, id, userId) {
    return db('pay_surgical_masks')
      .update(data).update('updated_by', userId)
      .update('update_date', db.fn.now())
      .where('id', id);
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
    return db.raw(`insert wm_pay_details (pay_id,generic_id,qty)
    SELECT p.id as pay_id,r.generic_id,r.qty from wm_fulfill_surgical_mask_detail_items as r 
    join wm_pays as p on p.fulfill_surgical_mask_detail_id = r.fulfill_surgical_mask_detail_id
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

  paySurgicalMaskHead(db: Knex, payId) {
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
      JOIN wm_fulfill_surgical_mask_details rd ON rd.id = p.fulfill_surgical_mask_detail_id
      JOIN wm_fulfill_surgical_masks r ON r.id = rd.fulfill_surgical_mask_id
      JOIN b_hospitals h ON h.id = rd.hospital_id
      LEFT JOIN um_users u ON u.id = r.created_by
      LEFT JOIN um_titles t ON t.id = u.title_id 
    WHERE
      p.id = ${payId}`;
    return db.raw(sql)
  }

  payDetails(db: Knex, payId: any) {
    return db('wm_pays as p')
      .select('pd.*', 's.*', 'u.name as unit_name')
      .join('wm_pay_details as pd', 'pd.pay_id', 'p.id')
      .join('b_generics as s', 's.id', 'pd.generic_id')
      .join('b_units as u', 'u.id', 's.unit_id')
      .where('p.id', payId);
  }

  updatePay(db: Knex, data, payId: any) {
    return db('wm_pays').update(data).where('id', payId);
  }

  updateRestock(db: Knex, id: any, userId) {
    return db('wm_restocks').update('is_approved', 'Y')
      .update('updated_by', userId)
      .update('update_date', db.fn.now()).where('id', id);
  }

  updateFulfillSurgicalMask(db: Knex, id: any, data) {
    return db('wm_fulfill_surgical_masks').update(data).where('id', id);
  }


  delPay(db: Knex, id: any) {
    return db('pay_surgical_masks').del().where('id', id);
  }

}