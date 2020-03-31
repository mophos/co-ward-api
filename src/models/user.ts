import * as Knex from 'knex';

export class UserModel {

  getUser(db: Knex, limit = 100, offset = 0, q = '') {
    return db('um_users as u') 
    .select('u.*','h.hospname')
    .leftJoin('l_hospitals as h','h.hospcode','u.hospcode')
    .where((v)=>{
      v.where('u.username', 'like', '%' + q + '%')
      v.orWhere('u.fname', 'like', '%' + q + '%')
      v.orWhere('u.lname', 'like', '%' + q + '%')
    })
    .where('u.is_deleted','N')
    .limit(limit)
    .offset(offset);
  }
  
  getUserTotal(db: Knex, q = '') {
    return db('um_users') 
    .count('* as count')
    .where('is_deleted','N')
    .where((v)=>{
      v.where('username', 'like', '%' + q + '%')
      v.orWhere('prename', 'like', '%' + q + '%')
      v.orWhere('lname', 'like', '%' + q + '%')
    });
  }

  getUserById(db: Knex, id: number) {
    return db('um_users')
    .where('is_deleted','N')
      .where('id', id);
  }

  updateUser(db: Knex, id: number, data = {}) {
    return db('um_users')
      .update(data)
      .where('id', id);
  }

  insertUser(db: Knex, data = {}) {
    return db('um_users')
      .insert(data);
  }

  deleteUser(db: Knex, id: number) {
    return db('um_users')
      .where('is_deleted','N')
      .where('id', id);
  }

}