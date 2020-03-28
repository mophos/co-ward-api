import * as Knex from 'knex';

export class Login {
  login(db: Knex, username: string, password: string) {
    if (username == 'admin') {
      return [{ first_name: 'admin', last_name: 'admin', type: 'ADMIN', user_id: 1 }]
    } else if (username == 'staff') {
      return [{ fullname: 'staff', last_name: 'staff', type: 'STAFF', user_id: 2 }]
    } else {
      return []
    }
    // return db('users')
    //   .where('username', username)
    //   .where('password', password)
    //   .limit(1);
  }
}