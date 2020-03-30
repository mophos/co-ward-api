/// <reference path="../../typings.d.ts" />

import * as express from 'express';
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import * as crypto from 'crypto';

import { Login } from '../models/login';

import { Jwt } from '../models/jwt';

const loginModel = new Login();
const jwt = new Jwt();

const router: Router = Router();

router.post('/', async (req: Request, res: Response) => {
  let username: string = req.body.username || '';
  let password: string = req.body.password || '';

  let db = req.db;

  try {
    let encPassword = crypto.createHash('md5').update(password).digest('hex');
    let rs: any = await loginModel.login(db, username, encPassword);

    if (rs.length) {

      let payload = {
        fullname: `${rs[0].fname || ''} ${rs[0].lname || ''}`,
        fname: `${rs[0].fname}`,
        lname: `${rs[0].lname}`,
        prename: `${rs[0].prename}`,
        id: rs[0].id,
        hospitalId: rs[0].hospital_id,
        hospitalTypeCode: rs[0].type_code,
        type: rs[0].type,
        hospcode: rs[0].hospcode,
        hospname: rs[0].hospname,
        position: rs[0].position,
        email: rs[0].email,
        role: rs[0].role
      }

      let token = jwt.sign(payload);
      res.send({ ok: true, token: token, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: 'Login failed!', code: HttpStatus.UNAUTHORIZED });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }

});

export default router;