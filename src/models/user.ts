import * as Knex from 'knex';

export class UserModel {

  getUser(db: Knex, limit = 100, offset = 0, q = '') {
    return db('um_users as u')
      .select('u.*', 'h.hospname','up.name as position','ut.name as prename')
      .leftJoin('b_hospitals as h', 'h.hospcode', 'u.hospcode')
      .join('um_positions as up','up.id','u.position_id')
      .join('um_titles as ut','ut.id','u.title_id')
      .where((v) => {
        v.where('u.username', 'like', '%' + q + '%')
        v.orWhere('u.fname', 'like', '%' + q + '%')
        v.orWhere('u.lname', 'like', '%' + q + '%')
        v.orWhere('h.hospname', 'like', '%' + q + '%')
        v.orWhere('u.cid', 'like', '%' + q + '%')
        v.orWhere('u.telephone', 'like', '%' + q + '%')
      })
      .where('u.is_deleted', 'N')
      .limit(limit)
      .offset(offset).orderBy('u.id');
  }

  getUserTotal(db: Knex, q = '') {
    return db('um_users as u')
      .count('* as count')
      .where('u.is_deleted', 'N')
      .where((v) => {
        v.where('u.username', 'like', '%' + q + '%')
        v.orWhere('u.fname', 'like', '%' + q + '%')
        v.orWhere('u.lname', 'like', '%' + q + '%')
        v.orWhere('u.cid', 'like', '%' + q + '%')
        v.orWhere('u.telephone', 'like', '%' + q + '%')
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

  insertLogsUser(db: Knex, data = {}) {
    return db('logs_um_users')
      .insert(data);
  }

  deleteUser(db: Knex, id: any, userId) {
    return db('um_users')
      .update('is_deleted', 'Y')
      .update('updated_by', userId)
      .update('update_date', db.fn.now())
      .where('id', id);
  }

  getListUser(db: Knex, hospcode: any, query = '') {
    const _query = `%${query}%`;
    return db('um_users as u')
      .select('u.id', 'u.username', 'ut.name as title_name', 'u.fname', 'u.lname', 'up.name as position_name', 'u.telephone', 'bh.id as hospital_id')
      .join('um_titles as ut', 'ut.id', 'u.title_id')
      .join('um_positions as up', 'up.id', 'u.position_id')
      .join('b_hospitals as bh', 'bh.hospcode', 'u.hospcode')
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

  getUserRight(db: Knex, userId: any, groupName: any) {
    return db('um_group_right as ugr')
      .select('ur.name', 'ur.name_menu', 'ur.id', 'uur.user_id')
      .join('um_group_rights_details as ugrd', 'ugrd.group_id', 'ugr.id')
      .join('um_rights as ur', 'ur.id', 'ugrd.right_id')
      .joinRaw(`LEFT JOIN um_user_rights as uur ON uur.right_id = ugrd.right_id AND uur.user_id = ?`, userId)
      .where('ugr.name', groupName)
      .orderBy('ugrd.id')
  }

  deleteUserRight(db: Knex, id: any) {
    return db('um_user_rights')
      .delete()
      .where('user_id', id)
  }

  insertUserRight(db: Knex, data: any) {
    return db('um_user_rights')
      .insert(data)
  }

}