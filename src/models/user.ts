import * as Knex from 'knex';

export class UserModel {

  getUser(db: Knex) {
    return db('user');
  }

  getUserById(db: Knex, id: number) {
    return db('user')
      .where(id);
  }

  updateUser(db: Knex, id: number, data = {}) {
    return db('user')
      .update(data)
      .where(id);
  }

  insertUser(db: Knex, data = {}) {
    return db('user')
      .insert(data);
  }

  deleteUser(db: Knex, id: number) {
    return db('user')
      .delete()
      .where(id);
  }

}