import * as Knex from 'knex';

export class FullfillModel {

  getProducts(db: Knex, type) {
    let sql = db('wm_generics as g')
      .select('g.generic_id', 'bg.name as generic_name','bh.hospname as hospital_name','g.qty','gp.min','gp.max',
      'gp.safety_stock',db.raw('(gp.max-g.qty+gp.safety_stock) as fill_qty'),
      db.raw('(gp.max-g.qty+gp.safety_stock) as recommend_fill_qty'),
      db.raw('(g.qty*100/gp.max) as qty_order'))
      .join('b_generic_plannings as gp', (v) => {
        v.on('g.generic_id', 'gp.generic_id');
        v.on('g.hospital_id', 'gp.hospital_id');
      })
      .join('b_generics as bg', 'bg.id', 'g.generic_id')
      .join('b_hospitals as bh', 'bh.id', 'g.hospital_id')
      .where('bg.type', type)
      .orderByRaw('g.qty*100/gp.max');
      // console.log(sql.toString());
      return sql;
  }


}