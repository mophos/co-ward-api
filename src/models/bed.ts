import * as Knex from 'knex';

export class BedModel {

  getBeds(db: Knex) {
    return db('mm_beds');
  }

  getBalanceBeds(db: Knex, hospcode: any) {
    return db('bed_balances as bb')
      .join('mm_beds as b', 'b.id', 'bb.bed_id')
      .where('bb.hospcode', hospcode);
  }

  save(db: Knex, data) {
    return db('bed_balances')
      .insert(data);
  }

  del(db: Knex, hospcode: any) {
    return db('bed_balances')
      .delete().where('hospcode', hospcode);
  }

}