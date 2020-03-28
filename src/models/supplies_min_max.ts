import * as Knex from 'knex';

export class SuppliesMinMaxModel {
  getSuppliesMinMax(db: Knex, hopscode: any) {
    return db('supplies as s')
      .select('s.*','smm.id as supplies_min_max_id', 'smm.min', 'smm.max')
      .leftJoin('supplies_min_max as smm', 'smm.supplies_id', 's.id')
      .where('smm.hopscode', hopscode)
  }

  updateSuppliesMinMax(db: Knex, id: number, data = {}) {
    return db('supplies_min_max')
      .update(data)
      .where(id);
  }

  insertSuppliesMinMax(db: Knex, data = {}) {
    return db('supplies_min_max')
      .insert(data);
  }
}
