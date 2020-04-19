import * as Knex from 'knex';

export class UserModel {

  getUser(db: Knex, limit = 100, offset = 0, q = '') {
    return db('um_users as u')
      .select('u.*', 'h.hospname')
      .leftJoin('l_hospitals as h', 'h.hospcode', 'u.hospcode')
      .where((v) => {
        v.where('u.username', 'like', '%' + q + '%')
        v.orWhere('u.fname', 'like', '%' + q + '%')
        v.orWhere('u.lname', 'like', '%' + q + '%')
      })
      .where('u.is_deleted', 'N')
      .limit(limit)
      .offset(offset);
  }

  getUserTotal(db: Knex, q = '') {
    return db('um_users as uu')
      .count('* as count')
      .join('um_titles as ut', 'ut.id', 'uu.title_id')
      .where('uu.is_deleted', 'N')
      .where((v) => {
        v.where('uu.username', 'like', '%' + q + '%')
        v.orWhere('ut.name', 'like', '%' + q + '%')
        v.orWhere('uu.lname', 'like', '%' + q + '%')
      });
  }

  getUserById(db: Knex, id: any) {
    return db('um_users')
      .where('is_deleted', 'N')
      .where('id', id);
  }

  updateUser(db: Knex, id: any, data = {}) {
    return db('um_users')
      .update(data)
      .where('id', id);
  }

  insertUser(db: Knex, data = {}) {
    return db('um_users')
      .insert(data);
  }

  deleteUser(db: Knex, id: any) {
    return db('um_users')
      .update('is_deleted', 'Y')
      .where('id', id);
  }

  getListUser(db: Knex, hospcode: any, query = '') {
    const _query = `%${query}%`;
    return db('um_users as u')
      .select('u.id', 'u.username', 'ut.name as title_name', 'u.fname', 'u.lname', 'up.name as position_name', 'u.telephone')
      .join('um_titles as ut', 'ut.id', 'u.title_id')
      .join('um_positions as up', 'up.id', 'u.position_id')
      .where('u.hospcode', hospcode)
      .where('u.is_deleted', 'N')
      .where((w) => {
        w.orWhere('u.username', 'like', _query)
        w.orWhere('ut.name', 'like', _query)
        w.orWhere('u.fname', 'like', _query)
        w.orWhere('u.lname', 'like', _query)
        w.orWhere('up.name', 'like', _query)
        w.orWhere('u.telephone', 'like', _query)
      });
  }



}