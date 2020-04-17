/// <reference path="../../typings.d.ts" />

import * as express from 'express';
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import * as crypto from 'crypto';

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

router.post('/upload-supplie', upload.any(), async (req: Request, res: Response) => {
  res.send({ ok: true, code: HttpStatus.OK });
});

router.post('/supplie', async (req: Request, res: Response) => {

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

      if (data.isProvince === 'N') {
        if (data.isNodeDrugs || data.isNodeSupplies) {
          data.right = ['STAFF_COVID_CASE', 'STAFF_COVID_CASE_STATUS', 'STAFF_COVID_CASE_REQUISITION', 'STAFF_PAY', 'STAFF_STOCK_SUPPLIES', 'STAFF_SETTING_USERS', 'STAFF_SETTING_BASIC', 'STAFF_SETTING_BEDS', 'STAFF_SETTING_VENTILATORS', 'STAFF_SETTING_PROFESSIONAL', 'STAFF_PRODUCT_RESRRVE']
          if (data.isDRUGS) {
            data.right.push('STAFF_COVID_CASE_DRUGS_APPROVED')
          }
          if (data.isSupplies) {
            data.right.push('STAFF_COVID_CASE_SUPPLIES_APPROVED')
          }
        } else {
          data.right = ['STAFF_COVID_CASE', 'STAFF_COVID_CASE_STATUS', 'STAFF_COVID_CASE_REQUISITION', 'STAFF_PAY', 'STAFF_STOCK_SUPPLIES', 'STAFF_SETTING_USERS', 'STAFF_SETTING_BASIC', 'STAFF_SETTING_BEDS', 'STAFF_SETTING_VENTILATORS', 'STAFF_SETTING_PROFESSIONAL']
        }
      } else {
        data.right = ['STAFF_CHECK_DRUGS', 'STAFF_CHECK_SUPPLIES', 'STAFF_CHECK_BEDS', 'STAFF_SETTING_BASIC']
        if (data.isNodeDrugs || data.isNodeSupplies) {
          if (data.isDRUGS) {
            data.right.push('STAFF_COVID_CASE_DRUGS_APPROVED')
          }
          if (data.isSupplies) {
            data.right.push('STAFF_COVID_CASE_SUPPLIES_APPROVED')
          }
        } 
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
      res.send({ ok: false, error: 'username นี้ถูกใช้งานแล้ว', code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: error.message, code: HttpStatus.OK });
    }
  }
});


router.post('/req-otp', async (req: Request, res: Response) => {

  let tel = req.body.tel

  try {
    let rs: any = await registerModel.reqOTP(tel);
    res.send(rs);
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});

router.post('/verify-otp', async (req: Request, res: Response) => {
  let refCode = req.body.refCode
  let otp = req.body.otp
  try {
    let rs: any = await registerModel.verifyOTP(refCode, otp);
    res.send(rs);
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.OK });
  }
});
export default router;