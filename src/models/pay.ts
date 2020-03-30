import * as Knex from 'knex';

export class PayModel {

  getPay(db: Knex, hospcode) {
    return db('pays as b')
      // .select('b.*', 's.fname as fullname')
      // .join('users as s', 'b.created_by', 's.id')
      .where('b.hospcode', hospcode)
      .orderBy('id', 'DESC')
  }

  getPayDetail(db: Knex, id) {
    return db('pay_details as bd')
      .select('bd.*', 's.name', 's.unit', 's.code')
      .join('mm_supplies as s', 'bd.supplies_id', 's.id')
      .where('bd.pay_id', id);
  }

  saveHead(db: Knex, data) {
    var chunkSize = 30;
    const that = this;
    return db.batchInsert('pays', data, chunkSize)
      .returning('id')
      .then(async function (ids) {
        // for (const i of ids) {
        await that.selectInsertDetail(db, ids);
        // }

      })
      .catch(function (error) {
        console.log(error);

      });
  }

  saveDetail(db: Knex, data) {
    return db('pay_details').insert(data);
  }

  selectInsertDetail(db: Knex, ids) {
    return db.raw(`insert pay_details (pay_id,supplies_id,qty)
    SELECT p.id as pay_id,r.supplies_id,r.qty from restock_detail_items as r 
    join pays as p on p.restock_detail_id = r.restock_detail_id
    where p.id BETWEEN ? and ?
    `, [ids[0], ids[ids.length - 1]])
  }

}