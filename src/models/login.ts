import * as Knex from 'knex';

export class Login {
  login(db: Knex, username: string, password: string) {
    return db('um_users as u')
      .select('u.*', 'h.hospname', 'h.id as hospital_id', 'h.hosptype_code as type_code', 'h.province_code')
      .leftJoin('l_hospitals as h', 'h.hospcode', 'u.hospcode')
      .where('u.username', username)
      .where('u.password', password)
      .limit(1);
  }
}