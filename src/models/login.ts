import * as Knex from 'knex';

export class Login {
  login(db: Knex, username: string, password: string) {
    let sql = db('um_users as u')
      .select('u.*', 'h.hospname', 'h.zone_code', 'h.hospital_type', 'h.id as hospital_id', 'h.hosptype_code as type_code', 'h.province_code', 'ut.name as title_name', 'up.name as position')
      .leftJoin('b_hospitals as h', 'h.hospcode', 'u.hospcode')
      .leftJoin('um_titles as ut', 'ut.id', 'u.title_id')
      .leftJoin('um_positions as up', 'up.id', 'u.position_id')
      .where('u.username', username)
      .where('u.password', password)
      .where('h.is_deleted', 'N')
      .where('u.is_deleted', 'N')
      .limit(1);
    return sql;

  }

  rights(db: Knex, userId) {
    return db('um_user_rights as ur')
      .join('um_rights as r', 'ur.right_id', 'r.id')
      .where('ur.user_id', userId);
  }

  getUsername(db: Knex, cid, phoneNumber) {
    return db('um_users as u')
      .select('cid', 'username','id')
      .where('u.cid', cid)
      .where('u.telephone', phoneNumber)
  }

  updatePassword(db: Knex, id, encPassword) {
    return db('um_users as u')
      .update('u.password', encPassword)
      .update('update_date', db.fn.now())
      .where('u.id', id);
  }

  saveLog(db: Knex, data) {
    return db('sys_login_logs')
      .insert(data);
  }

  getUserByPhone(db: Knex, phoneNumber) {
    return db('users as u')
      .where('u.username', phoneNumber)
  }
}