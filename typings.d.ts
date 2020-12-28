import * as Knex from 'knex';

declare module 'express' {
  interface Request {
    db: any // Actually should be something like `multer.Body`
    dbEOC: any
    dbReport: any
    knex: Knex,
    decoded: any, // Actually should be something like `multer.Files`
    files: any,
    dbOTP: any
  }
}