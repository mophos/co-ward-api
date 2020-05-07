/// <reference path="../../typings.d.ts" />

import * as express from 'express';
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import * as crypto from 'crypto';

import { Login } from '../models/login';
import { Register } from '../models/register';

import { Jwt } from '../models/jwt';

const loginModel = new Login();
const registerModel = new Register();
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
      let right: any = await loginModel.rights(db, rs[0].id);
      let payload: any = {
        fullname: `${rs[0].fname || ''} ${rs[0].lname || ''}`,
        fname: `${rs[0].fname}`,
        lname: `${rs[0].lname}`,
        title_name: `${rs[0].title_name}`,
        id: rs[0].id,
        hospitalId: rs[0].hospital_id,
        hospTypeCode: rs[0].type_code,
        provinceCode: rs[0].province_code,
        type: rs[0].type,
        hospcode: rs[0].hospcode,
        hospname: rs[0].hospname,
        position: rs[0].position,
        email: rs[0].email,
        role: rs[0].role,
        rights: right,
        zone_code: rs[0].zone_code,
        hospitalType: rs[0].hospital_type,
        mqttTopic: process.env.MQTT_TOPIC || 'demo'
      }
      if (+rs[0].hospcode >= 41106 && +rs[0].hospcode <= 41118) {
        payload.providerType = 'ZONE';
      } else if (rs[0].type_code == '01') {
        payload.providerType = 'SSJ';
      } else if (rs[0].type_code == '02') {
        payload.providerType = 'SSA';
      } else if (rs[0].hospital_type == 'HOSPITEL') {
        payload.providerType = 'HOSPITEL';
      } else {
        payload.providerType = 'HOSPITAL';
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

router.get('/get-username', async (req: Request, res: Response) => {
  const db = req.db;
  const cid = req.query.cid;
  const phoneNumber = req.query.phoneNumber;

  try {
    let rs: any = await loginModel.getUsername(db, cid, phoneNumber);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/update-password', async (req: Request, res: Response) => {
  const db = req.db;
  const id = req.body.id;
  const passwordNew = req.body.passwordNew;
  let encPassword = crypto.createHash('md5').update(passwordNew).digest('hex');
  try {
    await loginModel.updatePassword(db, id, encPassword)
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/update-password2', async (req: Request, res: Response) => {
  const db = req.db;
  const id = req.body.id;
  const cid = req.body.cid;
  const passwordNew = req.body.passwordNew;
  let encPassword = crypto.createHash('md5').update(passwordNew).digest('hex');
  try {
    await loginModel.updatePassword(db, id, encPassword)
    const data = {
      cid,
      password: passwordNew
    }
    await registerModel.sendMS(data).then((result) => {
      console.log(result)
    }).catch((err) => {
      console.log(err);
    });
    res.send({ ok: true, code: HttpStatus.OK });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

export default router;