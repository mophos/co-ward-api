import * as Knex from 'knex';

export class UserModel {

  getUser(db: Knex, limit = 100, offset = 0, q = '') {
    return db('users') 
    .where((v)=>{
      v.where('username', 'like', '%' + q + '%')
      v.orWhere('fname', 'like', '%' + q + '%')
      v.orWhere('lname', 'like', '%' + q + '%')
    })
    .limit(limit)
    .offset(offset);
  }
  
  getUserTotal(db: Knex, q = '') {
    return db('users') 
    .count()
    .where((v)=>{
      v.where('username', 'like', '%' + q + '%')
      v.orWhere('pname', 'like', '%' + q + '%')
      v.orWhere('lname', 'like', '%' + q + '%')
    });
  }

  getUserById(db: Knex, id: number) {
    return db('users')
      .where('id', id);
  }

  updateUser(db: Knex, id: number, data = {}) {
    return db('users')
      .update(data)
      .where('id', id);
  }

  insertUser(db: Knex, data = {}) {
    return db('users')
      .insert(data);
  }

  deleteUser(db: Knex, id: number) {
    return db('users')
      .delete()
      .where('id', id);
  }

}