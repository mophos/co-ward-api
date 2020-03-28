import * as Knex from 'knex';

export class SuppliesMinMaxModel {
  getSuppliesMinMax(db: Knex, hospcode: any) {
    return db('supplies as s')
      .select('s.*','smm.id as supplies_min_max_id', 'smm.min', 'smm.max')
      .leftJoin('supplies_min_max as smm', 'smm.supplies_id', 's.id')
      .where('smm.hospcode', hospcode)
  }

  updateSuppliesMinMax(db: Knex, id: number,hospcode: any, data = {}) {
    return db('supplies_min_max')
      .update(data)
      .where('id', id)
      .where('hospcode', hospcode);
  }

  insertSuppliesMinMax(db: Knex, data = {}) {
    return db('supplies_min_max')
      .insert(data);
  }
}
