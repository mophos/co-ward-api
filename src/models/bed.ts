import * as Knex from 'knex';

export class BedModel {

  getBeds(db: Knex) {
    return db('mm_beds');
  }

  getBedHospital(db: Knex) {
    let sql = `(select hospcode from current_beds group by hospcode)`;
    return db('chospital as c')
      .whereRaw(`c.id not in ${sql}`);
  }

  getBalanceBeds(db: Knex, hospcode: any) {
    return db('current_beds as cb')
      .join('mm_beds as b', 'b.id', 'cb.bed_id')
      .where('cb.hospcode', hospcode)
  }

  saveHead(db: Knex, data) {
    return db('bed_historys')
      .insert(data, 'id');
  }

  saveDetail(db: Knex, data) {
    return db('bed_history_details')
      .insert(data);
  }

  saveCurrent(db: Knex, data) {
    return db('current_beds')
      .insert(data);
  }

  del(db: Knex, hospcode: any) {
    return db('current_beds')
      .delete().where('hospcode', hospcode);
  }

}