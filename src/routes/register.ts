/// <reference path="../../typings.d.ts" />

import * as express from 'express';
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import * as crypto from 'crypto';
import * as _ from 'lodash';

import { Register } from '../models/register';

import { Jwt } from '../models/jwt';

const registerModel = new Register();
const jwt = new Jwt();
const router: Router = Router();

// upload files
import * as path from 'path';
import * as fse from 'fs-extra';
import * as multer from 'multer';
const uuidv4 = require('uuid/v4');

const uploadDir = process.env.UPLOAD_DIR + '/register' || './uploads/register';

fse.ensureDirSync(uploadDir);

var storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

let upload = multer({ storage: storage });


router.get('/hopscode', async (req: Request, res: Response) => {

  let hopsCode = req.query.hopsCode

  try {
    let rs: any = await registerModel.getHospCode(req.db, hopsCode);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/get-node-drugs', async (req: Request, res: Response) => {
  let id = req.query.id
  console.log(id);
  try {
    let rs: any = await registerModel.getNodeDrugs(req.db, id);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/get-node-supplies', async (req: Request, res: Response) => {
  let id = req.query.id
  console.log(id);
  try {
    let rs: any = await registerModel.getNodeSupplies(req.db, id);
    res.send({ ok: true, rows: rs, code: HttpStatus.OK });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/get-cid', async (req: Request, res: Response) => {
  let cid = req.query.cid
  console.log(cid);
  try {
    let rs: any = await registerModel.getCid(req.db, cid);
    if (rs.length > 0) {
      res.send({ ok: false, message: 'รหัสบัตรประชาชนซ้้ำกับในระบบ' })
    } else {
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/get-username', async (req: Request, res: Response) => {
  let username = req.query.username
  console.log(username);
  try {
    let rs: any = await registerModel.getUsername(req.db, username);
    if (rs.length > 0) {
      res.send({ ok: false, message: 'Username กับในระบบ' })
    } else {
      res.send({ ok: true, rows: rs, code: HttpStatus.OK });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/upload-supplie', upload.any(), async (req: Request, res: Response) => {
  res.send({ ok: true, code: HttpStatus.OK });
});


router.post('/', async (req: Request, res: Response) => {

  let data = req.body.data;

  try {
    if (('username' in data) && ('password' in data) && ('hospcode' in data) && ('titleId' in data)
      && ('fname' in data) && ('cid' in data) && ('lname' in data) && ('positionId' in data) && ('email' in data) && ('type' in data)
      && ('isProvince' in data) && ('telephone' in data)) {
      let _data = {
        username: data.username,
        password: crypto.createHash('md5').update(data.password).digest('hex'),
        hospcode: data.hospcode,
        title_id: data.titleId,
        cid: data.cid,
        fname: data.fname,
        lname: data.lname,
        position_id: data.positionId,
        email: data.email,
        type: data.type,
        telephone: data.telephone,
        is_province: data.isProvince,
      }

      data.right = [];
      if (data.isNodeSupplies) {
        const rs: any = await registerModel.getGroupRight(req.db, 's')
        data.right = _.map(rs, 'name')
        if (!data.isSupplies) {
          data.right = _.remove(data.right, function (n) {
            return n !== 'STAFF_APPROVED_SUPPLIES';
          });
        }
      } else if (data.isNodeDrugs) {
        const rs: any = await registerModel.getGroupRight(req.db, 'n')
        data.right = _.map(rs, 'name')
        if (!data.isDRUGS) {
          data.right = _.remove(data.right, function (n) {
            return n !== 'STAFF_APPROVED_DRUGS';
          });
        }
      } else {
        const rs: any = await registerModel.getGroupRight(req.db, 'c')
        data.right = _.map(rs, 'name')
      }

      let rs: any = await registerModel.insertUser(req.db, _data);
      let rsRight: any = await registerModel.getRights(req.db, data.right)
      let userRight: any = []
      for (const i of rsRight) {
        userRight.push({
          user_id: rs[0],
          right_id: i.id
        })
      }
      await registerModel.insertUserRights(req.db, userRight)
      res.send({ ok: true, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: 'ข้อมูลไม่ครบ', code: HttpStatus.OK });
    }
  } catch (error) {
    if (error.errno === 1062) {
      res.send({ ok: false, error: 'username หริอ เลขบัตรประชาชน นี้ถูกใช้งานแล้ว', code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: error.message, code: HttpStatus.OK });
    }
  }
});

router.post('/2', async (req: Request, res: Response) => {

  let data = req.body.data;

  try {
    if (('username' in data) && ('password' in data) && ('hospcode' in data) && ('titleId' in data)
      && ('fname' in data) && ('cid' in data) && ('lname' in data) && ('positionId' in data) && ('email' in data) && ('type' in data)
      && ('isProvince' in data) && ('telephone' in data)) {
      let _data = {
        username: data.username,
        password: crypto.createHash('md5').update(data.password).digest('hex'),
        hospcode: data.hospcode,
        title_id: data.titleId,
        cid: data.cid,
        fname: data.fname,
        lname: data.lname,
        position_id: data.positionId,
        email: data.email,
        type: data.type,
        telephone: data.telephone,
        is_province: data.isProvince,
        app_register: 'MS-NCD',
      }

      data.right = ['STAFF_DRUG_NCD'];
      let rs: any = await registerModel.insertUser(req.db, _data);
      let rsRight: any = await registerModel.getRights(req.db, data.right)
      let userRight: any = []
      for (const i of rsRight) {
        userRight.push({
          user_id: rs[0],
          right_id: i.id
        })
      }
      await registerModel.insertUserRights(req.db, userRight)
      await registerModel.sendMS(data).then((result) => {
        console.log(result)
      }).catch((err) => {
        console.log(err);
      });
      res.send({ ok: true, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: 'ข้อมูลไม่ครบ', code: HttpStatus.OK });
    }
  } catch (error) {
    if (error.errno === 1062) {
      res.send({ ok: false, error: 'username หริอ เลขบัตรประชาชน นี้ถูกใช้งานแล้ว', code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: error.message, code: HttpStatus.OK });
    }
  }
});


router.post('/req-otp', async (req: Request, res: Response) => {

  const tel = req.body.tel
  const appId = process.env.OTP_APP_ID;

  try {
    let rs: any = await registerModel.reqOTP(appId, tel);
    res.send(rs);
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/verify-otp', async (req: Request, res: Response) => {
  let transactionId = req.body.transactionId
  const appId = process.env.OTP_APP_ID;
  let otp = req.body.otp
  let tel = req.body.tel
  let vendor = req.body.vendor
  try {
    let rs: any = await registerModel.verifyOTP(appId, tel, otp, transactionId, vendor);
    res.send(rs);
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.get('/tpasdas', async (req: Request, res: Response) => {
  try {
    let rs: any = await registerModel.getUserMedicine(req.db);
    for (const i of rs) {
      await registerModel.sendMS2(i).then((result) => {
        console.log(result)
      }).catch((err) => {
        console.log(err);
      });

    }
    res.send({ ok: true });
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});
export default router;