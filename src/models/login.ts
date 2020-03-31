import * as Knex from 'knex';

export class Login {
  login(db: Knex, username: string, password: string) {
    return db('um_users as u')
      .select('u.*', 'h.hospname', 'h.id as hospital_id', 'h.hosptype_code as type_code', 'h.province_code','ut.name as title_name','up.name as position')
      .leftJoin('l_hospitals as h', 'h.hospcode', 'u.hospcode')
      .leftJoin('um_titles as ut','ut.id','u.title_id')
      .leftJoin('um_positions as up','up.id','u.position_id')
      .where('u.username', username)
      .where('u.password', password)
      .limit(1);
  }
}