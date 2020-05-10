import * as Knex from 'knex';

export class NodeSurgicalModel {

  getListNode(db: Knex, query = '') {
    const _q = `%${query}%`;
    return db('h_node_surgicals AS hn')
      .select('hn.*', 'bh.hospcode', 'bh.hospname')
      .join('b_hospitals as bh', 'bh.id', 'hn.hospital_id')
      .where((v) => {
        v.orWhere('bh.hospcode', 'like', _q)
        v.orWhere('bh.hospname', 'like', _q)
      })
  }

  getListNodeDetails(db: Knex, id) {
    return db('h_node_surgical_details AS hns')
      .join('b_hospitals as bh', 'bh.id', 'hns.hospital_id')
      .where('hns.node_id', id)
  }

  getHospId(db: Knex, addHops) {
    return db('b_hospitals as bh')
      .where('bh.hospcode', addHops)
  }

  getOldNode(db: Knex, hospId) {
    return db('h_node_surgical_details as bh')
      .where('bh.hospital_id', hospId)
  }

  removeDetails(db: Knex, id) {
    return db('h_node_surgical_details')
      .del()
      .where('id', id)
  }

  insertDetails(db: Knex, data) {
    return db('h_node_surgical_details')
      .insert(data)
  }

  insertDetailsLog(db: Knex, data) {
    return db('h_node_surgical_log')
      .insert(data)
  }

}