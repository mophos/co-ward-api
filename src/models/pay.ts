import * as Knex from 'knex';

export class PayModel {

  getPay(db: Knex, hospcode) {
    return db('pays as b')
      // .select('b.*', 's.fname as fullname')
      // .join('users as s', 'b.created_by', 's.id')
      .where('b.hospcode', hospcode)
      .orderBy('id','DESC')
  }

  getPayDetail(db: Knex, id) {
    return db('pay_details as bd')
      .select('bd.*', 's.name', 's.unit', 's.code')
      .join('supplies as s', 'bd.supplies_id', 's.id')
      .where('bd.balance_id', id);
  }

}