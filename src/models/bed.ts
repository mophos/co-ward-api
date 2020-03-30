import * as Knex from 'knex';

export class BedModel {

  getBeds(db: Knex) {
    return db('mm_beds');
  }

  getBalanceBeds(db: Knex, hospcode: any) {
    return db('current_beds as cb')
      .join('mm_beds as b', 'b.id', 'cb.bed_id')
      .where('cb.hospcode', hospcode)
  }

  save(db: Knex, data) {
    return db('')
      .insert(data);
  }

  del(db: Knex, hospcode: any) {
    return db('bed_balances')
      .delete().where('hospcode', hospcode);
  }

}