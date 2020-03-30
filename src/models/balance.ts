import * as Knex from 'knex';

export class BalanceModel {

  getBalance(db: Knex, hospcode) {
    return db('balances as b')
      .select('b.*', 's.fname as fullname')
      .join('users as s', 'b.created_by', 's.id')
      .where('b.hospcode', hospcode)
      .orderBy('id', 'DESC')
  }

  getBalanceDetail(db: Knex, id) {
    return db('balance_details as bd')
      .select('bd.*', 's.name', 's.unit', 's.code')
      .join('mm_supplies as s', 'bd.supplies_id', 's.id')
      .where('bd.balance_id', id);
  }

  saveHead(db: Knex, data) {
    return db('balances')
      .insert(data);
  }

  saveDetail(db: Knex, data) {
    return db('balance_details')
      .insert(data);
  }

  removeCurrent(db: Knex, hospcode) {
    return db('current_balances')
      .delete()
      .where('hospcode', hospcode);
  }
  saveCurrent(db: Knex, data) {
    return db('current_balances')
      .insert(data);
  }

  updateLog(db: Knex, data, ) {
    return db('balance_logs')
      .insert(data);
  }

  update(db: Knex, id, qty) {
    return db('balance_details')
      .update('qty', qty)
      .where('id', id);
  }

  updateHead(db: Knex, id, userId) {
    return db('balances')
      .update('updated_by', userId)
      .where('id', id);
  }


}