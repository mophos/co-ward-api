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

router.get('/hospcode/autocomplete/search', async (req: Request, res: Response) => {
  const db = req.db;
  const query = req.query.q;
  const length = req.query.length || 1;
  try {
    if (query.length >= length) {
      const rs = await registerModel.autocompleteHospital(db, query);
      if (rs.length) {
        res.send(rs);
      } else {
        res.send([]);
      }
    } else {
      res.send([]);
    }
  } catch (error) {
    res.send([]);
  }
});

router.post('/upload-supplie', upload.any(), async (req: Request, res: Response) => {
  res.send({ ok: true, code: HttpStatus.OK });
});

router.post('/supplie', async (req: Request, res: Response) => {

  let data = req.body.data;
  let right = data.right

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
        is_province: data.isProvince
      }
      let rs: any = await registerModel.insertUser(req.db, _data);
      let rsRight: any = await registerModel.getRights(req.db, right)
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

export default router;