import * as Knex from 'knex';

export class MinMaxModel {

  getHospNodeDrugs(db: Knex) {
    return db('h_node_drugs AS hn')
      .select('bh.*')
      .join('b_hospitals AS bh', 'bh.id', 'hn.hospital_id')
  }

  getHospNodeSupplies(db: Knex) {
    return db('h_node_supplies AS hn')
      .select('bh.*')
      .join('b_hospitals AS bh', 'bh.id', 'hn.hospital_id')
  }

  getMinMax(db: Knex, hospitalId, type) {
    return db('b_generics AS bg')
      .select('bg.id as generic_id', 'bgp.max', 'bgp.min', 'bgp.safety_stock', 'bgp.hospital_id', 'bg.name as generic_name', 'bu.name as unit_name')
      .joinRaw(`LEFT JOIN b_generic_plannings AS bgp ON bgp.generic_id = bg.id AND bgp.hospital_id = ?`, hospitalId)
      .join('b_units AS bu', 'bu.id', 'bg.unit_id')
      .where('bg.type', type)
      .where('bg.sub_type', 'COVID')
      .where('bg.is_actived', 'Y')
  }

  removeMinMax(db: Knex, hospId, genericIds) {
    return db('b_generic_plannings')
      .where('hospital_id', hospId)
      .whereIn('generic_id', genericIds)
      .delete()
  }

  saveMinMax(db: Knex, data) {
    return db('b_generic_plannings')
      .insert(data)
  }


}